// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

type Role = "customer" | "driver" | "admin";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/drivers")
  );
}

function isAuthPath(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

function isCustomerPath(pathname: string) {
  return pathname === "/customer" || pathname.startsWith("/customer/");
}

function isDriverPath(pathname: string) {
  return pathname === "/driver" || pathname.startsWith("/driver/");
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAllowedForUnapprovedDriver(pathname: string) {
  // Keep this tight: only allow the pending page (and static public routes already pass above).
  return pathname === "/driver/pending";
}

function buildNextParam(pathname: string, searchParams: URLSearchParams) {
  const qs = searchParams.toString();
  return pathname + (qs ? `?${qs}` : "");
}

function redirectTo(req: NextRequest, toPathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = toPathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", buildNextParam(req.nextUrl.pathname, req.nextUrl.searchParams));
  return NextResponse.redirect(url);
}

function homeForRole(role: Role | null | undefined, approved: boolean | null | undefined) {
  if (role === "driver") return approved ? "/driver/jobs" : "/driver/pending";
  if (role === "customer") return "/customer";
  if (role === "admin") return "/admin";
  return "/";
}

async function getProfile(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as { role: Role | null; approved: boolean | null } | null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages always allowed
  if (isPublicPath(pathname)) return NextResponse.next();

  // Create a response we can attach cookies to
  let res = NextResponse.next();

  // Supabase SSR client (cookies wired so auth refresh works)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = isCustomerPath(pathname) || isDriverPath(pathname) || isAdminPath(pathname);

  // Not logged in → block protected routes
  if (!user) {
    if (isProtected) return redirectToLogin(req);
    // Allow other non-public, non-protected routes (if you have any)
    return res;
  }

  // Logged in: load profile once (shared for all checks)
  const profile = await getProfile(supabase, user.id);

  // If no profile (should be rare due to trigger) treat as logged-out
  if (!profile?.role) {
    if (isProtected) return redirectToLogin(req);
    return res;
  }

  // Logged in user should not stay on /login or /signup
  if (isAuthPath(pathname)) {
    return redirectTo(req, homeForRole(profile.role, profile.approved));
  }

  // ROLE GATES
  if (isCustomerPath(pathname) && profile.role !== "customer") {
    return redirectTo(req, homeForRole(profile.role, profile.approved));
  }

  if (isDriverPath(pathname) && profile.role !== "driver") {
    return redirectTo(req, homeForRole(profile.role, profile.approved));
  }

  if (isAdminPath(pathname) && profile.role !== "admin") {
    return redirectTo(req, homeForRole(profile.role, profile.approved));
  }

  // DRIVER APPROVAL GATE
  if (profile.role === "driver" && profile.approved === false) {
    if (!isAllowedForUnapprovedDriver(pathname)) {
      return redirectTo(req, "/driver/pending");
    }
  }

  return res;
}
