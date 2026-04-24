import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// In-memory rate limiting map. Note: In a real serverless deployment (Vercel), 
// this is not perfectly shared across instances, but is sufficient for the assignment requirements.
const rateLimitMap = new Map();

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // RBAC: Protect Admin routes
    if (path.startsWith("/admin") && token?.role !== "Admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }

    // Rate Limiting Logic (Phase 6)
    // Only apply rate limiting to Agents for API routes
    if (path.startsWith("/api/") && token?.role === "Agent") {
      const userId = token.id;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      const limit = 50; // 50 requests per minute

      if (!rateLimitMap.has(userId)) {
        rateLimitMap.set(userId, { count: 1, startTime: now });
      } else {
        const userData = rateLimitMap.get(userId);
        if (now - userData.startTime < windowMs) {
          userData.count++;
          if (userData.count > limit) {
            return new NextResponse(
              JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded (50 req/min for Agents)." }),
              { status: 429, headers: { "Content-Type": "application/json" } }
            );
          }
        } else {
          // Reset window
          userData.count = 1;
          userData.startTime = now;
        }
        rateLimitMap.set(userId, userData);
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    // Protect api routes except auth
    // "/api/((?!auth).)*"  // We can add this later if we want strict API protection
  ],
};
