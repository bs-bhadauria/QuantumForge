import React, { useState, useMemo, memo } from "react";
import { cn } from "../../lib/utils";

// Vibrant Vengeance UI color palette for hover matrix
const DEFAULT_PALETTE = [
  "#00f2fe", // electric cyan
  "#4edea3", // quantum emerald
  "#f59e0b", // warm amber
  "#ef4444", // coral red
  "#8b5cf6", // cyber violet
  "#38bdf8", // bright sky blue
  "#10b981", // neon green
  "#f43f5e", // vivid rose
  "#eab308", // golden yellow
  "#06b6d4", // deep teal
  "#ec4899", // hot pink
  "#6366f1", // indigo
];

// Single Grid Cell with instantaneous hover light-up and smooth 1.4s fade-out
const GridCell = memo(function GridCell({ palette }) {
  const [active, setActive] = useState(false);
  const [cellColor, setCellColor] = useState(null);

  const handleMouseEnter = () => {
    const randomColor = palette[Math.floor(Math.random() * palette.length)];
    setCellColor(randomColor);
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-[0.5px] border-white/10 dark:border-white/[0.08] relative box-border"
      style={{
        backgroundColor: active && cellColor ? cellColor : "transparent",
        boxShadow:
          active && cellColor
            ? `0 0 20px ${cellColor}aa, inset 0 0 10px ${cellColor}88`
            : "none",
        transition: active
          ? "none"
          : "background-color 1.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    />
  );
});

/**
 * Vengeance UI PerspectiveGrid
 * 3D perspective matrix background with colorful hover trail effect
 * https://www.vengenceui.com/components/perspective-grid
 */
export function PerspectiveGrid({
  rows = 20,
  cols = 20,
  className = "",
  palette = DEFAULT_PALETTE,
  children,
}) {
  // Memoize cell array
  const totalCells = rows * cols;
  const cells = useMemo(() => Array.from({ length: totalCells }, (_, i) => i), [totalCells]);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden select-none flex items-center justify-center",
        className
      )}
    >
      {/* 3D Perspective Scene Container */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-auto"
        style={{
          perspective: "1000px",
        }}
      >
        {/* Tilted 3D Matrix Plane with Radial Vignette Mask */}
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{
            transform: "rotateX(55deg) rotateZ(-30deg) translateZ(0)",
            transformStyle: "preserve-3d",
            maskImage:
              "radial-gradient(ellipse 65% 65% at 50% 50%, black 25%, rgba(0,0,0,0.7) 55%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 65% at 50% 50%, black 25%, rgba(0,0,0,0.7) 55%, transparent 85%)",
          }}
        >
          {/* CSS Grid Matrix */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {cells.map((index) => (
              <GridCell key={index} palette={palette} />
            ))}
          </div>
        </div>
      </div>

      {/* Ambient Radial Color Bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 242, 254, 0.4) 0%, rgba(78, 222, 163, 0.2) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Vignette Shadow Overlay (Depth Fade) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(10, 13, 20, 0.7) 85%, #0A0D14 100%)",
        }}
      />

      {/* Section Children Layer */}
      {children && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}

export default PerspectiveGrid;
