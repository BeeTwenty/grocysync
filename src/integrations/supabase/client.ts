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
  try {
    console.log('Trying to sign in with display name:', emailOrDisplayName);
    
    // Query for profile with display name
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('display_name', emailOrDisplayName);
  
    // If no user found with this display name or error occurred, return original error
    if (profileError) {
      console.error('Error querying profiles:', profileError);
      return { data: null, error: emailSignInError };
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profile found for display name:', emailOrDisplayName);
      return { data: null, error: emailSignInError };
    }

    // Get the first matching profile
    const userData = profiles[0];
    console.log('Found profile for display name:', userData);

    if (!userData.email) {
      console.error('No email found for user with display name:', emailOrDisplayName);
      return { data: null, error: emailSignInError };
    }

    // If we found a user with this display name, try to sign in with their email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password,
    });

    if (error) {
      console.error('Error signing in with email from display name:', error);
    } else {
      console.log('Successfully signed in with display name');
    }

    return { data, error };
  } catch (error) {
    console.error("Error in profile lookup:", error);
    return { data: null, error: emailSignInError };
  }
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

  console.log('Starting display name update process for user:', user.id);
  console.log('New display name:', displayName);

  try {
    // Step 1: Directly update the user's metadata with the new display name
    // This should update the name field in user_metadata in auth.users
    const { data: userData, error: userError } = await supabase.auth.updateUser({
      data: { name: displayName }
    });

    if (userError) {
      console.error('Error updating user metadata:', userError);
      return { data: null, error: userError };
    }

    console.log('Auth.updateUser completed successfully');
    console.log('User metadata after direct update:', userData?.user.user_metadata);

    // Step 2: Call our SQL function to update the display name in auth.users table
    // This ensures the raw_user_meta_data in auth.users table is updated properly
    const { error: functionError } = await supabase.rpc('update_user_display_name', {
      user_id_param: user.id,
      display_name_param: displayName
    });
    
    if (functionError) {
      console.error('Error updating auth.users table:', functionError);
    } else {
      console.log('Auth users table updated successfully with display name:', displayName);
    }
    
    // Step 3: Update the user's profile in our profiles table
    // This makes the display name available for queries via the profiles table
    await upsertUserProfile(user.id, user.email || '', displayName);
    
    // Log successful update for debugging
    console.log('Display name updated in all places:', displayName);
    
    // Step 4: Force a refresh of the session to ensure updated metadata is available
    // This is critical for seeing the changes immediately in the Supabase admin UI
    console.log('Refreshing session to update metadata...');
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Error refreshing session after display name update:', refreshError);
    } else {
      console.log('Session refreshed successfully after display name update');
      
      // Verify the updated metadata after refresh
      const { data: verifyData } = await supabase.auth.getSession();
      console.log('Verified session metadata after refresh:', 
        verifyData?.session?.user?.user_metadata);
    }
    
    return { data: userData, error: null };
  } catch (error) {
    console.error('Unexpected error in display name update process:', error);
    return { data: null, error: error as Error };
  }
};

// Helper functions to manage user profiles
export const createUserProfile = async (userId: string, email: string, displayName: string) => {
  console.log('Creating profile for:', userId, email, displayName);
  // Use RPC call with type assertion to fix TypeScript error
  return await supabase
    .rpc('create_profile', {
      user_id_param: userId,
      email_param: email,
      display_name_param: displayName
    } as any);
};

export const upsertUserProfile = async (userId: string, email: string, displayName: string) => {
  console.log('Upserting profile for:', userId, email, displayName);
  // Use RPC call with type assertion to fix TypeScript error
  return await supabase
    .rpc('upsert_profile', {
      user_id_param: userId,
      email_param: email,
      display_name_param: displayName
    } as any);
};

export const getUserByDisplayName = async (displayName: string) => {
  // Use RPC call with type assertion to fix TypeScript error
  const { data, error } = await supabase
    .rpc('get_profile_by_display_name', {
      display_name_param: displayName
    } as any);
  
  return { data, error };
};
