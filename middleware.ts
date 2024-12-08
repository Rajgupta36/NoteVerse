import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define your public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/collabrate(.*)',
  '/publish(.*)',
  '/preview(.*)',
  '/clsign-in(.*)',       // Sign-in page (already public)
  '/sign-up(.*)',
  '/api/edgestore(.*)',
  '/api/notes(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
