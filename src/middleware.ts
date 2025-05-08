import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProjectedRoute = createRouteMatcher([
  "/studio(.*)", // studio路由下的所有路由都需要保护
]);

export default  clerkMiddleware(async (auth, req) => {
  if(isProjectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};