"use client";

import {
  createContext,
  type ReactNode,
  useContext
} from "react";

interface AgenticFixLoopContextValue {
  projectName: string;
}

export interface AgenticFixLoopProviderProps {
  projectName: string;
  children: ReactNode;
}

const AgenticFixLoopContext =
  createContext<AgenticFixLoopContextValue | null>(null);

export function AgenticFixLoopProvider({
  projectName,
  children
}: AgenticFixLoopProviderProps) {
  return (
    <AgenticFixLoopContext.Provider value={{ projectName }}>
      {children}
    </AgenticFixLoopContext.Provider>
  );
}

export function useAgenticFixLoop(): AgenticFixLoopContextValue {
  const context = useContext(AgenticFixLoopContext);

  if (!context) {
    throw new Error(
      "useAgenticFixLoop must be used inside AgenticFixLoopProvider"
    );
  }

  return context;
}
