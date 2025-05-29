"use client";

import { motion } from "framer-motion";

interface MemorizuLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function MemorizuLoading({ message = "Carregando...", size = "md" }: MemorizuLoadingProps) {
  const getLogoSize = () => {
    switch (size) {
      case "sm":
        return "w-16 h-16";
      case "lg":
        return "w-40 h-40";
      default:
        return "w-24 h-24";
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case "sm":
        return "w-20 h-20";
      case "lg":
        return "w-44 h-44";
      default:
        return "w-28 h-28";
    }
  };

  // Floating animation
  const floatingAnimation = {
    y: [-8, 8, -8],
    transition: {
      duration: 2.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  };

  // Pulse animation for the glow
  const pulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  };

  // Rotation animation
  const rotateAnimation = {
    rotateY: [0, 360],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  };

  // Loading dots animation
  const dotsAnimation = {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl" animate={floatingAnimation} />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 },
          }}
        />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Container */}
        <motion.div className={`relative mx-auto mb-8 flex items-center justify-center ${getContainerSize()}`} animate={floatingAnimation}>
          {/* Glow Effect */}
          <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-xl" animate={pulseAnimation} />

          {/* Rotating Border */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-border"
            style={{
              background: "linear-gradient(white, white) padding-box, linear-gradient(45deg, var(--primary), #8b5cf6, var(--primary)) border-box",
            }}
            animate={{
              rotate: 360,
              transition: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
            }}
          />

          {/* Logo */}
          <motion.img
            src="/memorizu3d.png"
            alt="Memorizu Loading"
            className={`relative z-10 drop-shadow-2xl ${getLogoSize()}`}
            animate={rotateAnimation}
            style={{
              filter: "drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.3))",
            }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold memorizu-gradient-text">{message}</h2>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-primary rounded-full"
                animate={dotsAnimation}
                transition={{
                  ...dotsAnimation.transition,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 w-64 mx-auto"
        >
          <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full memorizu-gradient rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Preparando sua experiência...
        </motion.p>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 right-10 text-4xl opacity-20"
        animate={{
          rotate: [0, 360],
          transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      >
        ✨
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-10 text-3xl opacity-20"
        animate={{
          rotate: [360, 0],
          transition: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      >
        💫
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-20 text-2xl opacity-15"
        animate={{
          y: [-20, 20, -20],
          transition: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      >
        🚀
      </motion.div>
    </div>
  );
}
