import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-navy-950">
      <Navbar />
      <section className="relative flex flex-1 items-center overflow-hidden">
        {/* Same grid texture as brand sections — keeps the 404 on-brand */}
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-30" />
        <div className="container-premium relative py-32 text-center">
          <p className="eyebrow justify-center">Error 404</p>
          <h1 className="heading-xl mx-auto max-w-2xl">
            This route doesn&apos;t exist.
          </h1>
          <p className="body-muted mx-auto mt-5 max-w-lg">
            The page you&apos;re looking for has moved or never shipped. Your
            cargo, however, is still on schedule.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/" size="lg">
              Back to home
            </ButtonLink>
            <ButtonLink href="/tracking" variant="outline" size="lg">
              Track a shipment
            </ButtonLink>
            <ButtonLink href="/quote" variant="outline" size="lg">
              GET A QUOTE
            </ButtonLink>
          </div>
          <p className="mt-10 text-sm text-mist-500">
            Looking for something specific?{" "}
            <Link
              href="/services"
              className="text-amber-500 hover:underline"
            >
              Browse services
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-amber-500 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
