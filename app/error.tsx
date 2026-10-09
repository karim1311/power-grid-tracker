"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-4">
      <section
        role="alert"
        className="max-w-md rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center"
      >
        <h1 className="text-xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
          We couldn&apos;t load this page. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
