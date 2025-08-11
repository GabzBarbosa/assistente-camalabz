import React, { createContext, useContext, useMemo, useState } from "react";

interface SelectionState {
  selectedStoryId: string | null;
  selectedProjectId: string | null;
  setSelection: (params: { storyId?: string | null; projectId?: string | null }) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionState | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const setSelection: SelectionState["setSelection"] = ({ storyId, projectId }) => {
    if (typeof storyId !== "undefined") setSelectedStoryId(storyId);
    if (typeof projectId !== "undefined") setSelectedProjectId(projectId);
  };

  const clearSelection = () => {
    setSelectedStoryId(null);
    setSelectedProjectId(null);
  };

  const value = useMemo(() => ({ selectedStoryId, selectedProjectId, setSelection, clearSelection }), [selectedStoryId, selectedProjectId]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
};
