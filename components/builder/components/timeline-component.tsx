"use client";

import type React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IconSelector } from "./icon-selector";
import {
  Settings2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronRight,
  Star,
  Trophy,
  Heart,
  Briefcase,
  GripVertical,
  Palette,
} from "lucide-react";

// Import all possible icons that can be used
import * as LucideIcons from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  location?: string;
  type?: "milestone" | "event" | "achievement" | "memory";
  customIcon?: string; // New field for custom icons
}

interface TimelineComponentProps {
  data: {
    title: string;
    events: TimelineEvent[];
    theme: "default" | "romantic" | "professional" | "celebration";
    style: "vertical" | "horizontal" | "cards" | "zigzag";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function TimelineComponent({ data, onUpdate, isEditable = false }: TimelineComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [openEventIndex, setOpenEventIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [iconSelectorOpen, setIconSelectorOpen] = useState<number | null>(null);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleEventChange = (index: number, field: string, value: string) => {
    const updatedEvents = [...localData.events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    handleSettingsChange("events", updatedEvents);
  };

  const handleIconSelect = (index: number, iconName: string) => {
    handleEventChange(index, "customIcon", iconName);
    setIconSelectorOpen(null);
  };

  const handleAddEvent = () => {
    const newEvent = {
      date: "New Date",
      title: "New Event",
      description: "Description of the event",
      location: "",
      type: "event" as const,
      customIcon: undefined,
    };
    handleSettingsChange("events", [...localData.events, newEvent]);
    setOpenEventIndex(localData.events.length);
  };

  const handleRemoveEvent = (index: number) => {
    const updatedEvents = [...localData.events];
    updatedEvents.splice(index, 1);
    handleSettingsChange("events", updatedEvents);
    if (openEventIndex === index) {
      setOpenEventIndex(null);
    } else if (openEventIndex !== null && openEventIndex > index) {
      setOpenEventIndex(openEventIndex - 1);
    }
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedEvents = [...localData.events];
    const draggedEvent = updatedEvents[draggedIndex];

    // Remove the dragged event
    updatedEvents.splice(draggedIndex, 1);

    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    updatedEvents.splice(insertIndex, 0, draggedEvent);

    handleSettingsChange("events", updatedEvents);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Get icon component from name
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  const getEventTypeIcon = (type: string, customIcon?: string) => {
    // Use custom icon if available
    if (customIcon) {
      const CustomIconComponent = getIconComponent(customIcon);
      if (CustomIconComponent) {
        return <CustomIconComponent className="h-3.5 w-3.5" />;
      }
    }

    // Fallback to default type icons
    switch (type) {
      case "milestone":
        return <Star className="h-3.5 w-3.5" />;
      case "achievement":
        return <Trophy className="h-3.5 w-3.5" />;
      case "memory":
        return <Heart className="h-3.5 w-3.5" />;
      default:
        return <Calendar className="h-3.5 w-3.5" />;
    }
  };

  const getEventTypeColor = (type: string, theme: string) => {
    const colors = {
      milestone: {
        default: "from-blue-500 to-blue-600",
        romantic: "from-pink-400 to-pink-500",
        professional: "from-indigo-500 to-indigo-600",
        celebration: "from-yellow-500 to-amber-500",
      },
      achievement: {
        default: "from-emerald-500 to-emerald-600",
        romantic: "from-rose-400 to-rose-500",
        professional: "from-slate-500 to-slate-600",
        celebration: "from-orange-500 to-orange-600",
      },
      memory: {
        default: "from-purple-500 to-purple-600",
        romantic: "from-red-400 to-red-500",
        professional: "from-blue-600 to-blue-700",
        celebration: "from-pink-500 to-pink-600",
      },
      event: {
        default: "from-gray-500 to-gray-600",
        romantic: "from-rose-300 to-rose-400",
        professional: "from-gray-600 to-gray-700",
        celebration: "from-amber-400 to-amber-500",
      },
    };

    return colors[type as keyof typeof colors]?.[theme as keyof typeof colors.milestone] || colors.event[theme as keyof typeof colors.event];
  };

  const themeClasses = {
    default: "bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/50 dark:to-gray-950/50",
    romantic: "bg-gradient-to-br from-rose-50/30 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/20",
    professional: "bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-950/30 dark:to-blue-950/20",
    celebration: "bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20",
  };

  const renderSettingsPanel = () => (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Timeline Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your timeline</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Timeline Title</Label>
          <Input id="title" value={localData.title} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Timeline title" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="style">Layout Style</Label>
            <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="cards">Cards Grid</SelectItem>
                <SelectItem value="zigzag">Zigzag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={localData.theme} onValueChange={(value) => handleSettingsChange("theme", value)}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Events</h4>
              <p className="text-xs text-muted-foreground">Drag to reorder events</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddEvent}>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {localData.events.map((event, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "transition-all duration-200",
                  draggedIndex === index && "opacity-50 scale-95",
                  dragOverIndex === index && draggedIndex !== index && "border-primary/50 bg-primary/5"
                )}
              >
                <Collapsible open={openEventIndex === index} onOpenChange={(open) => setOpenEventIndex(open ? index : null)}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto border border-border/50 hover:border-border cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div
                            className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center text-white bg-gradient-to-br",
                              getEventTypeColor(event.type || "event", localData.theme)
                            )}
                          >
                            {getEventTypeIcon(event.type || "event", event.customIcon)}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">{event.title || `Event ${index + 1}`}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {openEventIndex === index ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </Button>
                    </CollapsibleTrigger>

                    {/* Delete button positioned absolutely */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-10 h-6 w-6 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEvent(index);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="space-y-3 pt-3 border-t border-border/30">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            value={event.date}
                            onChange={(e) => handleEventChange(index, "date", e.target.value)}
                            placeholder="January 1, 2023"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select value={event.type || "event"} onValueChange={(value) => handleEventChange(index, "type", value)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="milestone">Milestone</SelectItem>
                              <SelectItem value="achievement">Achievement</SelectItem>
                              <SelectItem value="memory">Memory</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={event.title}
                          onChange={(e) => handleEventChange(index, "title", e.target.value)}
                          placeholder="Event title"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={event.description}
                          onChange={(e) => handleEventChange(index, "description", e.target.value)}
                          placeholder="Event description"
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Location (Optional)</Label>
                        <Input
                          value={event.location || ""}
                          onChange={(e) => handleEventChange(index, "location", e.target.value)}
                          placeholder="Event location"
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Custom Icon Selector */}
                      <div className="space-y-1">
                        <Label className="text-xs">Custom Icon (Optional)</Label>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br border border-border/50",
                              getEventTypeColor(event.type || "event", localData.theme)
                            )}
                          >
                            {getEventTypeIcon(event.type || "event", event.customIcon)}
                          </div>
                          <Popover open={iconSelectorOpen === index} onOpenChange={(open) => setIconSelectorOpen(open ? index : null)}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Palette className="h-3 w-3 mr-1" />
                                {event.customIcon ? "Change Icon" : "Select Icon"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0" align="start" side="right">
                              <IconSelector
                                selectedIcon={event.customIcon}
                                onIconSelect={(iconName) => handleIconSelect(index, iconName)}
                                onClose={() => setIconSelectorOpen(null)}
                              />
                            </PopoverContent>
                          </Popover>
                          {event.customIcon && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEventChange(index, "customIcon", "")}
                              className="h-8 text-xs text-muted-foreground hover:text-destructive"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSaveSettings} className="flex-1">
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  // Simple timeline for edit mode
  const renderSimpleTimeline = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">{data.title}</h3>
        <p className="text-sm text-muted-foreground">
          {data.events.length} {data.events.length === 1 ? "event" : "events"} • {data.style} layout
        </p>
      </div>

      {data.events.map((event, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start gap-4 group">
            <div className="relative">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform group-hover:scale-110",
                  getEventTypeColor(event.type || "event", data.theme)
                )}
              >
                {getEventTypeIcon(event.type || "event", event.customIcon)}
              </div>
              {index < data.events.length - 1 && (
                <div className="absolute top-10 left-1/2 w-0.5 h-6 bg-gradient-to-b from-border to-transparent transform -translate-x-1/2" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-border transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{event.title}</h4>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {event.type || "event"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-2">{event.date}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <motion.div
      className="flex flex-col items-center justify-center border-2 border-dashed border-border/30 rounded-xl p-12 min-h-[300px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Create Your Timeline</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {isEditable ? "Add events to create your timeline story" : "No timeline events available"}
          </p>
        </div>
        {isEditable && (
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="mt-4">
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Timeline
          </Button>
        )}
      </div>
    </motion.div>
  );

  const renderVerticalTimeline = () => (
    <div className="space-y-0 relative max-w-4xl mx-auto">
      {/* Timeline stem */}
      <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />

      {data.events.map((event, index) => (
        <motion.div
          key={index}
          className="relative flex items-start gap-8 pb-12 last:pb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
        >
          {/* Timeline node */}
          <div className="relative z-10">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getEventTypeColor(event.type || "event", data.theme)
              )}
            >
              {getEventTypeIcon(event.type || "event", event.customIcon)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 -mt-1">
            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{event.date}</span>
                <Badge variant="outline" className="text-xs">
                  {event.type || "event"}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{event.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">{event.description}</p>
              {event.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderHorizontalTimeline = () => (
    <div className="relative">
      <div className="flex gap-8 overflow-x-auto pb-6">
        {/* Timeline line */}
        <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {data.events.map((event, index) => (
          <motion.div
            key={index}
            className="relative flex flex-col items-center min-w-[280px] flex-shrink-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            {/* Timeline node */}
            <div className="relative z-10 mb-6">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getEventTypeColor(event.type || "event", data.theme)
                )}
              >
                {getEventTypeIcon(event.type || "event", event.customIcon)}
              </div>
            </div>

            {/* Content card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-border transition-all duration-300 hover:shadow-lg">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{event.date}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {event.type || "event"}
                  </Badge>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderCardsTimeline = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      {data.events.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -8 }}
          className="group"
        >
          <div className="h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-border transition-all duration-300 hover:shadow-xl">
            {/* Header with gradient */}
            <div className={cn("h-2 bg-gradient-to-r", getEventTypeColor(event.type || "event", data.theme))} />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform group-hover:scale-110",
                    getEventTypeColor(event.type || "event", data.theme)
                  )}
                >
                  {getEventTypeIcon(event.type || "event", event.customIcon)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.type || "event"}
                </Badge>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">{event.date}</span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground pt-3 border-t border-border/30">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderZigzagTimeline = () => (
    <div className="space-y-16 relative max-w-5xl mx-auto">
      {/* Central timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/60 to-transparent transform -translate-x-1/2" />

      {data.events.map((event, index) => {
        const isLeft = index % 2 === 0;
        return (
          <motion.div
            key={index}
            className={cn("relative flex items-center", isLeft ? "justify-start" : "justify-end")}
            initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.3, duration: 0.8 }}
          >
            {/* Connecting line */}
            <div
              className={cn(
                "absolute top-1/2 w-16 h-px bg-gradient-to-r from-border to-transparent transform -translate-y-1/2",
                isLeft ? "left-1/2 ml-0.5" : "right-1/2 mr-0.5 rotate-180"
              )}
            />

            {/* Content card */}
            <div className={cn("w-5/12 group", isLeft ? "mr-auto" : "ml-auto")}>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-border transition-all duration-300 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform group-hover:scale-110",
                        getEventTypeColor(event.type || "event", data.theme)
                      )}
                    >
                      {getEventTypeIcon(event.type || "event", event.customIcon)}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{event.date}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <Badge variant="outline" className="text-xs">
                      {event.type || "event"}
                    </Badge>
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Central node */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full shadow-lg bg-gradient-to-br border-4 border-background z-10",
                getEventTypeColor(event.type || "event", data.theme)
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );

  const renderTimelineByStyle = () => {
    switch (data.style) {
      case "horizontal":
        return renderHorizontalTimeline();
      case "cards":
        return renderCardsTimeline();
      case "zigzag":
        return renderZigzagTimeline();
      default:
        return renderVerticalTimeline();
    }
  };

  return (
    <motion.div
      className={cn("relative rounded-2xl p-8 backdrop-blur-sm", themeClasses[data.theme as keyof typeof themeClasses])}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Settings Button */}
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <motion.div
              className="absolute top-6 right-6 z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:border-primary/30 transition-all duration-200"
              >
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Timeline settings</span>
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            {renderSettingsPanel()}
          </PopoverContent>
        </Popover>
      )}

      {/* Content */}
      {data.events && data.events.length > 0 ? (
        <div className="space-y-12 w-full">
          {/* Title */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">{data.title}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto" />
          </motion.div>

          {/* Timeline Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={data.style}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {isEditable ? renderSimpleTimeline() : renderTimelineByStyle()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        renderEmptyState()
      )}
    </motion.div>
  );
}
