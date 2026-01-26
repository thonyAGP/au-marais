'use client';

export const DevModeBanner = () => {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  // Only show banner if not in production (preview or development)
  if (vercelEnv === 'production' || (!vercelEnv && process.env.NODE_ENV === 'production')) {
    return null;
  }

  // Build info
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : null;

  // Format build time for display
  const formatBuildTime = (isoString: string | undefined) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      });
    } catch {
      return null;
    }
  };

  const formattedBuildTime = formatBuildTime(buildTime);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-center py-1.5 text-sm font-medium">
      <span className="mr-2">⚠️</span>
      ENVIRONNEMENT DE TEST
      <span className="ml-3 text-orange-200 text-xs">
        {vercelEnv || 'dev'}
        {formattedBuildTime && ` | Build: ${formattedBuildTime}`}
        {shortSha && ` | ${shortSha}`}
      </span>
    </div>
  );
};
