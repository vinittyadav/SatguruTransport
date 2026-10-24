import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="heading-md">Admin portal</h1>
          <p className="body-muted mt-2 text-sm">
            Sign in with your Satguru operations account.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <form action={signIn} className="mt-6 space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="admin@satgurutransport.in"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-mist-500">
          <Link href="/" className="hover:text-mist-300">
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
