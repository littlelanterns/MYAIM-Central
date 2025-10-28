import { supabase } from './supabase';

export interface BetaSignupData {
  email: string;
  password: string;
  familyName: string;
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          is_beta_user: true,
          signup_source: 'beta_marketing_site'
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }

    // Step 2: Create family record with is_founding_family: true
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        family_name: data.familyName,
        primary_organizer_id: authData.user.id,
        is_founding_family: true,
        founding_family_joined_at: new Date().toISOString(),
        membership_status: 'active',
        subscription_tier: 'enhanced' // Start with Enhanced tier during beta
      })
      .select()
      .single();

    if (familyError) {
      console.error('Family creation error:', familyError);
      // Clean up: delete the user we just created (optional, might want to keep for debugging)
      return {
        success: false,
        error: 'Failed to create family record. Please try again.'
      };
    }

    // Step 3: Create primary family member record
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: familyData.id,
        auth_user_id: authData.user.id,
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
