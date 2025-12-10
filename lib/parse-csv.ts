import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { ReviewRecord, ParsedData, LLMResponse, ExperienceReviewResponse, TargetAudienceData, SessionData } from '@/types/review-data';

interface CSVRow {
  Name: string;
  URL: string;
  'Screenshot URL': string;
  'Company Info': string;
  'Target Audience': string;
  Actions: string;
  Emotions: string;
  'LLM Response': string;
  'Persona Task IDs': string;
  'Persona User Data': string;
  'Session Data': string;
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

function parseCSV(): ReviewRecord[] {
  const csvFilePath = path.join(process.cwd(), 'experience_review_test_4_results_with_workflow_steps.csv');
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
    const sessionData = safeJSONParse<SessionData>(row['Session Data']);
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

function generateStaticData() {
  const records = parseCSV();
  
  const data: ParsedData = {
    records,
    generatedAt: new Date().toISOString(),
  };

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write the parsed data to a JSON file
  const outputPath = path.join(dataDir, 'parsed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`✅ Successfully parsed ${records.length} records`);
  console.log(`📁 Data written to: ${outputPath}`);
}

// Run the script
generateStaticData();

