import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import parsedData from "@/data/parsed-data.json";
import type { ParsedData } from "@/types/review-data";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { slugify, findBySlug } from "@/lib/slugify";

const data = parsedData as ParsedData;

export function generateStaticParams() {
  return data.records.map((record) => ({
    slug: slugify(record.name),
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const record = findBySlug(data.records, slug);

  if (!record) {
    notFound();
  }

  const llmResponse = record.llmResponse;
  const erResponse = record.experienceReviewResponse;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
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
        </div>

        {/* Screenshot */}
        {record.screenshotUrl && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border">
                  <Image
                    src={record.screenshotUrl}
                    alt={`Screenshot of ${record.name}`}
                    fill
                    className="object-contain transition-smooth hover:scale-[1.02]"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Company Info */}
        {record.companyInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{record.companyInfo}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Actions */}
          {record.actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>User actions tested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {record.actions.map((action, i) => (
                    <Badge key={i} variant="outline">
                      {action}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emotions */}
          {record.emotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Emotions</CardTitle>
                <CardDescription>Target emotional responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {record.emotions.map((emotion, i) => (
                    <Badge key={i} variant="secondary">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Personas */}
        {record.targetAudience?.data?.personas && record.targetAudience.data.personas.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Target Personas</CardTitle>
              <CardDescription>User personas analyzed in this review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {record.targetAudience.data.personas.map((persona, i) => (
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

        {/* Comparison Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Analysis Comparison</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LLM Response Column */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  LLM Response (Gemini)
                </h3>
              </div>

              {llmResponse && (
                <>
                  {/* LLM Design Score */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Design Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg">
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                          {llmResponse.design_score.total_score}
                          <span className="text-2xl text-muted-foreground ml-1">/100</span>
                        </div>
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
                          <p className="text-xs text-muted-foreground">
                            {llmResponse.design_score.usability_heuristics.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Visual Design</span>
                            <span className="text-sm text-muted-foreground">
                              {llmResponse.design_score.visual_design.score}/
                              {llmResponse.design_score.visual_design.max_score}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {llmResponse.design_score.visual_design.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Modern UX Practices</span>
                            <span className="text-sm text-muted-foreground">
                              {llmResponse.design_score.modern_ux_practices.score}/
                              {llmResponse.design_score.modern_ux_practices.max_score}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {llmResponse.design_score.modern_ux_practices.description}
                          </p>
                        </div>
                      </div>

                      {llmResponse.design_score.improvement_potential && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-2">Improvement Potential</h4>
                            <p className="text-sm text-muted-foreground">
                              {llmResponse.design_score.improvement_potential}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* LLM Recommendations */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>
                        {llmResponse.recommendations.length} recommendation{llmResponse.recommendations.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {llmResponse.recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 border rounded-lg space-y-2 transition-smooth hover:shadow-md hover:border-blue-500/50 bg-card">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm sm:text-base">{rec.title}</h4>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{rec.explanation}</p>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground/80">Principle:</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{rec.principle}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground/80">Impact:</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{rec.impact}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {!llmResponse && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No LLM response data available
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Experience Review Response Column */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Experience Review Response
                </h3>
              </div>

              {erResponse && (
                <>
                  {/* ER UX Score */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>UX Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg">
                        <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                          {erResponse.result.ux_score.design_score}
                          <span className="text-2xl text-muted-foreground ml-1">/100</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {erResponse.result.ux_score.justification.map((just, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{just.category}</span>
                              <span className="text-sm text-muted-foreground">
                                {just.score}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{just.description}</p>
                          </div>
                        ))}
                      </div>

                      {erResponse.result.ux_score.improvement_potential && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-2">Improvement Potential</h4>
                            <p className="text-sm text-muted-foreground">
                              {erResponse.result.ux_score.improvement_potential}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* ER Recommendations */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>
                        {erResponse.result.recommendations.length} recommendation{erResponse.result.recommendations.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {erResponse.result.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-2 transition-smooth hover:shadow-md hover:border-green-500/50 bg-card">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm sm:text-base">{rec.title}</h4>
                            <Badge
                              variant={rec.tags === "Critical" ? "destructive" : rec.tags === "Significant" ? "default" : "secondary"}
                              className="shrink-0 text-xs"
                            >
                              {rec.tags}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rec.recommendation}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* UX Laws Recommendations */}
                  {erResponse.result.ux_laws?.recommendations && erResponse.result.ux_laws.recommendations.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>UX Laws Recommendations</CardTitle>
                        <CardDescription>
                          {erResponse.result.ux_laws.recommendations.length} recommendation{erResponse.result.ux_laws.recommendations.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {erResponse.result.ux_laws.recommendations.map((rec, i) => (
                          <div key={i} className="p-4 border rounded-lg space-y-2 transition-smooth hover:shadow-md hover:border-green-500/50 bg-card">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm sm:text-base">{rec.title}</h4>
                              <Badge
                                variant={rec.tags === "Critical" ? "destructive" : rec.tags === "Significant" ? "default" : "secondary"}
                                className="shrink-0 text-xs"
                              >
                                {rec.tags}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rec.recommendation}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {!erResponse && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No Experience Review response data available
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

