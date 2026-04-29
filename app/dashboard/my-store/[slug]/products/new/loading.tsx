export default function NewProductLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
