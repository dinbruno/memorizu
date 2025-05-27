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
} from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  location?: string;
  type?: "milestone" | "event" | "achievement" | "memory";
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

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleEventChange = (index: number, field: string, value: string) => {
    const updatedEvents = [...localData.events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    handleSettingsChange("events", updatedEvents);
  };

  const handleAddEvent = () => {
    const newEvent = {
      date: "New Date",
      title: "New Event",
      description: "Description of the event",
      location: "",
      type: "event" as const,
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Star className="h-4 w-4" />;
      case "achievement":
        return <Trophy className="h-4 w-4" />;
      case "memory":
        return <Heart className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-blue-500 border-blue-200";
      case "achievement":
        return "bg-green-500 border-green-200";
      case "memory":
        return "bg-pink-500 border-pink-200";
      default:
        return "bg-primary border-primary/20";
    }
  };

  const themeClasses = {
    default: "bg-gradient-to-br from-background to-muted/20",
    romantic: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    professional: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20",
    celebration: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
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
                              "h-6 w-6 rounded-full flex items-center justify-center text-white",
                              getEventTypeColor(event.type || "event")
                            )}
                          >
                            {getEventTypeIcon(event.type || "event")}
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
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">{data.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {data.events.length} {data.events.length === 1 ? "event" : "events"} • {data.style} layout
        </p>
      </div>

      {data.events.map((event, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-lg hover:border-border transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div
            className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white flex-shrink-0", getEventTypeColor(event.type || "event"))}
          >
            {getEventTypeIcon(event.type || "event")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{event.title}</h4>
              <Badge variant="outline" className="text-xs">
                {event.type || "event"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{event.date}</p>
            <p className="text-xs text-muted-foreground truncate mt-1">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <motion.div
      className="flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 min-h-[200px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">Create Timeline</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {isEditable ? "Add events to create your timeline" : "No timeline events available"}
          </p>
        </div>
        {isEditable && (
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="mt-3" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Timeline
          </Button>
        )}
      </div>
    </motion.div>
  );

  const renderVerticalTimeline = () => (
    <div className="space-y-8 relative max-w-3xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/70 to-primary/30" />

      {data.events.map((event, index) => (
        <motion.div
          key={index}
          className="relative flex gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 + 0.3 }}
        >
          {/* Timeline node */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background z-10",
                getEventTypeColor(event.type || "event")
              )}
            >
              {getEventTypeIcon(event.type || "event")}
            </div>
          </div>

          {/* Content card */}
          <Card className="flex-1 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/60">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full inline-block">{event.date}</p>
                  {event.type && (
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  )}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">{event.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderHorizontalTimeline = () => (
    <div className="relative overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max px-4">
        {/* Timeline line */}
        <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        {data.events.map((event, index) => (
          <motion.div
            key={index}
            className="relative flex flex-col items-center min-w-[280px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            {/* Timeline node */}
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background z-10 mb-4",
                getEventTypeColor(event.type || "event")
              )}
            >
              {getEventTypeIcon(event.type || "event")}
            </div>

            {/* Content card */}
            <Card className="w-full shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="text-center space-y-3">
                  <p className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">{event.date}</p>
                  <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                  {event.location && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {event.type && (
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderCardsTimeline = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {data.events.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          whileHover={{ y: -5 }}
        >
          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className={cn("h-3 w-full", getEventTypeColor(event.type || "event").replace("border-", "bg-"))} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-md",
                    getEventTypeColor(event.type || "event")
                  )}
                >
                  {getEventTypeIcon(event.type || "event")}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.type || "event"}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-primary mb-3 bg-primary/10 px-2 py-1 rounded inline-block">{event.date}</p>
              <h4 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{event.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{event.description}</p>

              {event.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-3 border-t border-border/30">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderZigzagTimeline = () => (
    <div className="space-y-12 relative max-w-4xl mx-auto">
      {/* Central timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/70 to-primary/30 transform -translate-x-1/2" />

      {data.events.map((event, index) => {
        const isLeft = index % 2 === 0;
        return (
          <motion.div
            key={index}
            className={cn("relative flex items-center", isLeft ? "justify-start" : "justify-end")}
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 + 0.3 }}
          >
            {/* Content card */}
            <Card className={cn("w-5/12 shadow-lg hover:shadow-xl transition-all duration-300", isLeft ? "mr-auto" : "ml-auto")}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", getEventTypeColor(event.type || "event"))}>
                      {getEventTypeIcon(event.type || "event")}
                    </div>
                    <p className="text-sm font-semibold text-primary">{event.date}</p>
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {event.type && (
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Central node */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background z-10",
                getEventTypeColor(event.type || "event")
              )}
            >
              {getEventTypeIcon(event.type || "event")}
            </div>
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
      className={cn("relative rounded-xl p-8", themeClasses[data.theme as keyof typeof themeClasses])}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Settings Button */}
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm shadow-md border border-border/30 hover:border-primary/30 transition-all duration-200"
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
        <div className="space-y-8 w-full">
          {/* Title */}
          <motion.h3
            className="text-3xl font-bold text-center w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {data.title}
          </motion.h3>

          {/* Timeline Content */}
          <AnimatePresence mode="wait">
            <motion.div key={data.style} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
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
