import { create } from 'zustand';

interface WorkspaceState {
  selectedResumeId: string | null;
  selectedJobIds: string[];

  setSelectedResumeId: (resumeId: string | null) => void;
  toggleJobId: (jobId: string) => void;
  setSelectedJobIds: (jobIds: string[]) => void;
  resetSelection: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  selectedResumeId: null,
  selectedJobIds: [],
  activeConversationId: null,

  setSelectedResumeId: (resumeId) => set({ selectedResumeId: resumeId }),
  toggleJobId: (jobId) =>
    set((state) => {
      return {
        selectedJobIds: state.selectedJobIds.includes(jobId)
          ? state.selectedJobIds.filter((id) => id !== jobId)
          : [...state.selectedJobIds, jobId],
      };
    }),
  setSelectedJobIds: (jobIds) => set({ selectedJobIds: jobIds }),
  resetSelection: () =>
    set({
      selectedResumeId: null,
      selectedJobIds: [],
    }),
}));
