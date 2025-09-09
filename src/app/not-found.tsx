import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">Station not found</h1>
      <p className="mt-2 text-slate-600">
        We couldn’t find that ASOS station or it has no historical data.
      </p>
      <div className="mt-6">
        <Link href="/" className="text-blue-600 underline">
          ← Back to map
        </Link>
      </div>
    </div>
  );
}