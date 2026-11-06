import React from "react";
import { cn } from "../../lib/utils";

/**
 * Vengeance UI GlowBorderCard
 * Card with dynamic rotating conic gradient border glow
 */
export function GlowBorderCard({
  children,
  className = "",
  borderRadius = "0.75rem",
  animationDuration = 5,
  borderWidth = "2px",
  blurAmount = "12px",
  paused = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-outline-variant/60 bg-surface-container-low transition-all duration-300",
        className
      )}
      style={{
        borderRadius,
        "--glow-animation-duration": `${animationDuration}s`,
      }}
      {...props}
    >
      {/* Glow effect behind border */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-[inherit] -z-10 opacity-75",
          "glow-conic",
          paused && "[animation-play-state:paused]"
        )}
        style={{
          background: `conic-gradient(from 0deg, #00f2fe, #4e1dbe, #4edea3, #00f2fe)`,
          filter: `blur(${blurAmount})`,
        }}
      />

      {/* Card Content container */}
      <div className="relative z-10 w-full h-full rounded-[inherit] bg-surface-container-lowest/95 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

export default GlowBorderCard;

