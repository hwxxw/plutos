'use client';

export function LogoImage() {
  return (
    <>
      <img
        src="/logo.png"
        alt="PLUTOS"
        className="h-8 w-auto flex-shrink-0 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(153,0,0,0.7)]"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
          const fallback = img.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <span
        className="w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(102,0,0,0.6)] hidden"
        style={{ background: 'linear-gradient(135deg, #cc1a1a 0%, #4A0404 100%)' }}
      />
    </>
  );
}
