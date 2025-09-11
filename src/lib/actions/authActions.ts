'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(
  prevState: { message: string },
  formData: FormData
) {
  const supabase = createServerActionClient({ cookies });

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message };
  }

  // ✅ verify user after login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Login failed. Please try again.' };
  }

  // ✅ guaranteed to have session
  redirect('/polls');
}

export async function signup(prevState: { message: string }, formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return { message: error.message }
  }

  redirect('/login?message=Please check your email to confirm your account')
}
