import React, { useRef, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Vengeance UI QuantumSpotlightCard
 * Dynamic cursor-following radial light beam for modern bento grids
 */
export function QuantumSpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(0, 242, 254, 0.15)",
  spotlightSize = 350,
  ...props
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:border-primary-container/70 group",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Beam */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export default QuantumSpotlightCard;

