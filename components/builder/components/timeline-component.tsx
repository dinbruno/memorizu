"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, Plus, Trash2 } from "lucide-react"

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface TimelineComponentProps {
  data: {
    title: string
    events: TimelineEvent[]
    style: "vertical" | "horizontal"
  }
  onUpdate?: (data: any) => void
  isEditable?: boolean
}

export function TimelineComponent({ data, onUpdate, isEditable = false }: TimelineComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localData, setLocalData] = useState({ ...data })
  const [titleEditing, setTitleEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(data.title)

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
  }

  const handleEventChange = (index: number, field: string, value: string) => {
    const updatedEvents = [...localData.events]
    updatedEvents[index] = { ...updatedEvents[index], [field]: value }
    handleSettingsChange("events", updatedEvents)
  }

  const handleAddEvent = () => {
    const newEvent = {
      date: "New Date",
      title: "New Event",
      description: "Description of the event",
    }
    handleSettingsChange("events", [...localData.events, newEvent])
  }

  const handleRemoveEvent = (index: number) => {
    const updatedEvents = [...localData.events]
    updatedEvents.splice(index, 1)
    handleSettingsChange("events", updatedEvents)
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

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Timeline settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Events</h4>
                {localData.events.map((event, index) => (
                  <div key={index} className="border rounded-md p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Event {index + 1}</h5>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveEvent(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`event-${index}-date`}>Date</Label>
                      <Input
                        id={`event-${index}-date`}
                        value={event.date}
                        onChange={(e) => handleEventChange(index, "date", e.target.value)}
                        placeholder="January 1, 2023"
                      />
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor={`event-${index}-title`}>Title</Label>
                      <Input
                        id={`event-${index}-title`}
                        value={event.title}
                        onChange={(e) => handleEventChange(index, "title", e.target.value)}
                        placeholder="Event title"
                      />
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor={`event-${index}-description`}>Description</Label>
                      <Input
                        id={`event-${index}-description`}
                        value={event.description}
                        onChange={(e) => handleEventChange(index, "description", e.target.value)}
                        placeholder="Event description"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={handleAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="space-y-6 w-full">
        {titleEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 text-center"
            autoFocus
          />
        ) : (
          <h3
            className={cn("text-2xl font-bold text-center w-full", isEditable ? "cursor-text" : "")}
            onDoubleClick={handleTitleDoubleClick}
          >
            {data.title}
          </h3>
        )}

        {data.style === "vertical" ? (
          <div className="space-y-8 relative max-w-2xl mx-auto">
            <div className="absolute left-9 top-0 bottom-0 w-px bg-border" />
            {data.events.map((event, index) => (
              <div key={index} className="relative flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary flex-shrink-0 z-10 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                  <h4 className="text-lg font-semibold">{event.title}</h4>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 justify-center">
            {data.events.map((event, index) => (
              <div key={index} className="min-w-[250px] bg-card rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">{event.date}</p>
                <h4 className="text-lg font-semibold mt-1">{event.title}</h4>
                <p className="text-muted-foreground mt-2">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
