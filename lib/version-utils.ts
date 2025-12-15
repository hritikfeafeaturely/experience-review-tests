import type { ScoreComparison, CompanyVersionAvailability, VersionMetadata } from '@/types/review-data';

/**
 * Format version date for display
 */
export function formatVersionDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format version date for short display (no year if current year)
 */
export function formatVersionDateShort(dateString: string): string {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== currentYear && { year: 'numeric' }),
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get available versions for a company
 */
export function getAvailableVersions(
  companySlug: string,
  versionsIndex: CompanyVersionAvailability[]
): string[] {
  const company = versionsIndex.find((c) => c.slug === companySlug);
  return company?.availableVersions || [];
}

/**
 * Check if a company has data in a specific version
 */
export function hasVersionData(
  companySlug: string,
  versionId: string,
  versionsIndex: CompanyVersionAvailability[]
): boolean {
  const availableVersions = getAvailableVersions(companySlug, versionsIndex);
  return availableVersions.includes(versionId);
}

/**
 * Compare two scores and return comparison result
 */
export function compareScores(
  oldScore: number | undefined | null,
  newScore: number | undefined | null
): ScoreComparison {
  // Handle null/undefined values
  const oldVal = oldScore ?? null;
  const newVal = newScore ?? null;

  // Both missing
  if (oldVal === null && newVal === null) {
    return {
      oldScore: null,
      newScore: null,
      delta: null,
      percentChange: null,
      trend: 'unchanged',
    };
  }

  // New data added
  if (oldVal === null && newVal !== null) {
    return {
      oldScore: null,
      newScore: newVal,
      delta: null,
      percentChange: null,
      trend: 'new',
    };
  }

  // Data removed
  if (oldVal !== null && newVal === null) {
    return {
      oldScore: oldVal,
      newScore: null,
      delta: null,
      percentChange: null,
      trend: 'removed',
    };
  }

  // Both have values - compare
  const delta = newVal! - oldVal!;
  const percentChange = oldVal !== 0 ? (delta / oldVal!) * 100 : 0;

  let trend: ScoreComparison['trend'];
  if (delta > 0) {
    trend = 'improved';
  } else if (delta < 0) {
    trend = 'declined';
  } else {
    trend = 'unchanged';
  }

  return {
    oldScore: oldVal,
    newScore: newVal,
    delta,
    percentChange,
    trend,
  };
}

/**
 * Format delta for display
 */
export function formatDelta(delta: number | null): string {
  if (delta === null) return '';
  if (delta === 0) return '→';
  return delta > 0 ? `↑ +${delta}` : `↓ ${delta}`;
}

/**
 * Format percent change for display
 */
export function formatPercentChange(percentChange: number | null): string {
  if (percentChange === null) return '';
  const abs = Math.abs(percentChange);
  const sign = percentChange > 0 ? '+' : '';
  return `${sign}${abs.toFixed(1)}%`;
}

/**
 * Get trend color class
 */
export function getTrendColorClass(trend: ScoreComparison['trend']): string {
  switch (trend) {
    case 'improved':
      return 'text-green-600 dark:text-green-400';
    case 'declined':
      return 'text-red-600 dark:text-red-400';
    case 'unchanged':
      return 'text-muted-foreground';
    case 'new':
      return 'text-blue-600 dark:text-blue-400';
    case 'removed':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get trend badge variant
 */
export function getTrendBadgeVariant(
  trend: ScoreComparison['trend']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (trend) {
    case 'improved':
      return 'default';
    case 'declined':
      return 'destructive';
    case 'new':
      return 'default';
    case 'removed':
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Sort versions by date (newest first)
 */
export function sortVersionsByDate(versions: VersionMetadata[]): VersionMetadata[] {
  return [...versions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get version label with date
 */
export function getVersionLabelWithDate(version: VersionMetadata): string {
  return `${version.label} (${formatVersionDateShort(version.date)})`;
}

