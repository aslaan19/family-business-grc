// middleware.ts  (place in project root, next to app/)
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Only protect /admin routes
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [user, pass] = decoded.split(":");

      const validUser = process.env.ADMIN_USER ?? "aslandev@gmai";
      const validPass = process.env.ADMIN_PASS ?? "aslan";

      if (user === validUser && pass === validPass) {
        return NextResponse.next();
      }
    }
  }

  // Prompt browser for credentials
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="KARAM Admin", charset="UTF-8"`,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};