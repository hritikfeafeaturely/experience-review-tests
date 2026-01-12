import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { findBySlug } from "@/lib/slugify";
import { getAvailableVersions, formatVersionDateShort } from "@/lib/version-utils";
import { ScoreComparison, ScoreDeltaBadge } from "@/components/score-comparison";
import { ExpandableText } from "@/components/expandable-text";
import type { ParsedData, VersionedData, VersionsIndex, ReviewRecord } from "@/types/review-data";

// Import all version data
import versionsIndexData from "@/data/versions-index.json";

const versionsIndex = versionsIndexData as VersionsIndex;

// Dynamic imports for version data
import v1Data from "@/data/parsed-data-v1.json";
import v2Data from "@/data/parsed-data-v2.json";
import v3Data from "@/data/parsed-data-v3.json";
import v3_1Data from "@/data/parsed-data-v3_1.json";
import v3_2Data from "@/data/parsed-data-v3_2.json";

const versionDataMap: Record<string, ParsedData> = {
  v1: (v1Data as VersionedData).data,
  v2: (v2Data as VersionedData).data,
  v3: (v3Data as VersionedData).data,
  v3_1: (v3_1Data as VersionedData).data,
  v3_2: (v3_2Data as unknown as VersionedData).data,
};

export function generateStaticParams() {
  // Generate params from all companies in the index
  return versionsIndex.companies.map((company) => ({
    slug: company.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Get available versions for this company
  const availableVersions = getAvailableVersions(slug, versionsIndex.companies);

  if (availableVersions.length === 0) {
    notFound();
  }

  // Load records from all available versions
  const versionRecords: Record<string, ReviewRecord | null> = {};
  availableVersions.forEach((versionId) => {
    const data = versionDataMap[versionId];
    if (data) {
      const record = findBySlug(data.records, slug);
      versionRecords[versionId] = record || null;
    }
  });

  // Use the latest available version that has data for this company
  let record: ReviewRecord | null = null;
  for (const versionId of [...availableVersions].reverse()) {
    if (versionRecords[versionId]) {
      record = versionRecords[versionId];
      break;
    }
  }

  if (!record) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4 max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 capitalize">
                {record.name}
              </h1>
              <a
                href={record.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-smooth break-all"
              >
                {record.url}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>

          {/* Version Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Version Comparison Guide</CardTitle>
              <CardDescription>Understanding the differences between each version</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version 1</Badge>
                  <span className="text-xs text-muted-foreground">Dec 10, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Experience Review vs Gemini API - Initial comparison between automated review system and LLM analysis
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version 2</Badge>
                  <span className="text-xs text-muted-foreground">Dec 15, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Same as Version 1 with updated screenshot capture API for improved screenshot capture
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version 3</Badge>
                  <span className="text-xs text-muted-foreground">Dec 22, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Experience Review with Cognition API integrated 
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version 3.1</Badge>
                  <span className="text-xs text-muted-foreground">Jan 12, 2026</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Experience Review with enhanced Design score prompt from Ankit 
                </p>
              </div>
              <div className="p-4 border rounded-lg space-y-2 border-primary/50 bg-primary/5">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Version 3.2</Badge>
                  <span className="text-xs text-muted-foreground">Jan 12, 2026</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed design score prompt by Sowrabh 
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Global Version Tabs */}
          <Tabs defaultValue={availableVersions.includes('v3_2') ? 'v3_2' : availableVersions[availableVersions.length - 1]} className="w-full">
            <TabsList className={`grid w-full ${
              (() => {
                const visibleCount = versionsIndex.versions.filter(v => 
                  (v.id !== 'v3' && v.id !== 'v3_1' && v.id !== 'v3_2') || availableVersions.includes(v.id)
                ).length;
                return visibleCount === 1 ? 'grid-cols-1 max-w-xs' :
                       visibleCount === 2 ? 'grid-cols-2 max-w-lg' :
                       visibleCount === 3 ? 'grid-cols-3 max-w-2xl' : 
                       visibleCount === 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl' : 
                       'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-4xl';
              })()
            }`}>
              {versionsIndex.versions.map((version) => {
                const hasData = availableVersions.includes(version.id);
                
                // Hide v3, v3.1 and v3.2 tabs if no data
                if ((version.id === 'v3' || version.id === 'v3_1' || version.id === 'v3_2') && !hasData) {
                  return null;
                }
                
                return (
                  <TabsTrigger 
                    key={version.id} 
                    value={version.id}
                    disabled={!hasData}
                    className="text-xs sm:text-sm"
                  >
                    <span className="truncate">{version.label} ({formatVersionDateShort(version.date)})</span>
                    {version.isLatest && (
                      <Badge variant="default" className="ml-1 sm:ml-2 text-[9px] px-1 py-0">
                        Latest
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {versionsIndex.versions.map((version) => {
              const versionRecord = versionRecords[version.id];
              const hasData = availableVersions.includes(version.id);
              
              if (!hasData) {
                return (
                  <TabsContent key={version.id} value={version.id} className="mt-6">
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Badge variant="secondary" className="mb-2">Not Available</Badge>
                        <p className="text-sm text-muted-foreground">
                          No data available for this version
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              }

              const currentRecord = versionRecord || record;
              const llmResponse = currentRecord.llmResponse;
              const erResponse = currentRecord.experienceReviewResponse;

              return (
                <TabsContent key={version.id} value={version.id} className="mt-6 space-y-8">
                  {/* Screenshot for this version */}
                  {currentRecord.screenshotUrl && (
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>Screenshot</CardTitle>
                        <CardDescription>
                          Captured on {formatVersionDateShort(version.date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Website Preview
                            </p>
                            <a
                              href={currentRecord.screenshotUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              Open full size
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border">
                            <Image
                              src={currentRecord.screenshotUrl}
                              alt={`Screenshot of ${currentRecord.name} - ${version.label}`}
                              fill
                              className="object-contain transition-smooth hover:scale-[1.02]"
                              unoptimized
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Company Info */}
                  {currentRecord.companyInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{currentRecord.companyInfo}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata Grid */}
                  {(currentRecord.actions.length > 0 || currentRecord.emotions.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentRecord.actions.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>User actions tested</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {currentRecord.actions.map((action, i) => (
                                <Badge key={i} variant="outline">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {currentRecord.emotions.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Emotions</CardTitle>
                            <CardDescription>Target emotional responses</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {currentRecord.emotions.map((emotion, i) => (
                                <Badge key={i} variant="secondary">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Personas */}
                  {currentRecord.targetAudience?.data?.personas && currentRecord.targetAudience.data.personas.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Target Personas</CardTitle>
                        <CardDescription>User personas analyzed in this review</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {currentRecord.targetAudience.data.personas.map((persona, i) => (
                            <div key={i} className="p-4 border rounded-lg transition-smooth hover:shadow-md hover:border-primary/50">
                              <h4 className="font-semibold mb-1 text-sm sm:text-base">{persona.title}</h4>
                              <p className="text-xs text-muted-foreground mb-3">{persona.location}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4">
                                {persona.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analysis Comparison */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* LLM Column */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          LLM Response (Gemini)
                        </h3>

                        {llmResponse ? (
                          <>
                            <Card className="shadow-sm">
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  Score
                                  {version.id === 'v2' && versionRecords['v1']?.llmResponse && (
                                    <ScoreDeltaBadge
                                      oldScore={versionRecords['v1'].llmResponse?.design_score?.total_score}
                                      newScore={llmResponse.design_score.total_score}
                                    />
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg">
                                  {version.id === 'v2' && versionRecords['v1']?.llmResponse ? (
                                    <ScoreComparison
                                      oldScore={versionRecords['v1'].llmResponse?.design_score?.total_score}
                                      newScore={llmResponse.design_score.total_score}
                                      showPercentage
                                    />
                                  ) : (
                                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                                      {llmResponse.design_score.total_score}
                                      <span className="text-2xl text-muted-foreground ml-1">/100</span>
                                    </div>
                                  )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium">Usability Heuristics</span>
                                      <span className="text-sm text-muted-foreground">
                                        {llmResponse.design_score.usability_heuristics.score}/
                                        {llmResponse.design_score.usability_heuristics.max_score}
                                      </span>
                                    </div>
                                    <ExpandableText
                                      text={llmResponse.design_score.usability_heuristics.description}
                                      maxLength={150}
                                      className="text-xs text-muted-foreground"
                                    />
                                  </div>

                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium">Visual Design</span>
                                      <span className="text-sm text-muted-foreground">
                                        {llmResponse.design_score.visual_design.score}/
                                        {llmResponse.design_score.visual_design.max_score}
                                      </span>
                                    </div>
                                    <ExpandableText
                                      text={llmResponse.design_score.visual_design.description}
                                      maxLength={150}
                                      className="text-xs text-muted-foreground"
                                    />
                                  </div>

                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium">Modern UX Practices</span>
                                      <span className="text-sm text-muted-foreground">
                                        {llmResponse.design_score.modern_ux_practices.score}/
                                        {llmResponse.design_score.modern_ux_practices.max_score}
                                      </span>
                                    </div>
                                    <ExpandableText
                                      text={llmResponse.design_score.modern_ux_practices.description}
                                      maxLength={150}
                                      className="text-xs text-muted-foreground"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                              <CardHeader>
                                <CardTitle>Recommendations</CardTitle>
                                <CardDescription>
                                  {llmResponse.recommendations.length} recommendation
                                  {llmResponse.recommendations.length !== 1 ? 's' : ''}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {llmResponse.recommendations.map((rec) => (
                                  <div
                                    key={rec.id}
                                    className="p-3 border rounded-lg space-y-2 transition-smooth hover:shadow-md hover:border-blue-500/50 bg-card"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-semibold text-xs sm:text-sm">{rec.title}</h4>
                                      <Badge variant="outline" className="shrink-0 text-[10px]">
                                        {rec.category}
                                      </Badge>
                                    </div>
                                    <ExpandableText
                                      text={rec.explanation}
                                      maxLength={150}
                                      className="text-xs text-muted-foreground"
                                    />
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          </>
                        ) : (
                          <Card className="shadow-sm">
                            <CardContent className="py-12 text-center text-muted-foreground">
                              No LLM response data
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Experience Review Column */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          Experience Review Response
                        </h3>

                        {erResponse ? (
                          <>
                            {erResponse.result?.ux_score ? (
                              <>
                                <Card className="shadow-sm">
                                  <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                      Score
                                      {version.id === 'v2' && versionRecords['v1']?.experienceReviewResponse && (
                                        <ScoreDeltaBadge
                                          oldScore={versionRecords['v1'].experienceReviewResponse?.result?.ux_score?.design_score}
                                          newScore={erResponse.result.ux_score.design_score}
                                        />
                                      )}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg">
                                      {version.id === 'v2' && versionRecords['v1']?.experienceReviewResponse ? (
                                        <ScoreComparison
                                          oldScore={versionRecords['v1'].experienceReviewResponse?.result?.ux_score?.design_score}
                                          newScore={erResponse.result.ux_score.design_score}
                                          showPercentage
                                        />
                                      ) : (
                                        <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                                          {erResponse.result.ux_score.design_score}
                                          <span className="text-2xl text-muted-foreground ml-1">/100</span>
                                        </div>
                                      )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                      {erResponse.result.ux_score.justification?.map((just, i) => (
                                        <div key={i}>
                                          <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{just.category}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {just.score}
                                            </span>
                                          </div>
                                          <ExpandableText
                                            text={just.description}
                                            maxLength={150}
                                            className="text-xs text-muted-foreground"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </>
                            ) : (
                              <Card className="shadow-sm">
                                <CardContent className="py-8 text-center">
                                  <p className="text-sm text-muted-foreground">
                                    UX Score data not available for this version
                                  </p>
                                </CardContent>
                              </Card>
                            )}

                            {erResponse.result?.recommendations && erResponse.result.recommendations.length > 0 ? (
                              <Card className="shadow-sm">
                                <CardHeader>
                                  <CardTitle>Recommendations</CardTitle>
                                  <CardDescription>
                                    {erResponse.result.recommendations.length} recommendation
                                    {erResponse.result.recommendations.length !== 1 ? 's' : ''}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {erResponse.result.recommendations.map((rec, i) => (
                                  <div
                                    key={i}
                                    className="p-3 border rounded-lg space-y-2 transition-smooth hover:shadow-md hover:border-green-500/50 bg-card"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-semibold text-xs sm:text-sm">{rec.title}</h4>
                                      <Badge
                                        variant={
                                          rec.tags === 'Critical'
                                            ? 'destructive'
                                            : rec.tags === 'Significant'
                                            ? 'default'
                                            : 'secondary'
                                        }
                                        className="shrink-0 text-[10px]"
                                      >
                                        {rec.tags}
                                      </Badge>
                                    </div>
                                    <ExpandableText
                                      text={rec.recommendation}
                                      maxLength={150}
                                      className="text-xs text-muted-foreground"
                                    />
                                  </div>
                                  ))}
                                </CardContent>
                              </Card>
                            ) : null}
                          </>
                        ) : (
                          <Card className="shadow-sm">
                            <CardContent className="py-12 text-center text-muted-foreground">
                              No Experience Review data
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}