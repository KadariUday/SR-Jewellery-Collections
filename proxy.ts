import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase server client for SSR cookie handling
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Verify active user session
  const { data: { user } } = await supabase.auth.getUser();

  // Check user role from profile or cookie backup
  const roleCookie = request.cookies.get('srj_role')?.value;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    isAdmin = profile?.role === 'ADMIN' || user.user_metadata?.role === 'ADMIN' || roleCookie === 'ADMIN';
  } else {
    isAdmin = roleCookie === 'ADMIN';
  }

  // 1. Root /admin or /admin/ redirect
  if (pathname === '/admin' || pathname === '/admin/') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 2. Prevent already logged-in admin from visiting admin login page
  if (pathname === '/admin/login') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return response;
  }

  // 3. Admin protected routes check
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      const redirectUrl = new URL('/admin/login', request.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete('srj_admin_token');
      res.cookies.delete('srj_role');
      return res;
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
