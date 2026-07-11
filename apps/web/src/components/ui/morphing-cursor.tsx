"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MagneticTextProps {
  text: string
  hoverText?: string
  className?: string
}

export function MagneticText({ text = "CREATIVE", hoverText = "EXPLORE", className }: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const innerTextRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const mousePos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15)
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15)

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`
      }

      if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate(${-currentPos.current.x}px, ${-currentPos.current.y}px)`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mousePos.current = { x, y }
    currentPos.current = { x, y }
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative inline-flex items-center justify-center cursor-none select-none text-5xl font-bold tracking-tighter", className)}
    >
      {/* Base text layer - original text */}
      <span className="text-inherit font-inherit tracking-wide text-foreground">{text}</span>

      <div
        ref={circleRef}
        className="absolute top-0 left-0 pointer-events-none rounded-full bg-foreground overflow-hidden"
        style={{
          width: isHovered ? 150 : 0,
          height: isHovered ? 150 : 0,
          transition: "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
          willChange: "transform, width, height",
        }}
      >
        <div
          ref={innerTextRef}
          className="absolute flex items-center justify-center"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            top: "50%",
            left: "50%",
            willChange: "transform",
          }}
        >
          <span className="text-inherit font-inherit tracking-wide text-background whitespace-nowrap">
            {hoverText}
          </span>
        </div>
      </div>
    </div>
  )
}

export function GlobalCustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    // Only activate on devices that support hover (not touch-only mobile devices)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return
    }

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.2)
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.2)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)
      mousePos.current = { x: e.clientX, y: e.clientY }

      // Check if hovering interactive elements
      const target = e.target as HTMLElement
      if (target) {
        const interactive = target.closest("a, button, input, textarea, select, [role='button'], [data-cursor='hover'], .interactive")
        setIsHovered(!!interactive)
      }
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-2 h-2 rounded-full bg-[#eb3d26] transition-opacity duration-150"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className={cn(
          "fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border transition-all duration-300 ease-out",
          isHovered
            ? "w-12 h-12 border-[#eb3d26] bg-[#eb3d26]/15 scale-110 shadow-[0_0_15px_rgba(235,61,38,0.3)]"
            : "w-8 h-8 border-white/50 bg-white/5"
        )}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  )
}
