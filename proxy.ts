// proxy.ts  (replaces middleware.ts)
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [user, pass] = decoded.split(":");

      const validUser = process.env.ADMIN_USER ?? "admin";
      const validPass = process.env.ADMIN_PASS ?? "Cram1234";

      if (user === validUser && pass === validPass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="CRAM Admin", charset="UTF-8"`,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};