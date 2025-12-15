import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { ReviewRecord, ParsedData, VersionedData, VersionsIndex, CompanyVersionAvailability } from '@/types/review-data';
import type { LLMResponse, ExperienceReviewResponse, TargetAudienceData, SessionData } from '@/types/review-data';
import { versions, type VersionConfig } from './versions.config';
import { slugify } from './slugify';

interface CSVRow {
  Name: string;
  URL: string;
  'Screenshot URL': string;
  'Company Info': string;
  'Target Audience': string;
  Actions: string;
  Emotions: string;
  'LLM Response': string;
  'Persona Task IDs'?: string;
  'Persona User Data'?: string;
  'Session Data'?: string;
  'Start Action Response': string;
}

function safeJSONParse<T>(jsonString: string): T | null {
  try {
    if (!jsonString || jsonString.trim() === '') {
      return null;
    }
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Failed string:', jsonString.substring(0, 200));
    return null;
  }
}

function parseCSVFile(filename: string): ReviewRecord[] {
  const csvFilePath = path.join(process.cwd(), filename);
  
  if (!fs.existsSync(csvFilePath)) {
    console.warn(`⚠️  CSV file not found: ${filename}`);
    return [];
  }

  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  const parseResult = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  const records: ReviewRecord[] = parseResult.data.map((row) => {
    // Parse actions (comma-separated string)
    const actions = row.Actions
      ? row.Actions.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    // Parse emotions (comma-separated string)
    const emotions = row.Emotions
      ? row.Emotions.split(',').map((e) => e.trim()).filter(Boolean)
      : [];

    // Parse JSON columns
    const targetAudience = safeJSONParse<TargetAudienceData>(row['Target Audience']);
    const llmResponse = safeJSONParse<LLMResponse>(row['LLM Response']);
    const sessionData = row['Session Data'] ? safeJSONParse<SessionData>(row['Session Data']) : null;
    const experienceReviewResponse = safeJSONParse<ExperienceReviewResponse>(row['Start Action Response']);

    return {
      name: row.Name || '',
      url: row.URL || '',
      screenshotUrl: row['Screenshot URL'] || '',
      companyInfo: row['Company Info'] || '',
      targetAudience,
      actions,
      emotions,
      llmResponse,
      personaTaskIds: row['Persona Task IDs'] || '',
      personaUserData: row['Persona User Data'] || '',
      sessionData,
      experienceReviewResponse,
    };
  });

  return records;
}

function generateVersionedData(version: VersionConfig): VersionedData {
  console.log(`📊 Parsing ${version.filename}...`);
  const records = parseCSVFile(version.filename);
  
  const data: ParsedData = {
    records,
    generatedAt: new Date().toISOString(),
  };

  return {
    version: {
      id: version.id,
      filename: version.filename,
      date: version.date,
      label: version.label,
      isLatest: version.isLatest,
    },
    data,
  };
}

function generateVersionsIndex(versionedDataList: VersionedData[]): VersionsIndex {
  // Collect all unique companies across all versions
  const companyMap = new Map<string, Set<string>>();

  versionedDataList.forEach((versionedData) => {
    versionedData.data.records.forEach((record) => {
      const slug = slugify(record.name);
      if (!companyMap.has(slug)) {
        companyMap.set(slug, new Set());
      }
      companyMap.get(slug)!.add(versionedData.version.id);
    });
  });

  const companies: CompanyVersionAvailability[] = Array.from(companyMap.entries()).map(
    ([slug, versionIds]) => {
      // Get company name from the latest version that has it
      const latestVersion = versionedDataList.find(v => v.version.isLatest);
      const record = latestVersion?.data.records.find(r => slugify(r.name) === slug);
      const companyName = record?.name || slug;

      return {
        companyName,
        slug,
        availableVersions: Array.from(versionIds),
      };
    }
  );

  return {
    versions: versionedDataList.map(v => v.version),
    companies,
    generatedAt: new Date().toISOString(),
  };
}

function generateAllVersions() {
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('🚀 Starting multi-version CSV parsing...\n');

  // Parse all versions
  const versionedDataList: VersionedData[] = [];
  
  for (const version of versions) {
    const versionedData = generateVersionedData(version);
    versionedDataList.push(versionedData);

    // Write individual version file
    const outputPath = path.join(dataDir, `parsed-data-${version.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(versionedData, null, 2), 'utf-8');
    
    console.log(`✅ ${version.label}: ${versionedData.data.records.length} records`);
    console.log(`   📁 ${outputPath}\n`);
  }

  // Generate and write versions index
  const index = generateVersionsIndex(versionedDataList);
  const indexPath = path.join(dataDir, 'versions-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  
  console.log(`📑 Versions index created: ${index.companies.length} unique companies`);
  console.log(`   📁 ${indexPath}\n`);

  // Also create a symlink/copy of the latest version as parsed-data.json for backward compatibility
  const latestVersion = versionedDataList.find(v => v.version.isLatest);
  if (latestVersion) {
    const legacyPath = path.join(dataDir, 'parsed-data.json');
    fs.writeFileSync(legacyPath, JSON.stringify(latestVersion, null, 2), 'utf-8');
    console.log(`🔗 Legacy file created (latest version)`);
    console.log(`   📁 ${legacyPath}\n`);
  }

  console.log('✨ All versions parsed successfully!');
}

// Run the script
generateAllVersions();
