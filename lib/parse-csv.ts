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
  'LLM Response'?: string;
  'LLM Response (Gemini)'?: string;
  'Persona Task IDs'?: string;
  'Persona User Data'?: string;
  'Session Data'?: string;
  'Start Action Response'?: string;
  'Start Action Response (experience review)'?: string;
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

/**
 * Load LLM Response data from v2 CSV and create a map by company name
 */
function loadLLMResponseMap(): Map<string, LLMResponse> {
  const llmMap = new Map<string, LLMResponse>();
  const v2Config = versions.find(v => v.id === 'v2');
  
  if (!v2Config) {
    console.warn('⚠️  v2 version config not found, cannot load LLM responses');
    return llmMap;
  }

  const csvFilePath = path.join(process.cwd(), v2Config.filename);
  
  if (!fs.existsSync(csvFilePath)) {
    console.warn(`⚠️  v2 CSV file not found: ${v2Config.filename}`);
    return llmMap;
  }

  console.log(`📖 Loading LLM responses from ${v2Config.filename}...`);
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  const parseResult = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  parseResult.data.forEach((row) => {
    const companyName = row.Name?.toLowerCase().trim();
    const llmResponseStr = row['LLM Response'] || row['LLM Response (Gemini)'] || '';
    
    if (companyName && llmResponseStr) {
      const llmResponse = safeJSONParse<LLMResponse>(llmResponseStr);
      if (llmResponse) {
        llmMap.set(companyName, llmResponse);
      }
    }
  });

  console.log(`✅ Loaded ${llmMap.size} LLM responses from v2\n`);
  return llmMap;
}

function parseCSVFile(filename: string, llmResponseMap?: Map<string, LLMResponse>): ReviewRecord[] {
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

  let mergedCount = 0;
  let notFoundCount = 0;

  const records: ReviewRecord[] = parseResult.data.map((row) => {
    // Parse actions (comma-separated string)
    const actions = row.Actions
      ? row.Actions.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    // Parse emotions (comma-separated string)
    const emotions = row.Emotions
      ? row.Emotions.split(',').map((e) => e.trim()).filter(Boolean)
      : [];

    // Parse JSON columns (handle different column name variations)
    const targetAudience = safeJSONParse<TargetAudienceData>(row['Target Audience']);
    let llmResponse = safeJSONParse<LLMResponse>(row['LLM Response'] || row['LLM Response (Gemini)'] || '');
    const sessionData = row['Session Data'] ? safeJSONParse<SessionData>(row['Session Data']) : null;
    const experienceReviewResponse = safeJSONParse<ExperienceReviewResponse>(
      row['Start Action Response'] || row['Start Action Response (experience review)'] || ''
    );

    // Merge LLM response from map if available and not already present
    if (llmResponseMap && !llmResponse && row.Name) {
      const companyKey = row.Name.toLowerCase().trim();
      const mergedLLM = llmResponseMap.get(companyKey);
      if (mergedLLM) {
        llmResponse = mergedLLM;
        mergedCount++;
      } else {
        notFoundCount++;
      }
    }

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

  if (llmResponseMap) {
    console.log(`   🔗 Merged ${mergedCount} LLM responses`);
    if (notFoundCount > 0) {
      console.log(`   ⚠️  ${notFoundCount} companies without matching LLM data in v2`);
    }
  }

  // Filter out records with empty names
  const validRecords = records.filter(record => record.name && record.name.trim() !== '');
  const filteredCount = records.length - validRecords.length;
  if (filteredCount > 0) {
    console.log(`   🗑️  Filtered out ${filteredCount} records with empty names`);
  }

  return validRecords;
}

function generateVersionedData(version: VersionConfig, llmResponseMap?: Map<string, LLMResponse>): VersionedData {
  console.log(`📊 Parsing ${version.filename}...`);
  
  // Check if this version needs LLM data merged
  const needsLLMMerge = version.id === 'v3_1' || version.id === 'v3_2';
  const records = parseCSVFile(version.filename, needsLLMMerge ? llmResponseMap : undefined);
  
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
      // Get company name from any version that has it (prefer latest versions)
      let companyName = slug;
      
      // Search through all versions to find the company name (latest first)
      for (const versionedData of [...versionedDataList].reverse()) {
        const record = versionedData.data.records.find(r => slugify(r.name) === slug);
        if (record) {
          companyName = record.name;
          break;
        }
      }

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

  // Check if any version needs LLM merging
  const needsLLMMerge = versions.some(v => v.id === 'v3_1' || v.id === 'v3_2');
  const llmResponseMap = needsLLMMerge ? loadLLMResponseMap() : undefined;

  // Parse all versions
  const versionedDataList: VersionedData[] = [];
  
  for (const version of versions) {
    const versionedData = generateVersionedData(version, llmResponseMap);
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
