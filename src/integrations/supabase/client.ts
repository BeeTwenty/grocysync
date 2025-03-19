
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lsrbeymronxrrgwekevc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcmJleW1yb254cnJnd2VrZXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzODk4NjAsImV4cCI6MjA1Nzk2NTg2MH0.AdQabFjdOyr81EbHRS5Rx7-ZxafaAkE3beDAWfoT_Bo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Authentication helper functions
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session.user;
};

export const getUserDisplayName = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // First check if user_metadata has a name field
  if (user.user_metadata && user.user_metadata.name) {
    return user.user_metadata.name;
  }
  
  // Fall back to email if no display name is set
  return user.email;
};

export const signIn = async (emailOrDisplayName: string, password: string) => {
  // First try to sign in with email
  const { data: emailSignInData, error: emailSignInError } = await supabase.auth.signInWithPassword({
    email: emailOrDisplayName,
    password,
  });

  // If successful with email, return the result
  if (!emailSignInError) {
    return { data: emailSignInData, error: null };
  }

  // If email sign-in fails, check if it's a display name
  // Get all users with this display name
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('display_name', emailOrDisplayName)
    .single();

  // If no user found with this display name, return original error
  if (userError || !userData) {
    return { data: null, error: emailSignInError };
  }

  // If we found a user with this display name, try to sign in with their email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const isUserAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Check if user has admin role in metadata
  return user.app_metadata?.role === 'admin';
};

export const createUserByAdmin = async (email: string, password: string, role: 'admin' | 'user' = 'user', displayName?: string) => {
  const metadata = { role };
  
  // Add display name if provided
  const userMetadata = displayName ? { name: displayName } : undefined;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: metadata,
    user_metadata: userMetadata,
  });

  // If user was created successfully and display name was provided, add to profiles table
  if (!error && data && displayName) {
    await createUserProfile(data.user.id, email, displayName);
  }
  
  return { data, error };
};

export const updateUserDisplayName = async (displayName: string) => {
  const user = await getCurrentUser();
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // Update the display name in user_metadata
  const { data: userData, error: userError } = await supabase.auth.updateUser({
    data: { name: displayName }
  });

  // Also update or create the profile in the profiles table
  if (!userError) {
    await upsertUserProfile(user.id, user.email || '', displayName);
  }

  return { data: userData, error: userError };
};

// Helper functions to manage user profiles
export const createUserProfile = async (userId: string, email: string, displayName: string) => {
  return await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email,
      display_name: displayName,
    });
};

export const upsertUserProfile = async (userId: string, email: string, displayName: string) => {
  return await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      email,
      display_name: displayName,
    }, {
      onConflict: 'user_id'
    });
};

export const getUserByDisplayName = async (displayName: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('display_name', displayName)
    .single();
  
  return { data, error };
};
