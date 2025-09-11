'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/actions/authActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";


const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full py-6 text-lg" disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState(login, initialState);
  const { user } = useAuth();
  const [hasReloaded, setHasReloaded] = useState(false);
  const router = useRouter();

  const { loading } = useAuth();

  useEffect(() => {
    if (!loading && user && !hasReloaded) {
      console.log("User state set, refreshing session without reload...");
      setHasReloaded(true);
      router.push('/polls'); // Redirect to home or dashboard after login
    }
  }, [user, hasReloaded, loading, router]);

  return (
    <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center p-4'>
      <div className='w-full max-w-lg p-6 sm:p-8 bg-white rounded-xl shadow-lg space-y-8'>
        <div className="space-y-2">
          <h1 className='text-3xl font-bold text-center'>Welcome Back</h1>
          <p className="text-center text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        {state?.message && <p className='text-red-500 text-center bg-red-50 p-4 rounded-lg'>{state.message}</p>}
        <form action={formAction} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                className='mt-2 block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Password
              </label>
              <div className="relative">
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  className='mt-2 block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <SubmitButton />
        </form>
        <p className='text-sm text-center text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            href='/sign-up'
            className='font-semibold text-indigo-600 hover:text-indigo-500'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}