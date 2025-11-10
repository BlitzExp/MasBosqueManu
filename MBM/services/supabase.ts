import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = "https://cgdapnfobwxopqwowamr.supabase.co"
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZGFwbmZvYnd4b3Bxd293YW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjA5NDIsImV4cCI6MjA3ODAzNjk0Mn0.JU-z0XIxL0pb-amOXGKGhDgycA3ITVmf3d1JaK-_mJY"

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);