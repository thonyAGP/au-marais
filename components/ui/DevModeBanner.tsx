'use client';

export const DevModeBanner = () => {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  // Only show banner if not in production (preview or development)
  if (vercelEnv === 'production' || (!vercelEnv && process.env.NODE_ENV === 'production')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-center py-1.5 text-sm font-medium">
      <span className="mr-2">⚠️</span>
      ENVIRONNEMENT DE TEST
      <span className="ml-2 text-orange-200 text-xs">
        ({vercelEnv || 'development'})
      </span>
    </div>
  );
};
