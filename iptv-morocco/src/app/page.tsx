// Root page — not normally served because the middleware catches `/` and routes to `[locale]/page.tsx`.
// Kept as a redirect fallback in case middleware is ever disabled for this path.
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/ar');
}
