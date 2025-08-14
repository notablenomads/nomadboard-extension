import { useState, useCallback } from "react";
import { JobData, JobStatus } from "@/types";
import { JOB_STATUSES } from "@/config/constants";

const initialFormData: JobData = {
  company: "",
  position: "",
  status: JOB_STATUSES.APPLIED,
  notes: "",
  date: new Date().toISOString(),
};

export const useJobForm = () => {
  const [formData, setFormData] = useState<JobData>(initialFormData);

  const updateFormData = useCallback((updates: Partial<JobData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const setJobFromLinkedIn = useCallback((jobData: Partial<JobData>) => {
    setFormData((prev) => ({
      ...prev,
      company: jobData.company || prev.company,
      position: jobData.position || prev.position,
      notes: jobData.notes || prev.notes,
    }));
  }, []);

  return {
    formData,
    updateFormData,
    resetForm,
    setJobFromLinkedIn,
  };
};
