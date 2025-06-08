"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  // Common icons
  Calendar,
  Clock,
  Star,
  Heart,
  Trophy,
  Gift,
  Bookmark,
  Flag,
  Target,
  Award,
  Crown,
  Diamond,
  Zap,
  Flame,
  Sparkles,
  // Activity icons
  Activity,
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  // Social icons
  Users,
  User,
  UserCheck,
  UserPlus,
  // Work icons
  Briefcase,
  Building,
  Home,
  School,
  GraduationCap,
  BookOpen,
  // Travel icons
  MapPin,
  Plane,
  Car,
  Train,
  Ship,
  Compass,
  Globe,
  // Nature icons
  Sun,
  Moon,
  CloudRain,
  Flower,
  TreePine,
  Leaf,
  // Food icons
  Coffee,
  Pizza,
  Apple,
  Wine,
  Utensils,
  // Sports icons
  Dumbbell,
  Bike,
  // Music icons
  Music,
  Headphones,
  Mic,
  Radio,
  // Tech icons
  Smartphone,
  Laptop,
  Monitor,
  Camera,
  Gamepad2,
  // Health icons
  Heart as HeartIcon,
  Pill,
  Stethoscope,
  // Celebration icons
  PartyPopper,
  Cake,
  // Love icons
  HeartHandshake,
  Baby,
  // Achievement icons
  Medal,
  Ribbon,
  CheckCircle,
  // Education icons
  Lightbulb,
  Brain,
  Puzzle,
  // Communication icons
  MessageCircle,
  Mail,
  Phone,
  // Shopping icons
  ShoppingBag,
  CreditCard,
  Store,
  // Entertainment icons
  Film,
  Tv,
  Book,
  Palette,
  // Wellness icons
  Smile,
  // Adventure icons
  Mountain,
  Tent,
  Backpack,
  // Success icons
  TrendingUp as Success,
  ArrowUp,
  Plus,
  // Time icons
  Timer,
  Hourglass,
  CalendarDays,
  // Location icons
  Navigation,
  Route,
  Landmark,
  // Special events
  Magnet,
  Key,
  Lock,
  Unlock,
  // Milestones
  Milestone,
  Signpost,
  // Memories
  Image,
  Video,
  Archive,
  // Goals
  Crosshair,
  Focus,
  Eye,
  // Creative
  Brush,
  Pen,
  Scissors,
  // Financial
  DollarSign,
  TrendingDown,
  Coins,
  // Emergency
  AlertCircle,
  AlertTriangle,
  Info,
  // Weather
  Sunrise,
  Sunset,
  Rainbow,
  // Seasonal
  Snowflake,
  Umbrella,
  // Animals
  Dog,
  Cat,
  Bird,
  // Vehicles
  Truck,
  Bus,
} from "lucide-react";

// Icon mapping with categories
const iconCategories = {
  Essential: [
    { name: "Calendar", icon: Calendar },
    { name: "Clock", icon: Clock },
    { name: "Star", icon: Star },
    { name: "Heart", icon: Heart },
    { name: "Trophy", icon: Trophy },
    { name: "Award", icon: Award },
    { name: "Target", icon: Target },
    { name: "Flag", icon: Flag },
  ],
  Achievements: [
    { name: "Trophy", icon: Trophy },
    { name: "Medal", icon: Medal },
    { name: "Crown", icon: Crown },
    { name: "Award", icon: Award },
    { name: "Ribbon", icon: Ribbon },
    { name: "Diamond", icon: Diamond },
    { name: "CheckCircle", icon: CheckCircle },
    { name: "Success", icon: Success },
  ],
  Celebration: [
    { name: "PartyPopper", icon: PartyPopper },
    { name: "Cake", icon: Cake },
    { name: "Gift", icon: Gift },
    { name: "Sparkles", icon: Sparkles },
    { name: "Zap", icon: Zap },
    { name: "Flame", icon: Flame },
  ],
  "Love & Relationships": [
    { name: "Heart", icon: Heart },
    { name: "HeartHandshake", icon: HeartHandshake },
    { name: "Baby", icon: Baby },
    { name: "Users", icon: Users },
    { name: "UserCheck", icon: UserCheck },
    { name: "UserPlus", icon: UserPlus },
  ],
  "Work & Career": [
    { name: "Briefcase", icon: Briefcase },
    { name: "Building", icon: Building },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "BarChart", icon: BarChart },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Target", icon: Target },
    { name: "Key", icon: Key },
  ],
  Education: [
    { name: "GraduationCap", icon: GraduationCap },
    { name: "BookOpen", icon: BookOpen },
    { name: "School", icon: School },
    { name: "Brain", icon: Brain },
    { name: "Puzzle", icon: Puzzle },
    { name: "Book", icon: Book },
  ],
  "Travel & Adventure": [
    { name: "Plane", icon: Plane },
    { name: "Car", icon: Car },
    { name: "MapPin", icon: MapPin },
    { name: "Compass", icon: Compass },
    { name: "Globe", icon: Globe },
    { name: "Mountain", icon: Mountain },
    { name: "Tent", icon: Tent },
    { name: "Backpack", icon: Backpack },
  ],
  "Health & Wellness": [
    { name: "HeartIcon", icon: HeartIcon },
    { name: "Pill", icon: Pill },
    { name: "Stethoscope", icon: Stethoscope },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Smile", icon: Smile },
  ],
  Entertainment: [
    { name: "Music", icon: Music },
    { name: "Film", icon: Film },
    { name: "Tv", icon: Tv },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "Camera", icon: Camera },
    { name: "Headphones", icon: Headphones },
  ],
  "Nature & Weather": [
    { name: "Sun", icon: Sun },
    { name: "Moon", icon: Moon },
    { name: "TreePine", icon: TreePine },
    { name: "Flower", icon: Flower },
    { name: "Leaf", icon: Leaf },
    { name: "Rainbow", icon: Rainbow },
    { name: "Snowflake", icon: Snowflake },
  ],
  Technology: [
    { name: "Smartphone", icon: Smartphone },
    { name: "Laptop", icon: Laptop },
    { name: "Monitor", icon: Monitor },
    { name: "Camera", icon: Camera },
    { name: "Gamepad2", icon: Gamepad2 },
  ],
  "Sports & Activities": [
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Bike", icon: Bike },
  ],
};

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  onClose?: () => void;
  className?: string;
}

export function IconSelector({ selectedIcon, onIconSelect, onClose, className }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Flatten all icons for search
  const allIcons = useMemo(() => {
    const icons: { name: string; icon: React.ComponentType<any>; category: string }[] = [];
    Object.entries(iconCategories).forEach(([category, categoryIcons]) => {
      categoryIcons.forEach((iconData) => {
        icons.push({ ...iconData, category });
      });
    });
    return icons;
  }, []);

  // Filter icons based on search term and category
  const filteredIcons = useMemo(() => {
    let filtered = allIcons;

    if (searchTerm) {
      filtered = filtered.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory) {
      filtered = filtered.filter((icon) => icon.category === selectedCategory);
    }

    return filtered;
  }, [allIcons, searchTerm, selectedCategory]);

  const categories = Object.keys(iconCategories);

  return (
    <motion.div
      className={cn("bg-background border border-border rounded-xl shadow-lg", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Select an Icon</h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search icons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} className="text-xs">
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-80">
        <div className="p-4">
          {selectedCategory && !searchTerm ? (
            // Show by category
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{selectedCategory}</h4>
                <div className="grid grid-cols-8 gap-2">
                  {iconCategories[selectedCategory as keyof typeof iconCategories].map((iconData, index) => {
                    const IconComponent = iconData.icon;
                    const isSelected = selectedIcon === iconData.name;

                    return (
                      <motion.button
                        key={iconData.name}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center aspect-square",
                          isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 hover:bg-primary/5"
                        )}
                        onClick={() => onIconSelect(iconData.name)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Show all or filtered
            <div className="space-y-6">
              {searchTerm ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Search Results ({filteredIcons.length})</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {filteredIcons.map((iconData, index) => {
                      const IconComponent = iconData.icon;
                      const isSelected = selectedIcon === iconData.name;

                      return (
                        <motion.button
                          key={`${iconData.category}-${iconData.name}`}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center aspect-square relative group",
                            isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 hover:bg-primary/5"
                          )}
                          onClick={() => onIconSelect(iconData.name)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <IconComponent className="h-5 w-5" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {iconData.name}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Show all categories
                Object.entries(iconCategories).map(([category, icons]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {icons.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {icons.slice(0, 8).map((iconData, index) => {
                        const IconComponent = iconData.icon;
                        const isSelected = selectedIcon === iconData.name;

                        return (
                          <motion.button
                            key={iconData.name}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center aspect-square relative group",
                              isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 hover:bg-primary/5"
                            )}
                            onClick={() => onIconSelect(iconData.name)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            <IconComponent className="h-5 w-5" />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {iconData.name}
                            </div>
                          </motion.button>
                        );
                      })}
                      {icons.length > 8 && (
                        <button
                          className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center aspect-square text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <span className="text-xs">+{icons.length - 8}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {filteredIcons.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No icons found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
