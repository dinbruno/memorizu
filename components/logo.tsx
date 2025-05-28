"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ className, size = "md", withText = true }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <motion.div
        className={cn("rounded-lg memorizu-gradient flex items-center justify-center text-white font-bold", sizes[size])}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image src="/MEMORIZU.png" alt="Memorizu" width={48} height={48} className="rounded-lg" />
      </motion.div>
      {withText && <span className={cn("font-bold", textSizes[size])}>Memorizu</span>}
    </Link>
  );
}
