"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2 } from "lucide-react";

interface CountdownComponentProps {
  data: {
    title: string;
    date: string;
    showLabels: boolean;
    style: "simple" | "cards" | "circles";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function CountdownComponent({ data, onUpdate, isEditable = false }: CountdownComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [titleEditing, setTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(data.title);

  useEffect(() => {
    const targetDate = new Date(data.date).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [data.date]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
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

  const renderCountdownItems = () => {
    const items = [
      { value: timeLeft.days, label: "Days" },
      { value: timeLeft.hours, label: "Hours" },
      { value: timeLeft.minutes, label: "Minutes" },
      { value: timeLeft.seconds, label: "Seconds" },
    ];

    if (data.style === "cards") {
      return (
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div key={index} className="bg-card shadow-sm rounded-lg p-4 w-24 text-center">
              <div className="text-3xl font-bold">{item.value}</div>
              {data.showLabels && <div className="text-sm text-muted-foreground">{item.label}</div>}
            </div>
          ))}
        </div>
      );
    } else if (data.style === "circles") {
      return (
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div key={index} className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
              {data.showLabels && <div className="text-sm text-center mt-2 text-muted-foreground">{item.label}</div>}
            </div>
          ))}
        </div>
      );
    } else {
      // Simple style
      return (
        <div className="text-4xl font-bold text-center">
          {items.map((item, index) => (
            <span key={index}>
              {item.value}
              {data.showLabels && <span className="text-xl ml-1 mr-3">{item.label.charAt(0)}</span>}
              {index < items.length - 1 && !data.showLabels && <span className="mx-2">:</span>}
            </span>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Countdown settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            onInteractOutside={(e) => {
              // Only close if clicking outside, not on interactive elements
              const target = e.target as Element;
              if (!target.closest("[data-radix-select-content]") && !target.closest("[data-radix-popover-content]")) {
                setIsSettingsOpen(false);
              } else {
                e.preventDefault();
              }
            }}
          >
            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <Label htmlFor="date">Target Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={new Date(localData.date).toISOString().slice(0, 16)}
                  onChange={(e) => handleSettingsChange("date", new Date(e.target.value).toISOString())}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
                  <SelectTrigger id="style" onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="circles">Circles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showLabels"
                  checked={localData.showLabels}
                  onCheckedChange={(checked) => handleSettingsChange("showLabels", checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label htmlFor="showLabels">Show labels</Label>
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
          <h3 className={cn("text-2xl font-bold text-center w-full", isEditable ? "cursor-text" : "")} onDoubleClick={handleTitleDoubleClick}>
            {data.title}
          </h3>
        )}

        <div className="flex justify-center w-full">{renderCountdownItems()}</div>
      </div>
    </div>
  );
}
