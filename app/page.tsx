import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { ClickableTableRow } from "@/components/clickable-table-row";
import versionsIndexData from "@/data/versions-index.json";
import v1Data from "@/data/parsed-data-v1.json";
import v2Data from "@/data/parsed-data-v2.json";
import v3Data from "@/data/parsed-data-v3.json";
import v3_1Data from "@/data/parsed-data-v3_1.json";
import v3_2Data from "@/data/parsed-data-v3_2.json";
import type { VersionedData, VersionsIndex, ReviewRecord } from "@/types/review-data";
import { slugify } from "@/lib/slugify";

// Load all version data
const versionsIndex = versionsIndexData as VersionsIndex;
const allVersionData = [
  v1Data as VersionedData,
  v2Data as VersionedData,
  v3Data as VersionedData,
  v3_1Data as VersionedData,
  v3_2Data as unknown as VersionedData,
];

// Create a map of all unique companies with data from any version
// Priority: v3_2 > v3_1 > v3 > v2 > v1 (use latest version first)
const companyRecordsMap = new Map<string, ReviewRecord>();
// Iterate in reverse order so latest versions overwrite older ones
allVersionData.reverse().forEach(versionData => {
  versionData.data.records.forEach(record => {
    const slug = slugify(record.name);
    if (!companyRecordsMap.has(slug)) {
      companyRecordsMap.set(slug, record);
    }
  });
});

// Get all unique companies sorted by name
const allCompanies = versionsIndex.companies
  .map(company => ({
    slug: company.slug,
    name: company.companyName,
    record: companyRecordsMap.get(company.slug)
  }))
  .filter(company => company.record !== undefined)
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Experience Review Tests
          </h1>
          <p className="text-muted-foreground text-lg">
            Compare LLM responses with Experience Review feedback across {allCompanies.length} companies
          </p>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] font-semibold">Company</TableHead>
                <TableHead className="w-[300px] font-semibold">URL</TableHead>
                <TableHead className="text-center font-semibold">LLM Score</TableHead>
                <TableHead className="text-center font-semibold">UX Score</TableHead>
                <TableHead className="text-center font-semibold">Recommendations</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCompanies.map((company) => {
                const record = company.record!;
                const llmScore = record.llmResponse?.design_score?.total_score;
                const uxScore = record.experienceReviewResponse?.result?.ux_score?.design_score;
                const llmRecommendations = record.llmResponse?.recommendations?.length || 0;
                const erRecommendations = record.experienceReviewResponse?.result?.recommendations?.length || 0;

                return (
                  <ClickableTableRow 
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="cursor-pointer group hover:bg-muted/50"
                  >
                    <TableCell className="min-w-[150px]">
                      <Link
                        href={`/companies/${company.slug}`}
                        className="font-medium group-hover:text-primary transition-smooth capitalize block"
                      >
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[200px] max-w-[300px]">
                      <a
                        href={record.url}
            target="_blank"
            rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline truncate block transition-smooth"
                      >
                        {record.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {llmScore !== undefined ? (
                        <Badge 
                          variant="default"
                          className="transition-smooth"
                        >
                          {llmScore}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {uxScore !== undefined ? (
                        <Badge 
                           variant="default"
                          className="transition-smooth"
                        >
                          {uxScore}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">
                          Gemini {llmRecommendations}  
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-sm font-medium">
                          Featurely {erRecommendations}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Link
                        href={`/companies/${company.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-smooth"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </TableCell>
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            Last updated: {new Date(versionsIndex.generatedAt).toLocaleDateString()} at{" "}
            {new Date(versionsIndex.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
