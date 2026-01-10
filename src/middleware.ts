import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Public Routes
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) {
        // If logged in, redirect to appropriate dashboard
        if (user) {
            // Fetch role to decide where to go
            // We can't easily fetch DB in middleware (performance).
            // Check local storage or cookie? Or just let them go to the page and let the page redirect?
            // Better: let them access login, but maybe sidebar handles it.
            // For MVP, if user is present, we could check metadata if we put role there.
            // Let's skip auto-redirect from login for now to keep it simple and safe.
        }
        return response
    }

    // Protected Routes
    if (!user) {
        return NextResponse.redirect(new URL('/login/volunteer', request.url))
    }

    // Role Protection (Simplified)
    // If fetching DB is needed, we usually do it in Layout or Page, not Middleware.
    // Middleware mainly ensures "Authenticated".

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
