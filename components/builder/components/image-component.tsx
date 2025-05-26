"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, Upload } from "lucide-react"
import { ImageGallery } from "../image-gallery"

interface ImageComponentProps {
  data: {
    src: string
    alt: string
    width: "small" | "medium" | "large" | "full"
    alignment: "left" | "center" | "right"
    rounded: boolean
  }
  onUpdate?: (data: any) => void
  isEditable?: boolean
  isInlineEdit?: boolean
}

export function ImageComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: ImageComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [localData, setLocalData] = useState({ ...data })
  const [altEditing, setAltEditing] = useState(false)
  const [editingAlt, setEditingAlt] = useState(data.alt)

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
  }

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData)
    }
    setIsSettingsOpen(false)
  }

  const handleImageSelect = (imageUrl: string) => {
    const updatedData = { ...data, src: imageUrl }
    if (onUpdate) {
      onUpdate(updatedData)
    }
  }

  const handleAltDoubleClick = () => {
    if (isEditable) {
      setAltEditing(true)
    }
  }

  const handleAltBlur = () => {
    setAltEditing(false)
    if (onUpdate && editingAlt !== data.alt) {
      onUpdate({ ...data, alt: editingAlt })
    }
  }

  const handleAltKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setAltEditing(false)
      if (onUpdate && editingAlt !== data.alt) {
        onUpdate({ ...data, alt: editingAlt })
      }
    }
  }

  const widthClasses = {
    small: "w-48",
    medium: "w-64",
    large: "w-96",
    full: "w-full",
  }

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Image Source</Label>
          <div className="flex gap-2">
            <Input
              value={localData.src}
              onChange={(e) => handleSettingsChange("src", e.target.value)}
              placeholder="Image URL or upload from gallery"
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setIsGalleryOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Gallery
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={localData.alt}
            onChange={(e) => handleSettingsChange("alt", e.target.value)}
            placeholder="Describe the image"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Width</Label>
            <Select value={localData.width} onValueChange={(value) => handleSettingsChange("width", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select value={localData.alignment} onValueChange={(value) => handleSettingsChange("alignment", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rounded"
            checked={localData.rounded}
            onChange={(e) => handleSettingsChange("rounded", e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="rounded">Rounded corners</Label>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Apply Changes
        </Button>

        <ImageGallery
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelectImage={handleImageSelect}
        />
      </div>
    )
  }

  return (
    <div className="p-6 relative">
      {isEditable && !isInlineEdit && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Image settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image Source</Label>
                <div className="flex gap-2">
                  <Input
                    value={localData.src}
                    onChange={(e) => handleSettingsChange("src", e.target.value)}
                    placeholder="Image URL or upload from gallery"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => setIsGalleryOpen(true)}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={localData.alt}
                  onChange={(e) => handleSettingsChange("alt", e.target.value)}
                  placeholder="Describe the image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Select value={localData.width} onValueChange={(value) => handleSettingsChange("width", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select
                    value={localData.alignment}
                    onValueChange={(value) => handleSettingsChange("alignment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rounded"
                  checked={localData.rounded}
                  onChange={(e) => handleSettingsChange("rounded", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="rounded">Rounded corners</Label>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className={cn("flex", alignmentClasses[data.alignment])}>
        <div className={cn(widthClasses[data.width], "relative")}>
          <img
            src={data.src || "/placeholder.svg?height=300&width=400&query=image placeholder"}
            alt={data.alt}
            className={cn("w-full h-auto object-cover", data.rounded ? "rounded-lg" : "")}
          />
          {altEditing ? (
            <input
              type="text"
              value={editingAlt}
              onChange={(e) => setEditingAlt(e.target.value)}
              onBlur={handleAltBlur}
              onKeyDown={handleAltKeyDown}
              className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm"
              autoFocus
            />
          ) : (
            data.alt && (
              <div
                className={cn(
                  "absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm",
                  isEditable ? "cursor-text" : "",
                )}
                onDoubleClick={handleAltDoubleClick}
              >
                {data.alt}
              </div>
            )
          )}
        </div>
      </div>

      <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
    </div>
  )
}
