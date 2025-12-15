'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ text, maxLength = 150, className = '' }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;

  if (!shouldTruncate) {
    return <p className={className}>{text}</p>;
  }

  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';

  return (
    <div className="space-y-2">
      <p className={className}>{displayText}</p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            Read more
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}

