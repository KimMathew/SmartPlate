import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PATHS = [
    '/meal-plans',
    '/nutrition',
    '/schedule',
    '/recipes',
    '/profile',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    if (!isProtected) return NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (key) => request.cookies.get(key)?.value,
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/error';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/meal-plans/:path*', '/nutrition/:path*', '/schedule/:path*', '/recipes/:path*', '/profile/:path*'],
};
