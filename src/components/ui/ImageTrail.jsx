"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Cpu, Sparkles, CheckCircle2 } from "lucide-react";

const DEFAULT_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 26,
};

const DEFAULT_EXIT_TRANSITION = {
  duration: 0.35,
  ease: "easeInOut",
};

/**
 * ImageTrail Component (Vengeance UI Pattern)
 * Displays a cursor-following trail of items (images or full interactive algorithm cards)
 */
export function ImageTrail({
  items,
  images,
  renderItem,
  threshold = 60,
  minDelay = 40,
  duration = 900,
  maxItems = 6,
  rotationRange = 22,
  imageClassName,
  overlayClassName,
  transition = DEFAULT_TRANSITION,
  exitTransition = DEFAULT_EXIT_TRANSITION,
  disabled = false,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}) {
  const [trail, setTrail] = useState([]);
  const lastPositionRef = useRef(null);
  const lastTimeRef = useRef(0);
  const itemIndexRef = useRef(0);
  const timeoutRefs = useRef(new Set());

  // Support both `items` (objects/algorithms) and `images`
  const activeItems = useMemo(() => {
    if (items && items.length > 0) return items;
    if (images && images.length > 0) {
      return images.map((img) => (typeof img === "string" ? { src: img, alt: "" } : img));
    }
    return [];
  }, [items, images]);

  const safeThreshold = Math.max(0, threshold);
  const safeMinDelay = Math.max(0, minDelay);
  const safeDuration = Math.max(0, duration);
  const safeMaxItems = Math.max(0, Math.floor(maxItems));
  const safeRotationRange = Math.max(0, rotationRange);

  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const removeItem = useCallback((id) => {
    setTrail((current) => current.filter((item) => item.id !== id));
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      onPointerMove?.(event);

      if (disabled || !activeItems.length || safeMaxItems === 0) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      const lastPosition = lastPositionRef.current;
      const now = window.performance.now();

      if (lastPosition) {
        const distance = Math.hypot(position.x - lastPosition.x, position.y - lastPosition.y);

        if (distance < safeThreshold || now - lastTimeRef.current < safeMinDelay) {
          return;
        }
      }

      const currentItem = activeItems[itemIndexRef.current % activeItems.length];
      const id = `${Math.round(now)}-${Math.random().toString(36).slice(2)}`;
      const rotation = Math.random() * safeRotationRange - safeRotationRange / 2;

      itemIndexRef.current = (itemIndexRef.current + 1) % activeItems.length;
      lastPositionRef.current = position;
      lastTimeRef.current = now;

      setTrail((current) => {
        const next = [
          ...current,
          {
            id,
            x: position.x,
            y: position.y,
            data: currentItem,
            rotation,
          },
        ];

        return next.slice(Math.max(0, next.length - safeMaxItems));
      });

      const timeout = window.setTimeout(() => {
        timeoutRefs.current.delete(timeout);
        removeItem(id);
      }, safeDuration);
      timeoutRefs.current.add(timeout);
    },
    [
      disabled,
      activeItems,
      onPointerMove,
      removeItem,
      safeDuration,
      safeMaxItems,
      safeMinDelay,
      safeRotationRange,
      safeThreshold,
    ]
  );

  const handlePointerLeave = useCallback(
    (event) => {
      lastPositionRef.current = null;
      onPointerLeave?.(event);
    },
    [onPointerLeave]
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}

      {/* Floating Animated Algorithm Card Trail Overlay */}
      <div className={cn("pointer-events-none absolute inset-0 z-50 overflow-hidden", overlayClassName)}>
        <AnimatePresence>
          {trail.map((item) => {
            const data = item.data;
            const isAlgorithmCard = data && (data.title || data.math || data.category);

            return (
              <motion.div
                key={item.id}
                className="absolute pointer-events-none select-none"
                style={{ left: item.x, top: item.y }}
                initial={{ x: "-50%", y: "-50%", scale: 0.75, opacity: 0, rotate: item.rotation }}
                animate={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, rotate: item.rotation }}
                exit={{
                  x: "-50%",
                  y: "-50%",
                  scale: 0.45,
                  opacity: 0,
                  rotate: item.rotation * 0.7,
                  transition: exitTransition,
                }}
                transition={transition}
              >
                {/* 1. Custom Render Prop */}
                {renderItem ? (
                  renderItem(data, item)
                ) : isAlgorithmCard ? (
                  /* 2. Rich Mini Algorithm Card in the Trail */
                  <div className="w-64 sm:w-72 p-3.5 rounded-xl bg-slate-900/95 dark:bg-[#0A0E17]/95 border border-cyan-400/60 shadow-[0_12px_36px_rgba(0,240,255,0.35)] backdrop-blur-xl flex flex-col gap-2 ring-1 ring-white/10">
                    {/* Header Row: Category Badge + Qubit/Fidelity */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-wider uppercase font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                        {data.category || "ALGORITHM"}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300">
                        <span>{data.n_qubits ?? data.qubits ?? 2}Q</span>
                        <span className="text-slate-500">•</span>
                        <span>D:{data.depth ?? 2}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-semibold">{data.fidelity || "99.9%"}</span>
                      </div>
                    </div>

                    {/* Algorithm Title */}
                    <div className="font-display text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">
                      {data.title}
                    </div>

                    {/* Math Formula Box */}
                    {data.math && (
                      <div className="px-2 py-1 rounded bg-black/70 border border-slate-800 font-mono text-[10px] text-cyan-300 truncate">
                        {data.math}
                      </div>
                    )}

                    {/* Circuit Operations Preview Ribbon */}
                    {data.operations && data.operations.length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5 overflow-hidden">
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">Gates:</span>
                        <div className="flex items-center gap-1 overflow-x-hidden">
                          {data.operations.slice(0, 4).map((op, opIdx) => (
                            <span
                              key={opIdx}
                              className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-cyan-200"
                            >
                              {op.gate}
                            </span>
                          ))}
                          {data.operations.length > 4 && (
                            <span className="text-[8px] font-mono text-slate-400">+{data.operations.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono text-[9px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Qiskit Aer Verified
                      </span>
                      <span className="text-cyan-400 font-semibold">Ready to Load →</span>
                    </div>
                  </div>
                ) : (
                  /* 3. Image Fallback */
                  <div className="relative p-1 rounded-xl bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_24px_rgba(0,240,255,0.4)] backdrop-blur-md">
                    <img
                      src={data.src}
                      alt={data.alt || "Visual"}
                      draggable={false}
                      className={cn(
                        "block aspect-[4/3] w-36 select-none rounded-lg object-cover ring-1 ring-white/10",
                        imageClassName
                      )}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ImageTrail;
