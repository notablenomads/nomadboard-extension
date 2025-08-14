import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobData } from "@/types";
import { JOB_STATUSES } from "@/config/constants";

interface JobFormProps {
  formData: JobData;
  onFormDataChange: (updates: Partial<JobData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export function JobForm({ formData, onFormDataChange, onSubmit, isLoading = false }: JobFormProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Add New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => onFormDataChange({ company: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => onFormDataChange({ position: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => onFormDataChange({ status: value as JobData["status"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(JOB_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFormDataChange({ notes: e.target.value })}
              className="h-20"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
