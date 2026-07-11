"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
