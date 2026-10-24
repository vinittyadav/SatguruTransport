import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customerSignIn } from "@/app/dashboard/actions";

export const metadata = {
  title: "Customer sign in — Satguru Transport",
  robots: { index: false, follow: false },
};

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="heading-md">Customer portal</h1>
          <p className="body-muted mt-2 text-sm">
            Sign in to see your shipments, quotes and account details.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <form action={customerSignIn} className="mt-6 space-y-5">
            <input type="hidden" name="next" value={next ?? "/dashboard"} />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-xs leading-relaxed text-mist-500">
            Your account uses the email you provided with your quote or
            booking. First time? Contact us and we'll set you up.
          </p>
        </div>
        <div className="mt-6 space-y-2 text-center text-xs text-mist-500">
          <p>
            <Link href="/tracking" className="hover:text-mist-300">
              Track a shipment without signing in →
            </Link>
          </p>
          <p>
            <Link href="/" className="hover:text-mist-300">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
