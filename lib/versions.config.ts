// Version configuration for multiple CSV data sources

export interface VersionConfig {
  id: string;
  filename: string;
  date: string; // ISO format: YYYY-MM-DD
  label: string;
  isLatest: boolean;
}

/**
 * Extract date from filename using various patterns
 * Patterns supported:
 * - experience_review_data_15_dec.csv → 2024-12-15
 * - experience_review_data_2024_12_15.csv → 2024-12-15
 * - experience_review_data_dec_15_2024.csv → 2024-12-15
 */
export function extractDateFromFilename(filename: string): string | null {
  // Pattern 1: DD_MMM format (e.g., 15_dec)
  const pattern1 = /(\d{1,2})_([a-z]{3})/i;
  const match1 = filename.match(pattern1);
  if (match1) {
    const day = match1[1].padStart(2, '0');
    const monthMap: { [key: string]: string } = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = monthMap[match1[2].toLowerCase()];
    if (month) {
      // Default to current year if not specified
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
  }

  // Pattern 2: YYYY_MM_DD format
  const pattern2 = /(\d{4})[_-](\d{1,2})[_-](\d{1,2})/;
  const match2 = filename.match(pattern2);
  if (match2) {
    const year = match2[1];
    const month = match2[2].padStart(2, '0');
    const day = match2[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Pattern 3: MMM_DD_YYYY format
  const pattern3 = /([a-z]{3})[_-](\d{1,2})[_-](\d{4})/i;
  const match3 = filename.match(pattern3);
  if (match3) {
    const monthMap: { [key: string]: string } = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = monthMap[match3[1].toLowerCase()];
    const day = match3[2].padStart(2, '0');
    const year = match3[3];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

/**
 * Generate label from version config
 */
export function generateVersionLabel(config: VersionConfig): string {
  const date = new Date(config.date);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * All configured versions
 * Add new CSV files here to include them in the comparison
 */
export const versions: VersionConfig[] = [
  {
    id: 'v1',
    filename: 'experience_review_test_4_results_with_workflow_steps.csv',
    date: '2025-12-10', // Manual fallback date
    label: 'Version 1',
    isLatest: false,
  },
  {
    id: 'v2',
    filename: 'experience_review_data_15_dec.csv',
    date: '2025-12-15', // Extracted from filename: 15_dec
    label: 'Version 2',
    isLatest: false,
  },
  {
    id: 'v3',
    filename: 'experience_review_with_cognition_22_dec.csv',
    date: '2025-12-22', // Extracted from filename: 22_dec
    label: 'Version 3',
    isLatest: false,
  },
  {
    id: 'v3_1',
    filename: 'experience_review_12_jan_v3_1.csv',
    date: '2026-01-12', // Extracted from filename: 12_jan
    label: 'Version 3.1',
    isLatest: false,
  },
  {
    id: 'v3_2',
    filename: 'experience_review__12_jan_v3_2.csv',
    date: '2026-01-12', // Extracted from filename: 12_jan
    label: 'Version 3.2',
    isLatest: true,
  },
];

/**
 * Get the latest version
 */
export function getLatestVersion(): VersionConfig {
  const latest = versions.find(v => v.isLatest);
  if (!latest) {
    throw new Error('No latest version configured');
  }
  return latest;
}

/**
 * Get version by ID
 */
export function getVersionById(id: string): VersionConfig | undefined {
  return versions.find(v => v.id === id);
}

/**
 * Get all version IDs
 */
export function getAllVersionIds(): string[] {
  return versions.map(v => v.id);
}

