"use client";

import { useContext } from "react";
import { CursorContext, CursorContextValue } from "./CursorContext";

export function useCursor(): CursorContextValue {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}

export function useCursorContext(): CursorContextValue {
  return useCursor();
}
