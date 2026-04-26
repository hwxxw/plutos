export default function HomeLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Hero skeleton */}
      <div className="pt-10 pb-2 space-y-3">
        <div className="h-3 w-24 rounded" style={{ backgroundColor: '#1a0808' }} />
        <div className="h-10 w-64 rounded" style={{ backgroundColor: '#1a1018' }} />
        <div className="h-5 w-80 rounded" style={{ backgroundColor: '#120a0e' }} />
      </div>
      {/* App grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#120a0e', border: '1px solid #1a1018' }}>
            <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-3 w-3/4 rounded" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-2.5 w-1/2 rounded" style={{ backgroundColor: '#150d10' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
