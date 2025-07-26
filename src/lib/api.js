// src/lib/api.js - Enhanced with family setup functions
import { supabase } from './supabase';

// Existing function
export async function getTasksForFamily(familyId) {
  console.log('Fetching tasks for family:', familyId);
  // Real database logic will go here
  return []; // Return empty array for now
}

// NEW: Save family setup (family name and basic info)
export async function saveFamilySetup(familyData) {
  try {
    console.log('Saving family setup:', familyData);
    
    // First, check if family already exists for this user
    const { data: existingFamily, error: checkError } = await supabase
      .from('families')
      .select('id')
      .eq('wordpress_user_id', familyData.wordpress_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let familyId;
    
    if (existingFamily) {
      // Update existing family
      const { data, error } = await supabase
        .from('families')
        .update({
          family_name: familyData.family_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFamily.id)
        .select()
        .single();
        
      if (error) throw error;
      familyId = data.id;
    } else {
      // Create new family
      const { data, error } = await supabase
        .from('families')
        .insert([{
          wordpress_user_id: familyData.wordpress_user_id,
          family_name: familyData.family_name,
          subscription_tier: familyData.subscription_tier || 'basic'
        }])
        .select()
        .single();
        
      if (error) throw error;
      familyId = data.id;
    }

    return { success: true, familyId };
  } catch (error) {
    console.error('Error saving family setup:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Save individual family member
export async function saveFamilyMember(memberData) {
  try {
    console.log('Saving family member:', memberData);
    
    // Calculate age from birthday if provided
    let age = null;
    if (memberData.birthday) {
      const birthDate = new Date(memberData.birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Prepare member data for database
    const dbMemberData = {
      family_id: memberData.family_id,
      name: memberData.name,
      role: memberData.relationship === 'special' ? memberData.customRole : memberData.relationship,
      age: age,
      birthday: memberData.birthday || null,
      nicknames: memberData.nicknames || [],
      access_level: memberData.accessLevel || 'guided',
      in_household: memberData.inHousehold !== undefined ? memberData.inHousehold : true,
      permissions: memberData.permissions || {},
      notes: memberData.notes || ''
    };

    if (memberData.id && typeof memberData.id === 'string' && memberData.id.includes('-')) {
      // This is an existing member with a real UUID - update
      const { data, error } = await supabase
        .from('family_members')
        .update(dbMemberData)
        .eq('id', memberData.id)
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, member: data };
    } else {
      // This is a new member - insert
      const { data, error } = await supabase
        .from('family_members')
        .insert([dbMemberData])
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, member: data };
    }
  } catch (error) {
    console.error('Error saving family member:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Get family members for a family
export async function getFamilyMembers(familyId) {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return { success: true, members: data };
  } catch (error) {
    console.error('Error fetching family members:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Get family info by user ID
export async function getFamilyByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('wordpress_user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, family: data };
  } catch (error) {
    console.error('Error fetching family:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Delete family member
export async function deleteFamilyMember(memberId) {
  try {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting family member:', error);
    return { success: false, error: error.message };
  }
}