export default function MyAppsLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4 animate-pulse">
      <div className="h-7 w-32 rounded" style={{ backgroundColor: '#1a1018' }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
          <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ backgroundColor: '#1a0808' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded" style={{ backgroundColor: '#1a1018' }} />
            <div className="h-3 w-24 rounded" style={{ backgroundColor: '#150d10' }} />
          </div>
          <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: '#1a0808' }} />
        </div>
      ))}
    </div>
  );
}
