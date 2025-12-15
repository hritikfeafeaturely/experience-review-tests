'use client';

import { Badge } from '@/components/ui/badge';
import { formatVersionDateShort } from '@/lib/version-utils';
import type { VersionMetadata } from '@/types/review-data';

interface VersionSelectorProps {
  versions: VersionMetadata[];
  companySlug: string;
  availableVersions: string[];
}

export function VersionSelector({ versions, companySlug, availableVersions }: VersionSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">
        Comparing versions:
      </span>
      {versions.map((version) => {
        const hasData = availableVersions.includes(version.id);
        
        return (
          <div
            key={version.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
              hasData
                ? 'bg-card border-primary/50'
                : 'bg-muted border-muted-foreground/20 opacity-50'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${
              hasData ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
            }`} />
            <span className="text-sm font-medium">
              {version.label}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatVersionDateShort(version.date)})
            </span>
            {version.isLatest && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Latest
              </Badge>
            )}
            {!hasData && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                No Data
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

