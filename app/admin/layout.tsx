export const metadata = {
  title: "Admin — Satguru Transport",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-navy-950">{children}</div>;
}
