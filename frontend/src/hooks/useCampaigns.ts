"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi, segmentsApi, ariaApi, customersApi, analyticsApi, dataApi } from "@/lib/api";

// ─── Campaigns ──────────────────────────────────────────────────────────

export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: ["campaigns", status],
    queryFn: () => campaignsApi.list(status),
    refetchInterval: 5000, // Poll for status updates (draft → running → completed)
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignsApi.get(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "running" ? 3000 : false;
    },
  });
}

export function useCampaignAnalytics(id: string) {
  return useQuery({
    queryKey: ["campaign-analytics", id],
    queryFn: () => campaignsApi.analytics(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.campaign.status === "running" ? 3000 : false;
    },
  });
}

export function useCampaignMessages(id: string) {
  return useQuery({
    queryKey: ["campaign-messages", id],
    queryFn: () => campaignsApi.messages(id),
    refetchInterval: 5000,
  });
}

export function useLaunchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.launch(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

// ─── Segments ───────────────────────────────────────────────────────────

export function useSegments() {
  return useQuery({
    queryKey: ["segments"],
    queryFn: segmentsApi.list,
  });
}

export function useSegmentPreview(id: string | null) {
  return useQuery({
    queryKey: ["segment-preview", id],
    queryFn: () => segmentsApi.preview(id!),
    enabled: !!id,
  });
}

export function useCreateSegmentFromBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: segmentsApi.createFromBrief,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

// ─── ARIA ───────────────────────────────────────────────────────────────

export function useAriaBrief() {
  return useMutation({
    mutationFn: ariaApi.brief,
  });
}

export function useAriaApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ariaApi.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

// ─── Customers ──────────────────────────────────────────────────────────

export function useCustomers(params: Parameters<typeof customersApi.list>[0] = {}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersApi.list(params),
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersApi.get(id!),
    enabled: !!id,
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: analyticsApi.dashboard,
    refetchInterval: 10000,
  });
}

// ─── Seed ───────────────────────────────────────────────────────────────

export function useSeedDatabase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dataApi.seed,
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useDataStats() {
  return useQuery({
    queryKey: ["data-stats"],
    queryFn: dataApi.stats,
  });
}
