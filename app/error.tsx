"use client";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md space-y-4 rounded-xl border border-line bg-white p-8">
        <h1 className="text-xl font-semibold">
          Your workspace is temporarily unavailable
        </h1>
        <p className="text-sm text-[#526573]">
          We couldn’t load the shared records. Try again in a moment. If this continues,
          ask your administrator to check the database connection.
        </p>
        <button
          onClick={reset}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
