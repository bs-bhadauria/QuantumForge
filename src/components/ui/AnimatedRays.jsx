import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Vengeance UI AnimatedRays
 * Creates shifting aurora-style light rays with subtle animations
 */
export function AnimatedRays({ className = "", children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stripes = `repeating-linear-gradient(
    100deg,
    rgba(0, 242, 254, 0.08) 0%,
    rgba(0, 242, 254, 0.08) 7%,
    transparent 10%,
    transparent 12%,
    rgba(0, 242, 254, 0.08) 16%
  )`;
  
  const quantumGradients = `repeating-linear-gradient(
    100deg,
    #00f2fe 10%,
    #4e1dbe 15%,
    #00f2fe 20%,
    #4edea3 25%,
    #00f2fe 30%
  )`;

  return (
    <div className={cn("relative w-full h-full overflow-hidden pointer-events-none", className)}>
      {/* Background Ray Layer */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `${stripes}, ${quantumGradients}`,
          backgroundSize: "300%, 200%",
          backgroundPosition: "50% 50%, 50% 50%",
          filter: "blur(14px) saturate(180%)",
          maskImage: "radial-gradient(ellipse at 50% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 20%, black 30%, transparent 75%)",
        }}
      >
        <div
          className="absolute inset-0 animate-aurora-bg"
          style={{
            backgroundImage: `${stripes}, ${quantumGradients}`,
            backgroundSize: "200%, 100%",
            backgroundAttachment: "fixed",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {children && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export default AnimatedRays;

