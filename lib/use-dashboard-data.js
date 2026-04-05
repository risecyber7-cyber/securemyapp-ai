"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  generateReport,
  getFinding,
  getRemediation,
  getWorkspaceBundle,
  regenerateFix,
  submitScan,
  updateFindingStatus,
} from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";

const FALLBACK_WORKSPACE = {
  id: "workspace-pending",
  name: "SecureMyApp Workspace",
  owner: { name: "Workspace Owner", email: "owner@securemyapp.ai" },
  members: [],
};

export function useDashboardData() {
  const queryClient = useQueryClient();
  const selectedFindingId = useUiStore((state) => state.selectedFindingId);
  const setSelectedFindingId = useUiStore((state) => state.setSelectedFindingId);
  const reportAudience = useUiStore((state) => state.reportAudience);
  const pushToast = useUiStore((state) => state.pushToast);

  const bundleQuery = useQuery({
    queryKey: ["workspace-bundle"],
    queryFn: getWorkspaceBundle,
    refetchInterval: (query) => {
      const scans = query.state.data?.scans || [];
      return scans.some((scan) => ["queued", "running"].includes(scan.status)) ? 5000 : false;
    },
  });

  const findings = bundleQuery.data?.findings || [];

  useEffect(() => {
    if (!selectedFindingId && findings[0]?.id) {
      setSelectedFindingId(findings[0].id);
    }
  }, [findings, selectedFindingId, setSelectedFindingId]);

  const selectedFinding = useMemo(
    () => findings.find((finding) => finding.id === selectedFindingId) || null,
    [findings, selectedFindingId],
  );

  const remediationQuery = useQuery({
    queryKey: ["remediation", selectedFindingId],
    queryFn: () => getRemediation(selectedFindingId),
    enabled: Boolean(selectedFindingId),
  });

  const findingQuery = useQuery({
    queryKey: ["finding", selectedFindingId],
    queryFn: () => getFinding(selectedFindingId),
    enabled: Boolean(selectedFindingId),
  });

  const scanMutation = useMutation({
    mutationFn: submitScan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] });
      pushToast({ title: "Scan queued.", description: "The new scan was submitted successfully.", tone: "success" });
    },
    onError: (error) => {
      pushToast({ title: "Scan failed to start.", description: error.message, tone: "error" });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ audience, format }) => {
      const latestScanId = bundleQuery.data?.scans?.[0]?.id;
      if (!latestScanId) throw new Error("Run a scan before generating a report.");
      return generateReport({ scanId: latestScanId, audience: audience || reportAudience, format });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] });
      pushToast({ title: "Report generated.", description: "The new report is available in the library.", tone: "success" });
    },
    onError: (error) => {
      pushToast({ title: "Report generation failed.", description: error.message, tone: "error" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] });
      pushToast({ title: "Project created.", description: "The new project is ready for targets and scans.", tone: "success" });
    },
    onError: (error) => {
      pushToast({ title: "Project creation failed.", description: error.message, tone: "error" });
    },
  });

  const regenerateFixMutation = useMutation({
    mutationFn: regenerateFix,
    onSuccess: async (fix, issueId) => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] });
      queryClient.setQueryData(["remediation", issueId], fix);
      pushToast({ title: "Fix regenerated.", description: "A fresh remediation package is ready.", tone: "success" });
    },
    onError: (error) => {
      pushToast({ title: "Fix regeneration failed.", description: error.message, tone: "error" });
    },
  });

  const updateFindingStatusMutation = useMutation({
    mutationFn: ({ findingId, payload }) => updateFindingStatus(findingId, payload),
    onMutate: async ({ findingId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["workspace-bundle"] });
      const previousBundle = queryClient.getQueryData(["workspace-bundle"]);
      const previousFinding = queryClient.getQueryData(["finding", findingId]);

      queryClient.setQueryData(["workspace-bundle"], (current) => ({
        ...current,
        findings: (current?.findings || []).map((finding) =>
          finding.id === findingId
            ? {
                ...finding,
                status: payload.status ?? finding.status,
                falsePositive: payload.false_positive ?? finding.falsePositive,
                assignedToUserId: payload.assigned_to_user_id ?? finding.assignedToUserId,
              }
            : finding,
        ),
      }));

      return { previousBundle, previousFinding };
    },
    onSuccess: (updatedFinding, variables) => {
      queryClient.setQueryData(["finding", updatedFinding.id], updatedFinding);
      pushToast({ title: variables?.successMessage || "Issue updated successfully.", description: variables?.successDescription, tone: "success" });
    },
    onError: (_error, variables, context) => {
      if (context?.previousBundle) queryClient.setQueryData(["workspace-bundle"], context.previousBundle);
      if (context?.previousFinding) queryClient.setQueryData(["finding", variables.findingId], context.previousFinding);
      pushToast({ title: variables?.errorMessage || "Update failed. Changes were rolled back.", description: variables?.errorDescription, tone: "error" });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] });
    },
  });

  return {
    workspace: bundleQuery.data?.workspace || FALLBACK_WORKSPACE,
    projects: bundleQuery.data?.projects || [],
    sites: bundleQuery.data?.sites || [],
    scans: bundleQuery.data?.scans || [],
    findings,
    fixes: bundleQuery.data?.fixes || [],
    reports: bundleQuery.data?.reports || [],
    settings: bundleQuery.data?.settings || null,
    recentActivity: bundleQuery.data?.recentActivity || [],
    trendData: bundleQuery.data?.trendData || [],
    selectedFinding: findingQuery.data || selectedFinding,
    selectedRemediation: remediationQuery.data || null,
    loading: bundleQuery.isLoading || remediationQuery.isLoading || findingQuery.isLoading,
    error: bundleQuery.error,
    reportAudience,
    setSelectedFindingId,
    createScan: scanMutation.mutateAsync,
    creatingScan: scanMutation.isPending,
    createReport: reportMutation.mutate,
    createReportAsync: reportMutation.mutateAsync,
    generatingReport: reportMutation.isPending,
    createProject: createProjectMutation.mutateAsync,
    creatingProject: createProjectMutation.isPending,
    regenerateFix: regenerateFixMutation.mutateAsync,
    regeneratingFix: regenerateFixMutation.isPending,
    updateFindingStatus: updateFindingStatusMutation.mutateAsync,
    updatingFinding: updateFindingStatusMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["workspace-bundle"] }),
  };
}
