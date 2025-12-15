import { Badge } from '@/components/ui/badge';
import { compareScores, formatDelta, formatPercentChange, getTrendColorClass } from '@/lib/version-utils';

interface ScoreComparisonProps {
  oldScore: number | undefined | null;
  newScore: number | undefined | null;
  label?: string;
  showPercentage?: boolean;
}

export function ScoreComparison({ oldScore, newScore, label, showPercentage = false }: ScoreComparisonProps) {
  const comparison = compareScores(oldScore, newScore);
  const trendColor = getTrendColorClass(comparison.trend);

  if (comparison.trend === 'new') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{newScore}</span>
        <Badge variant="default" className="text-xs">New</Badge>
      </div>
    );
  }

  if (comparison.trend === 'removed') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-muted-foreground">{oldScore}</span>
        <Badge variant="secondary" className="text-xs">Removed</Badge>
      </div>
    );
  }

  if (comparison.trend === 'unchanged') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{newScore ?? oldScore ?? '-'}</span>
        {comparison.delta === 0 && (
          <span className="text-sm text-muted-foreground">→</span>
        )}
      </div>
    );
  }

  // Improved or declined
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{newScore}</span>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <span>{formatDelta(comparison.delta)}</span>
          {showPercentage && comparison.percentChange !== null && (
            <span className="text-xs">({formatPercentChange(comparison.percentChange)})</span>
          )}
        </div>
      </div>
      {label && (
        <div className="text-xs text-muted-foreground">
          Previous: {oldScore ?? '-'}
        </div>
      )}
    </div>
  );
}

interface ScoreDeltaBadgeProps {
  oldScore: number | undefined | null;
  newScore: number | undefined | null;
}

export function ScoreDeltaBadge({ oldScore, newScore }: ScoreDeltaBadgeProps) {
  const comparison = compareScores(oldScore, newScore);

  if (comparison.trend === 'unchanged' && comparison.delta === 0) {
    return null;
  }

  if (comparison.trend === 'new') {
    return <Badge variant="default" className="text-xs">New</Badge>;
  }

  if (comparison.trend === 'removed') {
    return <Badge variant="secondary" className="text-xs">Removed</Badge>;
  }

  const trendColor = getTrendColorClass(comparison.trend);

  return (
    <Badge variant="outline" className={`text-xs ${trendColor} border-current`}>
      {formatDelta(comparison.delta)}
    </Badge>
  );
}

