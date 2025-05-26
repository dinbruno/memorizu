"use client";

import type React from "react";
import { useState } from "react";
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
import { Settings2, Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";

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
    style: "vertical" | "horizontal" | "modern";
    theme: "default" | "romantic" | "professional" | "celebration";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function TimelineComponent({ data, onUpdate, isEditable = false }: TimelineComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [titleEditing, setTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(data.title);

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
  };

  const handleRemoveEvent = (index: number) => {
    const updatedEvents = [...localData.events];
    updatedEvents.splice(index, 1);
    handleSettingsChange("events", updatedEvents);
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const handleTitleDoubleClick = () => {
    if (isEditable) {
      setTitleEditing(true);
    }
  };

  const handleTitleBlur = () => {
    setTitleEditing(false);
    if (onUpdate && editingTitle !== data.title) {
      onUpdate({ ...data, title: editingTitle });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setTitleEditing(false);
      if (onUpdate && editingTitle !== data.title) {
        onUpdate({ ...data, title: editingTitle });
      }
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Calendar className="h-4 w-4" />;
      case "achievement":
        return <Clock className="h-4 w-4" />;
      case "memory":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-blue-500";
      case "achievement":
        return "bg-green-500";
      case "memory":
        return "bg-purple-500";
      default:
        return "bg-primary";
    }
  };

  const themeClasses = {
    default: "bg-gradient-to-br from-background to-muted/20",
    romantic: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    professional: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20",
    celebration: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  };

  return (
    <motion.div
      className={cn("relative rounded-xl p-8", themeClasses[data.theme as keyof typeof themeClasses])}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
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
                className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Timeline settings</span>
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
                        <SelectItem value="modern">Modern Cards</SelectItem>
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
                    <h4 className="font-medium">Events</h4>
                    <Button variant="outline" size="sm" onClick={handleAddEvent}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Event
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {localData.events.map((event, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium">Event {index + 1}</h5>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveEvent(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
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
                      </Card>
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
          </PopoverContent>
        </Popover>
      )}

      <div className="space-y-8 w-full">
        {titleEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-3xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 text-center"
            autoFocus
          />
        ) : (
          <motion.h3
            className={cn("text-3xl font-bold text-center w-full", isEditable ? "cursor-text" : "")}
            onDoubleClick={handleTitleDoubleClick}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {data.title}
          </motion.h3>
        )}

        <AnimatePresence mode="wait">
          {data.style === "vertical" ? (
            <motion.div
              key="vertical"
              className="space-y-8 relative max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
              {data.events.map((event, index) => (
                <motion.div
                  key={index}
                  className="relative flex gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-2 shadow-lg",
                      getEventTypeColor(event.type || "event")
                    )}
                  >
                    {getEventTypeIcon(event.type || "event")}
                  </div>
                  <Card className="flex-1 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-primary">{event.date}</p>
                          {event.type && (
                            <Badge variant="secondary" className="text-xs">
                              {event.type}
                            </Badge>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : data.style === "horizontal" ? (
            <motion.div
              key="horizontal"
              className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {data.events.map((event, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 + 0.3 }}>
                  <Card className="min-w-[280px] shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", getEventTypeColor(event.type || "event"))}>
                          {getEventTypeIcon(event.type || "event")}
                        </div>
                        <p className="text-sm font-medium text-primary">{event.date}</p>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{event.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{event.description}</p>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.type && (
                        <Badge variant="outline" className="text-xs mt-2">
                          {event.type}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="modern"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {data.events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className={cn("h-2 w-full", getEventTypeColor(event.type || "event"))} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", getEventTypeColor(event.type || "event"))}>
                          {getEventTypeIcon(event.type || "event")}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {event.type || "event"}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium text-primary mb-2">{event.date}</p>
                      <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">{event.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{event.description}</p>

                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
