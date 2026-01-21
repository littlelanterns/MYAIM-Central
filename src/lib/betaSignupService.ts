import { supabase } from './supabase';

export interface BetaSignupData {
  email: string;
  password: string;
  familyName: string;
  familyLoginName: string;
}

export interface BetaSignupResult {
  success: boolean;
  error?: string;
  userId?: string;
  familyId?: string;
}

/**
 * Create a new beta user account with Founding Family status
 */
export async function createBetaAccount(data: BetaSignupData): Promise<BetaSignupResult> {
  try {
    // Step 1: Create user in auth.users
    // Note: We don't set is_beta_user in metadata because it triggers a database
    // function that has issues. We handle beta_users table insertion manually below.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          signup_source: 'beta_marketing_site'
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);

      // Provide user-friendly error messages
      let userMessage = authError.message;
      if (authError.message.includes('already registered') ||
          authError.message.includes('already been registered') ||
          authError.message.includes('User already exists')) {
        userMessage = 'An account with this email already exists. Please login instead, or use a different email address.';
      } else if (authError.message.includes('invalid email') ||
                 authError.message.includes('Invalid email')) {
        userMessage = 'Please enter a valid email address.';
      } else if (authError.message.includes('password')) {
        userMessage = 'Password must be at least 6 characters long.';
      }

      return {
        success: false,
        error: userMessage
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }

    // Step 2: Create family record with founding family status
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        family_name: data.familyName,
        family_login_name: data.familyLoginName.toLowerCase().trim(),
        auth_user_id: authData.user.id,
        is_founding_family: true,
        founding_family_joined_at: new Date().toISOString(),
        membership_status: 'active',
        subscription_tier: 'enhanced' // Start with Enhanced tier during beta
      })
      .select()
      .single();

    if (familyError) {
      console.error('Family creation error:', familyError);
      console.error('Error details:', JSON.stringify(familyError, null, 2));
      return {
        success: false,
        error: `Failed to create family record: ${familyError.message || familyError.code || 'Unknown error'}`
      };
    }

    // Step 3: Create primary family member record
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: familyData.id,
        auth_user_id: authData.user.id,
        name: 'Primary Parent', // Placeholder - updated in ForcedFamilySetup wizard
        role: 'primary_organizer',
        display_title: 'Mom', // Can be changed later in setup
        is_primary_parent: true,
        dashboard_mode: 'family'
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      return {
        success: false,
        error: 'Failed to create member profile. Please contact support.'
      };
    }

    // Step 4: Add to beta_users table (manual insertion since we bypassed the trigger)
    const { error: betaError } = await supabase
      .from('beta_users')
      .insert({
        user_id: authData.user.id,
        status: 'active',
        beta_tier: 'founding_family',
        setup_completed: false
      });

    if (betaError) {
      // Log but don't fail - the account is created, beta tracking is secondary
      console.warn('Beta users tracking insert failed:', betaError);
    }

    return {
      success: true,
      userId: authData.user.id,
      familyId: familyData.id
    };

  } catch (error: any) {
    console.error('Beta signup error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Check how many founding families exist (for displaying spots remaining)
 */
export async function getFoundingFamilyCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_family', true);

    if (error) {
      console.error('Error counting founding families:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting founding family count:', error);
    return 0;
  }
}

/**
 * Check if founding family spots are still available
 */
export async function areFoundingSpotsAvailable(): Promise<boolean> {
  const count = await getFoundingFamilyCount();
  return count < 100;
}

/**
 * Check if a family login name is available
 * @param loginName - The login name to check
 * @param excludeFamilyId - Optional family ID to exclude (for editing existing family)
 */
export async function checkFamilyLoginNameAvailable(
  loginName: string,
  excludeFamilyId?: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const normalizedName = loginName.toLowerCase().trim();

    // Validate format: 3-30 chars, lowercase letters, numbers, hyphens, &, _, !
    // Must start with a letter
    const validFormat = /^[a-z][a-z0-9\-&_!]{2,29}$/.test(normalizedName);
    if (!validFormat) {
      return {
        available: false,
        error: 'Must be 3-30 characters, start with a letter. Allowed: letters, numbers, hyphens, &, _, !'
      };
    }

    // Query database to check availability
    let query = supabase
      .from('families')
      .select('id', { count: 'exact', head: true })
      .eq('family_login_name', normalizedName);

    // Exclude current family if editing
    if (excludeFamilyId) {
      query = query.neq('id', excludeFamilyId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error checking family login name:', error);
      return {
        available: false,
        error: 'Unable to verify availability. Please try again.'
      };
    }

    return {
      available: count === 0
    };
  } catch (error) {
    console.error('Error checking family login name availability:', error);
    return {
      available: false,
      error: 'An unexpected error occurred'
    };
  }
}
