export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy-600 border-t-amber-500" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
