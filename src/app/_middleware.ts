
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { type NextRequest } from 'next/server'
const secret = process.env.SECRET;

export async function middleware(req:NextRequest) {
  // Token will exist if the user is logged in
  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;
  // Allow the requests if the following is true...
  // 1) It's a request for next-auth session & provider fetching
  // 2) The token exists
  if (pathname.includes('/api/auth') || pathname.includes('/api/register') || pathname.includes('/email/confirmation') || token) {
    return NextResponse.next();
  }

  if (token && pathname == '/') {
    return NextResponse.redirect('/rag');
  }

  // Otherwise, redirect to login
  if (!token && pathname !== '/login') {
    return NextResponse.redirect('/login');
  }
}
