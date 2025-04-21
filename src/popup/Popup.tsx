import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface JobData {
  company: string;
  position: string;
  status: string;
  notes?: string;
  date: string;
  location?: string;
  jobType?: string;
  postedDate?: string;
  companySize?: string;
  companyIndustry?: string;
  salaryInfo?: string;
  url?: string;
  description?: string;
}

export function Popup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobData[]>([]);
  const [isLinkedInJobPage, setIsLinkedInJobPage] = useState(false);
  const [formData, setFormData] = useState<JobData>({
    company: "",
    position: "",
    status: "Applied",
    notes: "",
    date: new Date().toISOString(),
  });

  useEffect(() => {
    // Check if we're on a LinkedIn job page
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.url?.includes("linkedin.com/jobs/")) {
        setIsLinkedInJobPage(true);
      }
    });

    chrome.storage.local.get(["isLoggedIn"], (result) => {
      setIsLoggedIn(result.isLoggedIn);
      if (result.isLoggedIn) {
        loadRecentJobs();
      }
    });
  }, []);

  const handleLogin = () => {
    chrome.runtime.sendMessage({ action: "login" }, (response) => {
      if (response.success) {
        setIsLoggedIn(true);
        loadRecentJobs();
      }
    });
  };

  const loadRecentJobs = () => {
    chrome.runtime.sendMessage({ action: "getRecentJobs" }, (response) => {
      if (response.success && response.jobs) {
        setRecentJobs(response.jobs);
      }
    });
  };

  const handleExtractLinkedInJob = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        console.error("No active tab found");
        return;
      }

      // Check if we're on a LinkedIn job page
      if (!tab.url?.includes("linkedin.com/jobs/")) {
        console.error("Not on a LinkedIn job page");
        return;
      }

      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "extractJobDetails" });
        if (response?.success && response?.jobData) {
          setFormData({
            ...formData,
            company: response.jobData.company,
            position: response.jobData.position,
            notes: response.jobData.description || "",
            location: response.jobData.location,
            jobType: response.jobData.jobType,
            postedDate: response.jobData.postedDate,
            companySize: response.jobData.companySize,
            companyIndustry: response.jobData.companyIndustry,
            salaryInfo: response.jobData.salaryInfo,
            url: response.jobData.url,
            description: response.jobData.description,
          });
        } else {
          console.error("Failed to extract job details:", response?.error);
        }
      } catch (error) {
        // If the content script isn't loaded yet, try to inject it
        if (error.message.includes("Receiving end does not exist")) {
          console.log("Content script not loaded, attempting to inject...");
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["dist/assets/contentScript.js"],
          });

          // Try the extraction again after injecting the script
          const response = await chrome.tabs.sendMessage(tab.id, { action: "extractJobDetails" });
          if (response?.success && response?.jobData) {
            setFormData({
              ...formData,
              company: response.jobData.company,
              position: response.jobData.position,
              notes: response.jobData.description || "",
              location: response.jobData.location,
              jobType: response.jobData.jobType,
              postedDate: response.jobData.postedDate,
              companySize: response.jobData.companySize,
              companyIndustry: response.jobData.companyIndustry,
              salaryInfo: response.jobData.salaryInfo,
              url: response.jobData.url,
              description: response.jobData.description,
            });
          }
        } else {
          console.error("Error extracting LinkedIn job:", error);
        }
      }
    } catch (error) {
      console.error("Error in handleExtractLinkedInJob:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: "saveJob", jobData: formData }, (response) => {
      if (response.success) {
        setFormData({
          company: "",
          position: "",
          status: "Applied",
          notes: "",
          date: new Date().toISOString(),
        });
        loadRecentJobs();
      }
    });
  };

  return (
    <div className="w-[400px] p-4 bg-background text-foreground">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">NomadBoard</CardTitle>
          <CardDescription>Track your job applications efficiently</CardDescription>
        </CardHeader>
      </Card>

      {!isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to NomadBoard</CardTitle>
            <CardDescription>Please login to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Login with Google
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLinkedInJobPage && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>LinkedIn Job Detected</CardTitle>
                <CardDescription>Extract job details from LinkedIn</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExtractLinkedInJob} className="w-full">
                  Extract Job Details
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Add New Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Input
                    id="jobType"
                    value={formData.jobType || ""}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offered">Offered</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-20"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save Job
                </Button>
              </form>
            </CardContent>
          </Card>

          {recentJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {recentJobs.map((job, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{job.company}</h3>
                              <p className="text-sm text-muted-foreground">{job.position}</p>
                              {job.location && <p className="text-sm text-muted-foreground">{job.location}</p>}
                              {job.jobType && (
                                <Badge variant="outline" className="mt-1">
                                  {job.jobType}
                                </Badge>
                              )}
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.status === "Applied"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "Interviewing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : job.status === "Offered"
                                  ? "bg-green-100 text-green-800"
                                  : job.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status}
                            </div>
                          </div>
                          {job.notes && <p className="mt-2 text-sm text-muted-foreground">{job.notes}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">{new Date(job.date).toLocaleDateString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <footer className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Developed by{" "}
          <a
            href="https://notablenomads.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Notable Nomads
          </a>
        </p>
        <p>
          Contact:{" "}
          <a href="mailto:dee@notablenomads.com" className="text-primary hover:underline">
            dee@notablenomads.com
          </a>
        </p>
      </footer>
    </div>
  );
}
