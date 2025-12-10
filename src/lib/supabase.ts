// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found.');
}

export { supabase };

export const isSupabaseConfigured = () => supabase !== null;

// Auth helpers
export const supabaseAuth = {
  // Sign up with email/password and save username to profiles
  signUp: async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    // First register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name: username }
      }
    });
    
    if (error) throw error;
    
    // Save username mapping to profiles table
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        username: username.toLowerCase(),
        name: username,
      });
    }
    
    return data;
  },

  // Sign in with username or email
  signIn: async (usernameOrEmail: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    let email = usernameOrEmail;
    
    // If it doesn't look like an email, try to find email by username
    if (!usernameOrEmail.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', usernameOrEmail.toLowerCase())
        .single();
      
      if (profile?.email) {
        email = profile.email;
      } else {
        throw new Error('Tên người dùng không tồn tại');
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getUser: async () => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
