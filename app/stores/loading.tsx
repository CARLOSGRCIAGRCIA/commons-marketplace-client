export default function StoresLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
