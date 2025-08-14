import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LinkedInExtractorProps {
  onExtract: () => void;
  isLoading?: boolean;
}

export function LinkedInExtractor({ onExtract, isLoading = false }: LinkedInExtractorProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>LinkedIn Job Detected</CardTitle>
        <CardDescription>Extract job details from LinkedIn</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onExtract} className="w-full" disabled={isLoading}>
          {isLoading ? "Extracting..." : "Extract Job Details"}
        </Button>
      </CardContent>
    </Card>
  );
}
