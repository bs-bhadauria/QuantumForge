"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "../../lib/utils";

const DEFAULT_ASCII_CHARS = "........:::=+xX#0369";
const HIGHLIGHT_LIFETIME = 300;
const CLUSTER_SIZE = 12;
const PARALLAX_EASE = 0.05;

/** Build the ASCII cell grid for one image by sampling its brightness */
function buildHandCells(image, columns, asciiChars) {
  const rows = Math.max(
    1,
    Math.round(columns / (image.naturalWidth / image.naturalHeight || 1))
  );

  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = rows;
  const sampleCtx = sampler.getContext("2d");
  const cells = new Map();
  if (!sampleCtx) return { rows, cells };

  sampleCtx.drawImage(image, 0, 0, columns, rows);
  const pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
  const backgroundCharIndex = asciiChars.lastIndexOf(".");

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const offset = (row * columns + col) * 4;
      const brightness =
        (pixels[offset] * 0.299 +
          pixels[offset + 1] * 0.587 +
          pixels[offset + 2] * 0.114) /
        255;
      const charIndex = Math.min(
        asciiChars.length - 1,
        Math.floor((1 - brightness) * asciiChars.length)
      );
      if (charIndex <= backgroundCharIndex) continue;

      cells.set(`${col},${row}`, {
        col,
        row,
        char: asciiChars[charIndex],
        highlightEndTime: 0,
      });
    }
  }

  return { rows, cells };
}

/** Light up a wandering cluster of cells starting from startCell */
function highlightCluster(startCell, cells, now) {
  const visited = new Set();
  const queue = [startCell];

  while (queue.length > 0 && visited.size < CLUSTER_SIZE) {
    const current = queue.shift();
    const key = `${current.col},${current.row}`;
    if (visited.has(key)) continue;

    visited.add(key);
    current.highlightEndTime = now + HIGHLIGHT_LIFETIME;

    const neighbors = [
      cells.get(`${current.col + 1},${current.row}`),
      cells.get(`${current.col - 1},${current.row}`),
      cells.get(`${current.col},${current.row + 1}`),
      cells.get(`${current.col},${current.row - 1}`),
    ].filter(Boolean);

    for (const neighbor of neighbors) {
      if (!visited.has(`${neighbor.col},${neighbor.row}`) && Math.random() < 0.6) {
        queue.push(neighbor);
      }
    }
  }
}

export function AnimatedFooter({
  headingLines = ["QuantumForge"],
  leftImage = "/animated-footer/hand-left.jpg",
  rightImage = "/animated-footer/hand-right.jpg",
  background = "#000000",
  textColor = "#ffffff",
  charColor,
  hoverColor,
  hoverCharColor,
  asciiChars = DEFAULT_ASCII_CHARS,
  columns = 80,
  cellSize = 20,
  fontSize = 18,
  parallaxStrength = 20,
  hoverRadius = 8,
  revealOnScroll = true,
  revealed,
  className,
}) {
  const rootRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const leftWrapRef = useRef(null);
  const rightWrapRef = useRef(null);

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkDark = () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    setIsDark(checkDark());

    const observer = new MutationObserver(() => setIsDark(checkDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const liveRef = useRef({
    charColor: charColor || (isDark ? "#484f58" : "#8c959f"),
    hoverColor: hoverColor || "#f0883e",
    hoverCharColor: hoverCharColor || "#ffffff",
    parallaxStrength,
    hoverRadius,
  });

  useEffect(() => {
    liveRef.current = {
      charColor: charColor || (isDark ? "#484f58" : "#8c959f"),
      hoverColor: hoverColor || "#f0883e",
      hoverCharColor: hoverCharColor || "#ffffff",
      parallaxStrength,
      hoverRadius,
    };
  }, [isDark, charColor, hoverColor, hoverCharColor, parallaxStrength, hoverRadius]);

  const animateInRef = useRef(() => {});
  const animateOutRef = useRef(() => {});

  const sig = useMemo(
    () =>
      [
        leftImage,
        rightImage,
        columns,
        cellSize,
        fontSize,
        asciiChars,
        headingLines.join("|"),
      ].join("::"),
    [leftImage, rightImage, columns, cellSize, fontSize, asciiChars, headingLines]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chars = Array.from(root.querySelectorAll("[data-af-char]"));
    const hands = [];

    const setupHand = (image, canvas, direction) => {
      const { rows, cells } = buildHandCells(image, columns, asciiChars);
      canvas.width = columns * cellSize;
      canvas.height = rows * cellSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const baselineOffset = Math.round(fontSize * 0.1);

      hands.push({
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns,
        cellSize,
        baselineOffset,
        direction,
      });
    };

    const loadHand = (src, canvas, direction) => {
      if (!src || !canvas) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      let initialized = false;
      const init = () => {
        if (initialized) return;
        initialized = true;
        setupHand(image, canvas, direction);
      };
      image.onload = init;
      image.src = src;
      if (image.complete && image.naturalWidth) init();
    };

    loadHand(leftImage, leftCanvasRef.current, 1);
    loadHand(rightImage, rightCanvasRef.current, -1);

    const renderHand = (hand, now) => {
      const { ctx, cellList, cellSize: cs, baselineOffset, columns: cols, rows } = hand;
      const { charColor: cc, hoverColor: hc, hoverCharColor: hcc } = liveRef.current;
      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = hc;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.fillStyle = isHighlighted ? hcc : cc;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const curtain = { offset: 0 };

    const onMouseMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;

      const now = performance.now();
      for (const hand of hands) {
        const rect = hand.canvas.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          continue;
        }

        const col = Math.floor(((e.clientX - rect.left) / rect.width) * hand.columns);
        const row = Math.floor(((e.clientY - rect.top) / rect.height) * hand.rows);
        const radius = liveRef.current.hoverRadius;

        for (let dc = -radius; dc <= radius; dc++) {
          for (let dr = -radius; dr <= radius; dr++) {
            if (dc * dc + dr * dr > radius * radius) continue;
            const targetCell = hand.cells.get(`${col + dc},${row + dr}`);
            if (targetCell && Math.random() < 0.25) {
              highlightCluster(targetCell, hand.cells, now);
            }
          }
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    let rafId = 0;
    const tick = (now) => {
      const { parallaxStrength: ps } = liveRef.current;
      drift.x += (pointer.x * ps - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y * ps - drift.y) * PARALLAX_EASE;

      if (leftWrapRef.current) {
        leftWrapRef.current.style.transform = `translate3d(${drift.x - curtain.offset}%, ${drift.y}px, 0)`;
      }
      if (rightWrapRef.current) {
        rightWrapRef.current.style.transform = `translate3d(${drift.x + curtain.offset}%, ${drift.y}px, 0)`;
      }

      for (const hand of hands) renderHand(hand, now);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const animateIn = () => {
      gsap.to(curtain, { offset: 0, duration: 1.0, ease: "power3.out", overwrite: true });
      gsap.fromTo(
        chars,
        { y: 35, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: { each: 0.03, from: "center" },
          overwrite: true,
        }
      );
    };

    const animateOut = () => {
      gsap.to(curtain, { offset: 100, duration: 0.4, ease: "power2.in", overwrite: true });
    };

    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;

    // Trigger animate in immediately on mount and set up observer
    animateIn();

    let observer = null;
    if (revealOnScroll) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              animateIn();
            }
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(root);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      observer?.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
  }, [sig, revealOnScroll]);

  return (
    <footer
      ref={rootRef}
      className={cn(
        "relative flex min-h-[460px] sm:min-h-[500px] w-full flex-col items-center justify-end overflow-hidden px-gutter pb-8 pt-8 select-none",
        className
      )}
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      {/* Interactive ASCII Hands layer */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
        <div
          ref={leftWrapRef}
          className="relative w-2/5 min-w-[200px] will-change-transform"
          style={{ transform: "translateX(0%)" }}
        >
          <canvas ref={leftCanvasRef} className="block h-auto w-full" />
        </div>
        <div
          ref={rightWrapRef}
          className="relative w-2/5 min-w-[200px] will-change-transform"
          style={{ transform: "translateX(0%)" }}
        >
          <canvas ref={rightCanvasRef} className="block h-auto w-full" />
        </div>
      </div>

      {/* Giant Typography: "QuantumForge" */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pb-2">
        {headingLines.map((line, i) => (
          <h2
            key={i}
            className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-none text-white text-center drop-shadow-[0_4px_24px_rgba(255,255,255,0.35)]"
          >
            {Array.from(line).map((char, j) => (
              <span
                key={j}
                data-af-char
                className="inline-block will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
        ))}
      </div>
    </footer>
  );
}

export default AnimatedFooter;
