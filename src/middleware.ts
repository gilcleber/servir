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

    // Public Routes (Login, Public Assets, Repair)
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/repair')) {
        return response
    }

    // Protected Routes Check
    if (!user) {
        return NextResponse.redirect(new URL('/login/volunteer', request.url))
    }

    // Role-Based Access Control (RBAC)
    // Default to 'volunteer' only if explicitly set or if profile confirmed (simplified here)
    // If undefined, we might be in a race condition.
    const userRole = user.user_metadata?.role || 'volunteer'

    // Volunteer trying to access Leader pages
    // Only redirect if we are SURE it's a volunteer (e.g. metadata says so)
    if (path.startsWith('/leader') && userRole !== 'leader') {
        // If metadata is missing/wrong, they go here. 
        // The login fix above should solve this for next login.
        return NextResponse.redirect(new URL('/volunteer', request.url))
    }

    // Logic for Leader/Admin accessing volunteer pages is usually allowed (or redirect to leader dash)
    // For now, restrict strictly
    // if (path.startsWith('/volunteer') && userRole !== 'volunteer') {
    //    return NextResponse.redirect(new URL('/leader', request.url))
    // }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
