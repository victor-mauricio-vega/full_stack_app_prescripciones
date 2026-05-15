import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const PUBLIC_ROUTES = ["/login"];

const ROLE_ROUTES: Record<string, string> = {
  doctor: "/doctor",
  patient: "/patient",
  admin: "/admin",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};