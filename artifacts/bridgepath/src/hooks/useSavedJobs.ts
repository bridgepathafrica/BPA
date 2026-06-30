import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";

function buildHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export function useSavedJobs(isAuthenticated: boolean) {
  const queryClient = useQueryClient();

  const { data: savedJobs = [], isLoading } = useQuery<any[]>({
    queryKey: ["saved-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/saved-jobs", { headers: buildHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const savedIds = new Set<number>(
    savedJobs.map((s: any) => s.job?.id ?? s.jobId).filter(Boolean)
  );

  const saveJob = useCallback(async (jobId: number): Promise<boolean> => {
    const res = await fetch("/api/saved-jobs", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ jobId }),
    });
    queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    return res.ok || res.status === 409;
  }, [queryClient]);

  const unsaveJob = useCallback(async (jobId: number): Promise<boolean> => {
    const res = await fetch(`/api/saved-jobs/${jobId}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    return res.ok || res.status === 204;
  }, [queryClient]);

  const toggleSave = useCallback(async (jobId: number) => {
    if (savedIds.has(jobId)) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  }, [savedIds, saveJob, unsaveJob]);

  return { savedJobs, savedIds, isLoading, saveJob, unsaveJob, toggleSave };
}
