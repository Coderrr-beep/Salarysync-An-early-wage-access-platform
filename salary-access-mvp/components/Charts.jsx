"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ================= DONUT CHART (UNCHANGED) ================= */

export function AnimatedDonutChart({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 14,
  label,
  color = "#22c55e",
  secondaryColor = "#1f2937",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const safeMax = max <= 0 ? 1 : max;
  const progress = Math.min(Math.max(value / safeMax, 0), 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference.toFixed(2);
  const dashOffset = (circumference * (1 - progress)).toFixed(2);
  const percentage = Math.round(progress * 100);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          fill="transparent"
          initial={{ strokeDashoffset: dashArray, opacity: 0 }}
          animate={{
            strokeDashoffset: isLoaded ? dashOffset : dashArray,
            opacity: isLoaded ? 1 : 0,
          }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.5 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <span className="text-2xl font-semibold text-white">
          {percentage}
          <span className="text-xs text-gray-400">%</span>
        </span>
        {label && (
          <span className="mt-1 text-[11px] text-gray-400 text-center px-2">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ================= FIXED BAR CHART ================= */

export function AnimatedBarChart({ data = [], height = 160 }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-end gap-4" style={{ height }}>
        {data.map((item, idx) => {
          const value = item.value || 0;
          const barHeightPx = Math.max(
            8,
            (value / maxValue) * height
          );

          return (
            <motion.div
              key={item.label || idx}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: isLoaded ? barHeightPx : 0,
                  opacity: isLoaded ? 1 : 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.3 + idx * 0.15,
                  ease: "easeOut",
                }}
                className="w-full rounded-t-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(to top, ${item.color}, ${item.color}80)`,
                  boxShadow: `0 4px 20px ${item.color}40`,
                }}
              >
                {isLoaded && value > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                    {value.toLocaleString()}
                  </div>
                )}
              </motion.div>

              <div className="mt-3 text-xs font-medium text-gray-300">
                {item.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
