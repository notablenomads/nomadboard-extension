import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JobData } from "@/types";
import { formatDate } from "@/utils/common";

interface RecentJobsProps {
  jobs: JobData[];
}

const getStatusColor = (status: JobData["status"]) => {
  switch (status) {
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "Interviewing":
      return "bg-yellow-100 text-yellow-800";
    case "Offered":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Accepted":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{job.company}</h3>
                      <p className="text-sm text-muted-foreground">{job.position}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </div>
                  </div>
                  {job.notes && <p className="mt-2 text-sm text-muted-foreground">{job.notes}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(job.date)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
