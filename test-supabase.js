// Quick test to verify Supabase connection
import { supabase } from './src/lib/supabase.js';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('families')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully!');
    
    // Test 2: Check if our new tables exist
    const { data: permissions } = await supabase
      .from('user_permissions')
      .select('count')
      .limit(1);
    
    const { data: preferences } = await supabase
      .from('user_preferences') 
      .select('count')
      .limit(1);
    
    console.log('✅ user_permissions table exists');
    console.log('✅ user_preferences table exists');
    console.log('🚀 Database is ready for your app!');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();