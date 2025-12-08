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

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    if (!isProtected) return NextResponse.next();

    // Create a response object to modify cookies
    let response = NextResponse.next();

    // Create a Supabase client with proper cookie methods
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Use the recommended getAll and setAll methods
                getAll: () => {
                    return request.cookies.getAll().map(cookie => ({
                        name: cookie.name,
                        value: cookie.value,
                    }));
                },
                setAll: (cookies) => {
                    cookies.forEach(cookie => {
                        response.cookies.set(cookie);
                    });
                },
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

    return response;
}

export const config = {
    matcher: ['/meal-plans/:path*', '/nutrition/:path*', '/schedule/:path*', '/recipes/:path*', '/profile/:path*'],
};
