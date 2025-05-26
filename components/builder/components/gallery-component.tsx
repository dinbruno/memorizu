"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, Plus, Trash2, Upload } from "lucide-react"
import { ImageGallery } from "../image-gallery"

interface GalleryImage {
  src: string
  alt: string
  caption: string
}

interface GalleryComponentProps {
  data: {
    title: string
    images: GalleryImage[]
    columns: number
    gap: "small" | "medium" | "large"
  }
  onUpdate?: (data: any) => void
  isEditable?: boolean
  isInlineEdit?: boolean
}

export function GalleryComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: GalleryComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [localData, setLocalData] = useState({ ...data })
  const [titleEditing, setTitleEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(data.title)

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
  }

  const handleImageChange = (index: number, field: string, value: string) => {
    const updatedImages = [...localData.images]
    updatedImages[index] = { ...updatedImages[index], [field]: value }
    handleSettingsChange("images", updatedImages)
  }

  const handleAddImage = () => {
    const newImage = {
      src: "/placeholder.svg?height=400&width=600&query=new image",
      alt: "New image",
      caption: "New image caption",
    }
    handleSettingsChange("images", [...localData.images, newImage])
  }

  const handleAddImageFromGallery = () => {
    setIsGalleryOpen(true)
  }

  const handleImageSelect = (imageUrl: string) => {
    const newImage = {
      src: imageUrl,
      alt: "Gallery image",
      caption: "Image from gallery",
    }
    handleSettingsChange("images", [...localData.images, newImage])
    setIsGalleryOpen(false)
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...localData.images]
    updatedImages.splice(index, 1)
    handleSettingsChange("images", updatedImages)
  }

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData)
    }
    setIsSettingsOpen(false)
  }

  const handleTitleDoubleClick = () => {
    if (isEditable) {
      setTitleEditing(true)
    }
  }

  const handleTitleBlur = () => {
    setTitleEditing(false)
    if (onUpdate && editingTitle !== data.title) {
      onUpdate({ ...data, title: editingTitle })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setTitleEditing(false)
      if (onUpdate && editingTitle !== data.title) {
        onUpdate({ ...data, title: editingTitle })
      }
    }
  }

  const gapClasses = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-8",
  }

  const getGridCols = (columns: number) => {
    switch (columns) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      default:
        return "grid-cols-1 md:grid-cols-3"
    }
  }

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Gallery Title</Label>
          <Input
            value={localData.title}
            onChange={(e) => handleSettingsChange("title", e.target.value)}
            placeholder="Gallery title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Columns</Label>
            <Select
              value={localData.columns.toString()}
              onValueChange={(value) => handleSettingsChange("columns", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gap Size</Label>
            <Select value={localData.gap} onValueChange={(value) => handleSettingsChange("gap", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Images ({localData.images.length})</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddImageFromGallery}>
                <Upload className="h-4 w-4 mr-2" />
                From Gallery
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddImage}>
                <Plus className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3">
            {localData.images.map((image, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Image {index + 1}</h5>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveImage(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={image.src}
                      onChange={(e) => handleImageChange(index, "src", e.target.value)}
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => setIsGalleryOpen(true)}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={image.alt}
                    onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                    placeholder="Alt text"
                  />
                  <Input
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                    placeholder="Caption"
                  />
                </div>
              </div>
            ))}
          </div>
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
              <span className="sr-only">Gallery settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="columns">Columns</Label>
                <Select
                  value={localData.columns.toString()}
                  onValueChange={(value) => handleSettingsChange("columns", Number.parseInt(value))}
                >
                  <SelectTrigger id="columns">
                    <SelectValue placeholder="Select columns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gap">Gap Size</Label>
                <Select value={localData.gap} onValueChange={(value) => handleSettingsChange("gap", value)}>
                  <SelectTrigger id="gap">
                    <SelectValue placeholder="Select gap size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Images</h4>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={handleAddImageFromGallery}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddImage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {localData.images.map((image, index) => (
                  <div key={index} className="border rounded-md p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Image {index + 1}</h5>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveImage(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={image.src}
                          onChange={(e) => handleImageChange(index, "src", e.target.value)}
                          placeholder="Image URL"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={() => setIsGalleryOpen(true)}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={image.alt}
                        onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                        placeholder="Alt text"
                      />
                      <Input
                        value={image.caption}
                        onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                        placeholder="Caption"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="space-y-6">
        {titleEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold w-full bg-transparent border-none outline-none focus:ring-0"
            autoFocus
          />
        ) : (
          <h3
            className={cn("text-2xl font-bold text-center", isEditable ? "cursor-text" : "")}
            onDoubleClick={handleTitleDoubleClick}
          >
            {data.title}
          </h3>
        )}

        <div className={cn("grid", getGridCols(data.columns), gapClasses[data.gap])}>
          {data.images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-md">
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              {image.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{image.caption}</p>}
            </div>
          ))}
        </div>
      </div>

      <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
    </div>
  )
}
