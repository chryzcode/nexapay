'use server';

import { cookies } from 'next/headers';

export async function toggleTheme() {
  const cookieStore = cookies();
  const currentTheme = cookieStore.get('theme')?.value || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  cookieStore.set('theme', newTheme, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  return { theme: newTheme };
} 