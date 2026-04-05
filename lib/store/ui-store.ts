import { create } from "zustand";

type UiState = {
  selectedFindingId: string | null;
  reportAudience: "developer" | "stakeholder";
  theme: "light" | "dark";
  toasts: Array<{ id: string; title: string; description?: string; tone: "success" | "error" | "info" }>;
  setSelectedFindingId: (findingId: string | null) => void;
  setReportAudience: (audience: "developer" | "stakeholder") => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  pushToast: (toast: { title: string; description?: string; tone: "success" | "error" | "info" }) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedFindingId: null,
  reportAudience: "stakeholder",
  theme: "light",
  toasts: [],
  setSelectedFindingId: (selectedFindingId) => set({ selectedFindingId }),
  setReportAudience: (reportAudience) => set({ reportAudience }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  pushToast: (toast) =>
    set((state) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        toasts: [...state.toasts, { ...toast, id }],
      };
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
