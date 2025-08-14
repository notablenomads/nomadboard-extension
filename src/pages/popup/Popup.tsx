import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm, RecentJobs } from "@/features/jobs";
import { LinkedInExtractor } from "@/features/linkedin";
import { useChromeMessaging } from "@/shared";
import { useJobForm } from "@/features/jobs";
import { JobData } from "@/types";
import { MESSAGE_ACTIONS } from "@/config/constants";

export function Popup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobData[]>([]);
  const [isLinkedInJobPage, setIsLinkedInJobPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const { sendMessage, sendMessageToTab } = useChromeMessaging();
  const { formData, updateFormData, resetForm, setJobFromLinkedIn } = useJobForm();

  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    if (currentTab?.url?.includes("linkedin.com/jobs/")) {
      setIsLinkedInJobPage(true);
    }

    const result = await chrome.storage.local.get(["isLoggedIn"]);
    setIsLoggedIn(result.isLoggedIn);
    if (result.isLoggedIn) {
      loadRecentJobs();
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await sendMessage(MESSAGE_ACTIONS.LOGIN);
      if (response.success) {
        setIsLoggedIn(true);
        loadRecentJobs();
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentJobs = async () => {
    try {
      const response = await sendMessage(MESSAGE_ACTIONS.GET_RECENT_JOBS);
      if (response.success && response.data) {
        setRecentJobs(response.data);
      }
    } catch (error) {
      console.error("Error loading recent jobs:", error);
    }
  };

  const handleExtractLinkedInJob = async () => {
    try {
      setIsExtracting(true);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        console.error("No active tab found");
        return;
      }

      if (!tab.url?.includes("linkedin.com/jobs/")) {
        console.error("Not on a LinkedIn job page");
        return;
      }

      try {
        const response = await sendMessageToTab(tab.id, MESSAGE_ACTIONS.EXTRACT_JOB_DETAILS);
        if (response?.success && response?.data) {
          setJobFromLinkedIn(response.data);
        }
      } catch (error) {
        if (error.message.includes("Receiving end does not exist")) {
          console.log("Content script not loaded, attempting to inject...");
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["dist/assets/contentScript.js"],
          });

          const response = await sendMessageToTab(tab.id, MESSAGE_ACTIONS.EXTRACT_JOB_DETAILS);
          if (response?.success && response?.data) {
            setJobFromLinkedIn(response.data);
          }
        } else {
          console.error("Error extracting LinkedIn job:", error);
        }
      }
    } catch (error) {
      console.error("Error in handleExtractLinkedInJob:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await sendMessage(MESSAGE_ACTIONS.SAVE_JOB, { jobData: formData });
      if (response.success) {
        resetForm();
        loadRecentJobs();
      }
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setIsLoading(false);
    }
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
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login with Google"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLinkedInJobPage && <LinkedInExtractor onExtract={handleExtractLinkedInJob} isLoading={isExtracting} />}

          <JobForm formData={formData} onFormDataChange={updateFormData} onSubmit={handleSubmit} isLoading={isLoading} />

          <RecentJobs jobs={recentJobs} />
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
