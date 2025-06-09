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
import { Settings2, Calendar, Heart } from "lucide-react";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

interface DateDifferenceComponentProps {
  data: {
    title: string;
    date: string;
    showLabels: boolean;
    style: "simple" | "cards" | "circles" | "romantic";
    displayUnits: ("years" | "months" | "days" | "hours" | "minutes")[];
    customMessage?: string;
    showTotalDays: boolean;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function DateDifferenceComponent({ data, onUpdate, isEditable = false }: DateDifferenceComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const t = useBuilderTranslation();
  const [timePassed, setTimePassed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    totalDays: 0,
  });
  const [titleEditing, setTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(data.title);

  useEffect(() => {
    const calculateTimePassed = () => {
      const startDate = new Date(data.date);
      const now = new Date();

      if (startDate > now) {
        // Se a data for no futuro, zerar tudo
        setTimePassed({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          totalDays: 0,
        });
        return;
      }

      // Calcular diferença total em millisegundos
      const totalMs = now.getTime() - startDate.getTime();
      const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));

      // Calcular anos, meses e dias
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      // Calcular horas e minutos do dia atual
      const hours = now.getHours();
      const minutes = now.getMinutes();

      setTimePassed({
        years,
        months,
        days,
        hours,
        minutes,
        totalDays,
      });
    };

    calculateTimePassed();
    const timer = setInterval(calculateTimePassed, 60000); // Atualizar a cada minuto

    return () => clearInterval(timer);
  }, [data.date]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleDisplayUnitsChange = (unit: string, checked: boolean) => {
    const currentUnits = localData.displayUnits || ["years", "months", "days"];
    let newUnits;

    if (checked) {
      newUnits = [...currentUnits, unit as any];
    } else {
      newUnits = currentUnits.filter((u) => u !== unit);
    }

    handleSettingsChange("displayUnits", newUnits);
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

  const getDisplayItems = () => {
    const allItems = [
      { value: timePassed.years, label: t.dateDifference.yearsLabel, shortLabel: "A", key: "years" },
      { value: timePassed.months, label: t.dateDifference.monthsLabel, shortLabel: "M", key: "months" },
      { value: timePassed.days, label: t.dateDifference.daysLabel, shortLabel: "D", key: "days" },
      { value: timePassed.hours, label: t.dateDifference.hoursLabel, shortLabel: "H", key: "hours" },
      { value: timePassed.minutes, label: t.dateDifference.minutesLabel, shortLabel: "Min", key: "minutes" },
    ];

    const displayUnits = data.displayUnits || ["years", "months", "days"];
    return allItems.filter((item) => displayUnits.includes(item.key as any));
  };

  const renderDateDifferenceItems = () => {
    const items = getDisplayItems();

    if (data.style === "cards") {
      return (
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div key={index} className="bg-card shadow-sm rounded-lg p-6 min-w-24 text-center border">
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              {data.showLabels && <div className="text-sm text-muted-foreground mt-1">{item.label}</div>}
            </div>
          ))}
        </div>
      );
    } else if (data.style === "circles") {
      return (
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item, index) => (
            <div key={index} className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary bg-primary/5 flex items-center justify-center">
                <div className="text-2xl font-bold text-primary">{item.value}</div>
              </div>
              {data.showLabels && <div className="text-sm text-center mt-2 text-muted-foreground font-medium">{item.label}</div>}
            </div>
          ))}
        </div>
      );
    } else if (data.style === "romantic") {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            {items.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-4 min-w-20 text-center border border-pink-200 dark:border-pink-800 shadow-sm">
                  <Heart className="h-4 w-4 text-pink-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">{item.value}</div>
                  {data.showLabels && <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">{item.label}</div>}
                </div>
              </div>
            ))}
          </div>
          {data.customMessage && <div className="text-center text-sm text-muted-foreground italic border-t pt-4">{data.customMessage}</div>}
        </div>
      );
    } else {
      // Simple style
      return (
        <div className="text-4xl font-bold text-center space-x-6">
          {items.map((item, index) => (
            <span key={index} className="inline-block">
              <span className="text-primary">{item.value}</span>
              {data.showLabels && <span className="text-xl ml-1 text-muted-foreground">{item.shortLabel}</span>}
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
              <span className="sr-only">{t.dateDifference.settings}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            onInteractOutside={(e) => {
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
                <Label htmlFor="date">{t.dateDifference.initialDate}</Label>
                <Input
                  id="date"
                  type="date"
                  value={new Date(localData.date).toISOString().split("T")[0]}
                  onChange={(e) => handleSettingsChange("date", new Date(e.target.value).toISOString())}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">{t.style}</Label>
                <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
                  <SelectTrigger id="style" onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder={t.dateDifference.selectStyle} />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="simple">{t.simple}</SelectItem>
                    <SelectItem value="cards">{t.dateDifference.cards}</SelectItem>
                    <SelectItem value="circles">{t.dateDifference.circles}</SelectItem>
                    <SelectItem value="romantic">{t.dateDifference.romantic}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{t.dateDifference.unitsToDisplay}</Label>
                {["years", "months", "days", "hours", "minutes"].map((unit) => {
                  const labels = {
                    years: t.dateDifference.yearsLabel,
                    months: t.dateDifference.monthsLabel,
                    days: t.dateDifference.daysLabel,
                    hours: t.dateDifference.hoursLabel,
                    minutes: t.dateDifference.minutesLabel,
                  };
                  const currentUnits = localData.displayUnits || ["years", "months", "days"];
                  return (
                    <div key={unit} className="flex items-center space-x-2">
                      <Switch
                        id={unit}
                        checked={currentUnits.includes(unit as any)}
                        onCheckedChange={(checked) => handleDisplayUnitsChange(unit, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label htmlFor={unit}>{labels[unit as keyof typeof labels]}</Label>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLabels"
                  checked={localData.showLabels}
                  onCheckedChange={(checked) => handleSettingsChange("showLabels", checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label htmlFor="showLabels">{t.dateDifference.showLabels}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showTotalDays"
                  checked={localData.showTotalDays}
                  onCheckedChange={(checked) => handleSettingsChange("showTotalDays", checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label htmlFor="showTotalDays">{t.dateDifference.showTotalDays}</Label>
              </div>

              {data.style === "romantic" && (
                <div className="space-y-2">
                  <Label htmlFor="customMessage">{t.dateDifference.customMessage}</Label>
                  <Input
                    id="customMessage"
                    placeholder={t.dateDifference.customMessagePlaceholder}
                    value={localData.customMessage || ""}
                    onChange={(e) => handleSettingsChange("customMessage", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <Button onClick={handleSaveSettings} className="w-full">
                {t.dateDifference.saveChanges}
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

        <div className="flex justify-center w-full">{renderDateDifferenceItems()}</div>

        {data.showTotalDays && timePassed.totalDays > 0 && (
          <div className="text-center pt-4 border-t">
            <div className="text-lg text-muted-foreground">
              <Calendar className="h-5 w-5 inline mr-2" />
              <span className="font-semibold text-primary">{timePassed.totalDays.toLocaleString()}</span> {t.dateDifference.totalDaysText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
