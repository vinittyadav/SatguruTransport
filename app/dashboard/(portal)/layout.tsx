import { redirect } from "next/navigation";
import { getCustomerIdentity } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Customer portal — Satguru Transport",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getCustomerIdentity();

  if (!identity) {
    redirect("/dashboard/login");
  }

  return (
    <DashboardShell email={identity.email}>{children}</DashboardShell>
  );
}
