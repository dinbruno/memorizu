"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  ImageIcon,
  BoxIcon as ButtonIcon,
  Quote,
  Clock,
  TimerIcon as Timeline,
  MessageSquare,
  FootprintsIcon as Footer,
  GalleryThumbnailsIcon as Gallery,
  Sparkles,
  Heart,
  Zap,
  PartyPopper,
  Layout,
  Type,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComponentTreeVisualizerProps {
  components: any[];
  selectedComponent: string | null;
  onSelectComponent: (componentId: string) => void;
  onClose: () => void;
  pageTitle?: string;
}

const getComponentIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    text: Type,
    button: ButtonIcon,
    header: Layout,
    quote: Quote,
    countdown: Clock,
    "date-difference": CalendarDays,
    timeline: Timeline,
    message: MessageSquare,
    footer: Footer,
    image: ImageIcon,
    gallery: Gallery,
    hero: Layout,
    "floating-bubbles": Sparkles,
    "sparkle-effect": Zap,
    confetti: PartyPopper,
    "falling-hearts": Heart,
  };
  return iconMap[type] || FileText;
};

const getComponentColor = (type: string) => {
  const colorMap: Record<string, string> = {
    text: "bg-blue-100 text-blue-700 border-blue-200",
    button: "bg-green-100 text-green-700 border-green-200",
    header: "bg-purple-100 text-purple-700 border-purple-200",
    quote: "bg-yellow-100 text-yellow-700 border-yellow-200",
    countdown: "bg-red-100 text-red-700 border-red-200",
    "date-difference": "bg-emerald-100 text-emerald-700 border-emerald-200",
    timeline: "bg-indigo-100 text-indigo-700 border-indigo-200",
    message: "bg-pink-100 text-pink-700 border-pink-200",
    footer: "bg-gray-100 text-gray-700 border-gray-200",
    image: "bg-orange-100 text-orange-700 border-orange-200",
    gallery: "bg-teal-100 text-teal-700 border-teal-200",
    hero: "bg-violet-100 text-violet-700 border-violet-200",
    "floating-bubbles": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "sparkle-effect": "bg-amber-100 text-amber-700 border-amber-200",
    confetti: "bg-rose-100 text-rose-700 border-rose-200",
    "falling-hearts": "bg-pink-100 text-pink-700 border-pink-200",
  };
  return colorMap[type] || "bg-gray-100 text-gray-700 border-gray-200";
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function ComponentTreeVisualizer({ components, selectedComponent, onSelectComponent, onClose, pageTitle }: ComponentTreeVisualizerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  // Filter components based on search term
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return components;

    return components.filter((component) => {
      const name = component.name || component.type;
      const type = component.type;
      const searchLower = searchTerm.toLowerCase();

      return (
        name.toLowerCase().includes(searchLower) ||
        type.toLowerCase().includes(searchLower) ||
        (component.data?.text && component.data.text.toLowerCase().includes(searchLower)) ||
        (component.data?.title && component.data.title.toLowerCase().includes(searchLower))
      );
    });
  }, [components, searchTerm]);

  // Get component statistics
  const componentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    components.forEach((component) => {
      stats[component.type] = (stats[component.type] || 0) + 1;
    });
    return stats;
  }, [components]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleComponentClick = (componentId: string) => {
    onSelectComponent(componentId);
  };

  const isComponentVisible = (component: any) => {
    return component.data?.enabled !== false && component.data?.visible !== false;
  };

  const renderComponent = (component: any, index: number, depth = 0) => {
    const Icon = getComponentIcon(component.type);
    const isSelected = selectedComponent === component.id;
    const isVisible = isComponentVisible(component);
    const hasChildren = component.children && component.children.length > 0;
    const isExpanded = expandedNodes.has(component.id);

    if (!isVisible && !showHidden) return null;

    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="mb-1"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
            isSelected ? "bg-primary/10 border border-primary/20" : "border border-transparent"
          } ${!isVisible ? "opacity-50" : ""}`}
          onClick={() => handleComponentClick(component.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(component.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}

          {!hasChildren && <div className="w-4" />}

          <div className={`p-1 rounded border ${getComponentColor(component.type)}`}>
            <Icon className="h-3 w-3" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{truncateText(component.name || component.type, 25)}</span>
              {!isVisible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
              {isSelected && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{truncateText(component.data?.text || component.data?.title || component.type, 40)}</div>
          </div>

          <Badge variant="outline" className="text-xs">
            {component.type}
          </Badge>
        </div>

        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {component.children.map((child: any, childIndex: number) => renderComponent(child, childIndex, depth + 1))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-background rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Component Tree</h2>
              <p className="text-muted-foreground mt-1">{pageTitle ? `Page: ${pageTitle}` : "Page Structure Visualization"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search components..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowHidden(!showHidden)} className="flex items-center gap-2">
              {showHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showHidden ? "Hide Hidden" : "Show Hidden"}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Component Tree */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full">
              {filteredComponents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{searchTerm ? "No components found" : "No components"}</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Start building your page by adding components"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">{filteredComponents.map((component, index) => renderComponent(component, index))}</div>
              )}
            </ScrollArea>
          </div>

          {/* Statistics Sidebar */}
          <div className="w-80 border-l bg-muted/20 p-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Components</span>
                    <Badge variant="secondary">{components.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Visible</span>
                    <Badge variant="default">{components.filter(isComponentVisible).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hidden</span>
                    <Badge variant="outline">{components.filter((c) => !isComponentVisible(c)).length}</Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Component Types</h4>
                  <div className="space-y-2">
                    {Object.entries(componentStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const Icon = getComponentIcon(type);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded border ${getComponentColor(type)}`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-sm capitalize">{type.replace("-", " ")}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {selectedComponent && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Component</h4>
                    <div className="text-xs text-muted-foreground">
                      <p>ID: {selectedComponent}</p>
                      <p>Type: {components.find((c) => c.id === selectedComponent)?.type}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Click components to select and edit</span>
              <span>•</span>
              <span>Use search to find specific components</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
