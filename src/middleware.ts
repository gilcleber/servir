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

    // Public Routes (Login, Public Assets)
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) {
        return response
    }

    // Protected Routes Check
    if (!user) {
        return NextResponse.redirect(new URL('/login/volunteer', request.url))
    }

    // Role-Based Access Control (RBAC)
    const userRole = user.user_metadata?.role || 'volunteer'

    // Volunteer trying to access Leader pages
    if (path.startsWith('/leader') && userRole === 'volunteer') {
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
