"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CursorType =
  | "default"
  | "view"
  | "open"
  | "play"
  | "drag"
  | "book"
  | "click"
  | "caret"
  | string;

export type CursorSize = "small" | "default" | "large" | "xl" | string;

export interface CursorState {
  type: CursorType;
  text?: string;
  size?: CursorSize;
  image?: string;
  color?: string;
  isHovered?: boolean;
  isDragging?: boolean;
  isActive?: boolean;
}

export interface CursorContextValue {
  state: CursorState;
  setState: React.Dispatch<React.SetStateAction<CursorState>>;
  setCursor: (options: Partial<CursorState>) => void;
  resetCursor: () => void;
  triggerRipple: (x: number, y: number) => void;
  triggerParticles: (x: number, y: number) => void;
  rippleCoords: { x: number; y: number; id: number } | null;
  particleBurst: { x: number; y: number; id: number } | null;
  isTouchDevice: boolean;
}

const initialCursorState: CursorState = {
  type: "default",
  text: "",
  size: "default",
  image: undefined,
  color: undefined,
  isHovered: false,
  isDragging: false,
  isActive: true,
};

export const CursorContext = createContext<CursorContextValue>({
  state: initialCursorState,
  setState: () => {},
  setCursor: () => {},
  resetCursor: () => {},
  triggerRipple: () => {},
  triggerParticles: () => {},
  rippleCoords: null,
  particleBurst: null,
  isTouchDevice: false,
});

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CursorState>(initialCursorState);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number; id: number } | null>(
    null
  );
  const [particleBurst, setParticleBurst] = useState<{ x: number; y: number; id: number } | null>(
    null
  );

  // Detect touch device and reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkTouch = () => {
      const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        hasCoarsePointer;
      setIsTouchDevice(isTouch);
      if (isTouch) {
        document.documentElement.classList.remove("custom-cursor-active");
      } else {
        document.documentElement.classList.add("custom-cursor-active");
      }
    };

    checkTouch();
    window.addEventListener("resize", checkTouch);

    // Add global CSS styles to hide browser cursor on desktop only
    const styleEl = document.createElement("style");
    styleEl.id = "custom-cursor-styles";
    styleEl.innerHTML = `
      @media (pointer: fine) {
        html.custom-cursor-active,
        html.custom-cursor-active * {
          cursor: none !important;
        }
        html.custom-cursor-active input,
        html.custom-cursor-active textarea,
        html.custom-cursor-active [contenteditable="true"] {
          cursor: text !important;
        }
      }
    `;
    if (!document.getElementById("custom-cursor-styles")) {
      document.head.appendChild(styleEl);
    }

    return () => {
      window.removeEventListener("resize", checkTouch);
      const el = document.getElementById("custom-cursor-styles");
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  const setCursor = useCallback((options: Partial<CursorState>) => {
    setState((prev) => ({ ...prev, ...options }));
  }, []);

  const resetCursor = useCallback(() => {
    setState(initialCursorState);
  }, []);

  const triggerRipple = useCallback((x: number, y: number) => {
    setRippleCoords({ x, y, id: Date.now() });
  }, []);

  const triggerParticles = useCallback((x: number, y: number) => {
    setParticleBurst({ x, y, id: Date.now() });
  }, []);

  // Event Delegation for data attributes and default semantic elements
  useEffect(() => {
    if (isTouchDevice || typeof window === "undefined") return;

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !(target instanceof Element)) return;

      // Find closest element with data attributes or semantic tags
      const cursorEl = target.closest(
        "[data-cursor], [data-cursor-label], [data-cursor-text], [data-cursor-size], [data-cursor-image], [data-cursor-color], button, a, input, textarea, select, [role='button']"
      ) as HTMLElement | null;

      if (!cursorEl) {
        if (state.type !== "default" || state.isHovered) {
          resetCursor();
        }
        return;
      }

      const customType = cursorEl.getAttribute("data-cursor") as CursorType | null;
      const customLabel = cursorEl.getAttribute("data-cursor-label") || cursorEl.getAttribute("data-cursor-text");
      const customSize = cursorEl.getAttribute("data-cursor-size") as CursorSize | null;
      const customImage = cursorEl.getAttribute("data-cursor-image");
      const customColor = cursorEl.getAttribute("data-cursor-color");

      const tagName = cursorEl.tagName.toLowerCase();
      const isInputOrTextarea =
        tagName === "input" ||
        tagName === "textarea" ||
        cursorEl.isContentEditable;

      if (isInputOrTextarea) {
        setCursor({
          type: "caret",
          size: "small",
          color: customColor || undefined,
          isHovered: true,
        });
        return;
      }

      if (customLabel || customType) {
        let defaultText = customLabel || (customType ? customType.toUpperCase() : "");
        let defaultSize: CursorSize = "large";

        if (customLabel) {
          defaultSize = "large";
        } else if (customType === "view") defaultText = "VIEW CASE";
        else if (customType === "open") defaultText = "OPEN";
        else if (customType === "play") defaultText = "PLAY REEL";
        else if (customType === "drag") defaultText = "DRAG";
        else if (customType === "book") defaultText = "BOOK NOW";
        else if (customType === "click") {
          defaultText = "CLICK";
          defaultSize = "default";
        }

        setCursor({
          type: customType || "custom-label",
          text: defaultText,
          size: customSize || defaultSize,
          image: customImage || undefined,
          color: customColor || undefined,
          isHovered: true,
        });
        return;
      }

      if (customImage) {
        setCursor({
          type: "image",
          image: customImage,
          size: customSize || "xl",
          color: customColor || undefined,
          isHovered: true,
        });
        return;
      }

      // Default semantic elements fallback
      if (tagName === "button" || cursorEl.getAttribute("role") === "button") {
        setCursor({
          type: "click",
          text: "CLICK",
          size: customSize || "default",
          color: customColor || undefined,
          isHovered: true,
        });
      } else if (tagName === "a") {
        setCursor({
          type: "open",
          text: "OPEN",
          size: customSize || "default",
          color: customColor || undefined,
          isHovered: true,
        });
      } else if (customSize || customColor) {
        setCursor({
          type: "default",
          size: customSize || "default",
          color: customColor || undefined,
          isHovered: true,
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        setCursor({ isDragging: true });
        triggerRipple(e.clientX, e.clientY);
        triggerParticles(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = () => {
      setCursor({ isDragging: false });
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isTouchDevice, setCursor, resetCursor, state.type, state.isHovered, triggerRipple, triggerParticles]);

  return (
    <CursorContext.Provider
      value={{
        state,
        setState,
        setCursor,
        resetCursor,
        triggerRipple,
        triggerParticles,
        rippleCoords,
        particleBurst,
        isTouchDevice,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}
