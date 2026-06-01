export default function Loading() {
  return (
    <main className="min-h-screen bg-[#eaeded]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 h-40 animate-pulse rounded-sm bg-white" />
        <div className="mb-6 h-24 animate-pulse rounded-sm bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="h-80 animate-pulse rounded-sm bg-white"
              key={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
