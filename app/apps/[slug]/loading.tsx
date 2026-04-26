export default function AppDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 py-6 animate-pulse">
      <div className="h-3 w-20 rounded" style={{ backgroundColor: '#1a1018' }} />
      {/* App header */}
      <div className="rounded-2xl p-5 flex gap-5" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div className="w-24 h-24 rounded-2xl flex-shrink-0" style={{ backgroundColor: '#1a0808' }} />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-48 rounded" style={{ backgroundColor: '#1a1018' }} />
          <div className="h-3 w-32 rounded" style={{ backgroundColor: '#150d10' }} />
          <div className="h-3 w-full rounded" style={{ backgroundColor: '#150d10' }} />
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: '#150d10' }} />
        </div>
      </div>
      {/* Tier cards */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl p-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
            <div className="h-3 w-12 rounded mb-2" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-5 w-20 rounded" style={{ backgroundColor: '#1a0808' }} />
          </div>
        ))}
      </div>
      {/* Reviews */}
      <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div className="h-4 w-24 rounded" style={{ backgroundColor: '#1a1018' }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5 pt-2" style={{ borderTop: '1px solid #1a1018' }}>
            <div className="h-3 w-28 rounded" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-2.5 w-full rounded" style={{ backgroundColor: '#150d10' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
