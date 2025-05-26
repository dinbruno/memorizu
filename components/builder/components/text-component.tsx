"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TextComponentProps {
  data: {
    text: string
    align: "left" | "center" | "right"
    size: "small" | "medium" | "large"
    color: string
  }
  onUpdate?: (data: any) => void
  isEditable?: boolean
}

export function TextComponent({ data, onUpdate, isEditable = false }: TextComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(data.text)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setText(data.text)
  }, [data.text])

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (onUpdate && text !== data.text) {
      onUpdate({ ...data, text })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setIsEditing(false)
      if (onUpdate && text !== data.text) {
        onUpdate({ ...data, text })
      }
    }
  }

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-xl",
  }

  const textAligns = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  return (
    <div
      className={cn("p-4", textAligns[data.align], isEditable ? "cursor-text hover:bg-muted/20 transition-colors" : "")}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          className={cn("outline-none focus:outline-none", textSizes[data.size], textAligns[data.align])}
          style={{ color: data.color || "inherit" }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: text }}
          onInput={(e) => setText(e.currentTarget.innerHTML)}
        />
      ) : (
        <div
          className={cn(textSizes[data.size], textAligns[data.align])}
          style={{ color: data.color || "inherit" }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
    </div>
  )
}
