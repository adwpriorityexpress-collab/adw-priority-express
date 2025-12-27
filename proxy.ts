// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

type Role = "customer" | "driver" | "admin";

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/how-it-works") || pathname.startsWith("/drivers");
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
function isAppPath(pathname: string) {
  return pathname === "/app";
}

function normalizeRole(v: any): Role | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "customer" || s === "driver" || s === "admin") return s;
  return null;
}

function homeFor(role: Role, approved: boolean | null) {
  if (role === "driver") return approved ? "/driver/jobs" : "/driver/pending";
  if (role === "customer") return "/customer";
  return "/admin";
}

function copyCookies(from: NextResponse, to: NextResponse) {
  // Copy any Set-Cookie written by Supabase onto redirect responses
  // @ts-ignore
  const all = from.cookies.getAll?.() ?? [];
  for (const c of all) {
    // @ts-ignore
    to.cookies.set(c.name, c.value, c);
  }
}

function redirectWithCookies(req: NextRequest, resWithCookies: NextResponse, toPathname: string) {
  if (toPathname === req.nextUrl.pathname) return resWithCookies;

  const url = req.nextUrl.clone();
  url.pathname = toPathname;
  url.search = "";

  const redirectRes = NextResponse.redirect(url);
  redirectRes.headers.set("Cache-Control", "no-store");
  copyCookies(resWithCookies, redirectRes);
  return redirectRes;
}

function redirectToLogin(req: NextRequest, resWithCookies: NextResponse) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  const qs = req.nextUrl.searchParams.toString();
  url.searchParams.set("next", req.nextUrl.pathname + (qs ? `?${qs}` : ""));

  const redirectRes = NextResponse.redirect(url);
  redirectRes.headers.set("Cache-Control", "no-store");
  copyCookies(resWithCookies, redirectRes);
  return redirectRes;
}

async function fetchProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { ok: false as const, role: null as Role | null, approved: null as boolean | null };
  }

  return {
    ok: true as const,
    role: normalizeRole(data.role),
    approved: typeof data.approved === "boolean" ? data.approved : null,
  };
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Base response that Supabase can write refreshed cookies into
  let res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
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

  // ✅ Public routes always accessible
  if (isPublicPath(pathname)) return res;

  // ✅ Logged out → block protected routes
  if (!user) {
    if (isProtected) return redirectToLogin(req, res);
    return res;
  }

  // ✅ Logged-in users hitting auth pages go to /app
  if (isAuthPath(pathname)) {
    return redirectWithCookies(req, res, "/app");
  }

  // ✅ Fetch role/approved from DB as source of truth
  const p = await fetchProfile(supabase, user.id);

  // If session exists but we can't read profile, don't "pretend customer".
  // This is the exact thing causing your /customer loops until cookies are cleared.
  if (!p.ok || !p.role) {
    return redirectToLogin(req, res);
  }

  const role = p.role;
  const approved = p.approved;

  // ✅ /app routes to the right dashboard
  if (isAppPath(pathname)) {
    return redirectWithCookies(req, res, homeFor(role, approved));
  }

  // ✅ Role gates
  if (isCustomerPath(pathname) && role !== "customer") {
    return redirectWithCookies(req, res, homeFor(role, approved));
  }
  if (isDriverPath(pathname) && role !== "driver") {
    return redirectWithCookies(req, res, homeFor(role, approved));
  }
  if (isAdminPath(pathname) && role !== "admin") {
    return redirectWithCookies(req, res, homeFor(role, approved));
  }

  // ✅ Unapproved drivers can ONLY access /driver/pending
  if (role === "driver" && approved === false && pathname !== "/driver/pending") {
    return redirectWithCookies(req, res, "/driver/pending");
  }

  return res;
}
