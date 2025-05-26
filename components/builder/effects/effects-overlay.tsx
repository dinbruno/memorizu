"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Falling Hearts Effect
interface FallingHeartsProps {
  data: {
    count: number
    speed: number
    size: number
    color: string
    shape: "heart" | "star" | "circle" | "flower"
    direction: "down" | "up" | "diagonal"
    opacity: number
    duration: number
    enabled: boolean
  }
}

function FallingHeartsOverlay({ data }: FallingHeartsProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    if (!data.enabled) {
      setHearts([])
      return
    }

    const newHearts = Array.from({ length: data.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * data.duration,
    }))
    setHearts(newHearts)
  }, [data.count, data.duration, data.enabled])

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "heart":
        return "❤️"
      case "star":
        return "⭐"
      case "circle":
        return "●"
      case "flower":
        return "🌸"
      default:
        return "❤️"
    }
  }

  const getAnimationDirection = () => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800
    switch (data.direction) {
      case "up":
        return { y: [vh + 50, -50] }
      case "diagonal":
        return {
          y: [-50, vh + 50],
          x: [-50, 50],
        }
      default:
        return { y: [-50, vh + 50] }
    }
  }

  if (!data.enabled) return null

  return (
    <>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none"
          style={{
            left: `${heart.x}%`,
            fontSize: `${data.size}px`,
            color: data.color,
            opacity: data.opacity,
            zIndex: 100,
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            ...getAnimationDirection(),
            opacity: [0, data.opacity, 0],
          }}
          transition={{
            duration: data.speed,
            delay: heart.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {getShapeIcon(data.shape)}
        </motion.div>
      ))}
    </>
  )
}

// Floating Bubbles Effect
interface FloatingBubblesProps {
  data: {
    count: number
    minSize: number
    maxSize: number
    color: string
    speed: number
    opacity: number
    blur: boolean
    enabled: boolean
  }
}

function FloatingBubblesOverlay({ data }: FloatingBubblesProps) {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    if (!data.enabled) {
      setBubbles([])
      return
    }

    const newBubbles = Array.from({ length: data.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (data.maxSize - data.minSize) + data.minSize,
      delay: Math.random() * 5,
    }))
    setBubbles(newBubbles)
  }, [data.count, data.minSize, data.maxSize, data.enabled])

  if (!data.enabled) return null

  return (
    <>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: data.color,
            opacity: data.opacity,
            filter: data.blur ? "blur(1px)" : "none",
            zIndex: 99,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: data.speed,
            delay: bubble.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  )
}

// Sparkle Effect
interface SparkleEffectProps {
  data: {
    count: number
    size: number
    color: string
    secondaryColor: string
    speed: number
    intensity: number
    pattern: "random" | "circular" | "wave"
    enabled: boolean
  }
}

function SparkleEffectOverlay({ data }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>(
    [],
  )

  useEffect(() => {
    if (!data.enabled) {
      setSparkles([])
      return
    }

    const newSparkles = Array.from({ length: data.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      color: Math.random() > 0.5 ? data.color : data.secondaryColor,
    }))
    setSparkles(newSparkles)
  }, [data.count, data.color, data.secondaryColor, data.enabled])

  const getPatternAnimation = (index: number) => {
    switch (data.pattern) {
      case "circular":
        return {
          rotate: [0, 360],
          scale: [0, 1, 0],
        }
      case "wave":
        return {
          y: [0, -20, 0],
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
        }
      default:
        return {
          scale: [0, 1, 0],
          rotate: [0, 360],
          opacity: [0, 1, 0],
        }
    }
  }

  if (!data.enabled) return null

  return (
    <>
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${data.size}px`,
            height: `${data.size}px`,
            zIndex: 98,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={getPatternAnimation(index)}
          transition={{
            duration: data.speed,
            delay: sparkle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle, ${sparkle.color} 0%, transparent 70%)`,
              filter: `brightness(${data.intensity * 0.5})`,
            }}
          />
        </motion.div>
      ))}
    </>
  )
}

// Confetti Effect
interface ConfettiProps {
  data: {
    count: number
    colors: string[]
    shapes: string[]
    speed: number
    spread: number
    gravity: number
    trigger: "continuous" | "burst"
    enabled: boolean
  }
}

function ConfettiOverlay({ data }: ConfettiProps) {
  const [confetti, setConfetti] = useState<
    Array<{
      id: number
      x: number
      y: number
      rotation: number
      color: string
      shape: string
      delay: number
    }>
  >([])

  useEffect(() => {
    if (!data.enabled) {
      setConfetti([])
      return
    }

    const newConfetti = Array.from({ length: data.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: data.colors[Math.floor(Math.random() * data.colors.length)],
      shape: data.shapes[Math.floor(Math.random() * data.shapes.length)],
      delay: data.trigger === "burst" ? Math.random() * 0.5 : Math.random() * 3,
    }))
    setConfetti(newConfetti)
  }, [data.count, data.colors, data.shapes, data.trigger, data.enabled])

  const getShapeElement = (shape: string, color: string) => {
    switch (shape) {
      case "square":
        return <div className="w-3 h-3" style={{ backgroundColor: color }} />
      case "circle":
        return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      case "triangle":
        return (
          <div
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent"
            style={{ borderBottomColor: color }}
          />
        )
      case "star":
        return <span style={{ color, fontSize: "12px" }}>⭐</span>
      default:
        return <div className="w-3 h-3" style={{ backgroundColor: color }} />
    }
  }

  if (!data.enabled) return null

  const vh = typeof window !== "undefined" ? window.innerHeight : 800

  return (
    <>
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute pointer-events-none"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            zIndex: 101,
          }}
          initial={{
            y: -20,
            x: 0,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: vh + 50,
            x: [(Math.random() - 0.5) * data.spread, (Math.random() - 0.5) * data.spread],
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: data.speed,
            delay: piece.delay,
            repeat: data.trigger === "continuous" ? Number.POSITIVE_INFINITY : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {getShapeElement(piece.shape, piece.color)}
        </motion.div>
      ))}
    </>
  )
}

// Main Effects Overlay Component
interface EffectsOverlayProps {
  effects: Array<{
    type: string
    data: any
  }>
}

export function EffectsOverlay({ effects }: EffectsOverlayProps) {
  console.log("EffectsOverlay rendering with effects:", effects)

  if (!effects || effects.length === 0) {
    console.log("No effects to render")
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      {effects.map((effect, index) => {
        console.log("Rendering effect:", effect.type, effect.data)
        switch (effect.type) {
          case "falling-hearts":
            return <FallingHeartsOverlay key={`falling-hearts-${index}`} data={effect.data} />
          case "floating-bubbles":
            return <FloatingBubblesOverlay key={`floating-bubbles-${index}`} data={effect.data} />
          case "sparkle-effect":
            return <SparkleEffectOverlay key={`sparkle-effect-${index}`} data={effect.data} />
          case "confetti":
            return <ConfettiOverlay key={`confetti-${index}`} data={effect.data} />
          default:
            console.log("Unknown effect type:", effect.type)
            return null
        }
      })}
    </div>
  )
}
