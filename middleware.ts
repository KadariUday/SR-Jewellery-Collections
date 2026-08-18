import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract token and role safely from cookies (Strict authorization enforcement)
  const adminToken = request.cookies.get('srj_admin_token')?.value;
  const adminRole = request.cookies.get('srj_role')?.value;

  // Strict Token Validation
  const isValidAdminToken = adminToken === 'token_admin_verified_srj';
  const isAdminRole = adminRole === 'ADMIN';
  const isAuthorizedAdmin = Boolean(isValidAdminToken && isAdminRole);

  // 1. Root /admin or /admin/ redirect
  if (pathname === '/admin' || pathname === '/admin/') {
    if (isAuthorizedAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 2. Prevent already logged-in admin from visiting login page
  if (pathname === '/admin/login') {
    if (isAuthorizedAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Admin protected routes check
  if (pathname.startsWith('/admin')) {
    if (!isAuthorizedAdmin) {
      // Clear spoofed cookies if invalid token/role combination
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      if (!isValidAdminToken || !isAdminRole) {
        response.cookies.delete('srj_admin_token');
        response.cookies.delete('srj_role');
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
