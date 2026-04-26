export default function DeveloperLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: '#1a1018' }} />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl p-4 text-center" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
            <div className="h-2.5 w-16 mx-auto mb-2 rounded" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-6 w-20 mx-auto rounded" style={{ backgroundColor: '#1a0808' }} />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#1a0808' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-36 rounded" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-2.5 w-24 rounded" style={{ backgroundColor: '#150d10' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
