import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lookupIpLocation, getClientIp } from "@/lib/geo/ip";
import { AREA_COOKIE, serializeAreaCookie } from "@/lib/area-cookie";

export async function middleware(request: NextRequest) {
  if (request.cookies.get(AREA_COOKIE)) {
    return NextResponse.next();
  }

  const ip = getClientIp(request.headers);
  const area = await lookupIpLocation(ip);

  const response = NextResponse.next();
  response.cookies.set(AREA_COOKIE, serializeAreaCookie(area), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};