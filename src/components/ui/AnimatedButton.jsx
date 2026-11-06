import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Vengeance UI AnimatedButton
 * Button featuring a sliding linear-gradient shine sweep across the border and text
 */
export function AnimatedButton({
  children,
  className = "",
  onClick,
  disabled = false,
  ...rest
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative inline-flex items-center justify-center px-6 py-3 rounded-lg overflow-hidden font-semibold text-xs transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        "bg-primary-container text-on-primary-fixed shadow-[0_0_24px_rgba(0,242,254,0.35)] hover:shadow-[0_0_32px_rgba(0,242,254,0.5)] cursor-pointer",
        className
      )}
      {...rest}
    >
      {/* Sliding Shine Sweep */}
      <motion.span
        className="pointer-events-none absolute inset-0 block rounded-lg p-px"
        style={{
          background:
            "linear-gradient(-75deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
        initial={{ backgroundPosition: "100% 0", opacity: 0 }}
        animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1.2,
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export default AnimatedButton;

