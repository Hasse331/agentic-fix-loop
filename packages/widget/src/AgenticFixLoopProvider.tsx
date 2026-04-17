"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState
} from "react";

interface AgenticFixLoopContextValue {
  projectName: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AgenticFixLoopContext.Provider
      value={{
        projectName,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false)
      }}
    >
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
