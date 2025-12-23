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
import parsedData from "@/data/parsed-data.json";
import type { VersionedData } from "@/types/review-data";
import { slugify } from "@/lib/slugify";

// Use latest version for the main table
const versionedData = parsedData as VersionedData;
const data = versionedData.data;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Experience Review Tests
          </h1>
          <p className="text-muted-foreground text-lg">
            Compare LLM responses with Experience Review feedback across {data.records.length} companies
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
              {data.records.map((record) => {
                const llmScore = record.llmResponse?.design_score?.total_score;
                const uxScore = record.experienceReviewResponse?.result?.ux_score?.design_score;
                const llmRecommendations = record.llmResponse?.recommendations?.length || 0;
                const erRecommendations = record.experienceReviewResponse?.result?.recommendations?.length || 0;
                const companySlug = slugify(record.name);

                return (
                  <ClickableTableRow 
                    key={record.name}
                    href={`/companies/${companySlug}`}
                    className="cursor-pointer group hover:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/companies/${companySlug}`}
                        className="font-medium group-hover:text-primary transition-smooth capitalize block"
                      >
                        {record.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <a
                        href={record.url}
            target="_blank"
            rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline truncate block max-w-[300px] transition-smooth"
                      >
                        {record.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
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
                    <TableCell className="text-center">
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
                    <TableCell className="text-center">
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
                    <TableCell className="text-right">
                      <Link
                        href={`/companies/${companySlug}`}
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
            Last updated: {new Date(data.generatedAt).toLocaleDateString()} at{" "}
            {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
