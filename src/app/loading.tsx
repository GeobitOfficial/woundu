export default function Loading() {
  return (
    <main className="bg-[#eaeded]">
      <div className="h-48 animate-pulse bg-[#232f3e]" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="h-32 animate-pulse rounded-sm bg-white"
              key={index}
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-sm bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="h-72 animate-pulse rounded-sm bg-white"
              key={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
