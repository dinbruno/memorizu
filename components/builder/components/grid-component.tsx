"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Settings2, Plus, Grid3X3, LayoutGrid, Trash2, Edit3, Eye } from "lucide-react";
import { ComponentRenderer } from "../component-renderer";
import { componentLibrary } from "@/lib/component-library";

interface GridColumn {
  id: string;
  components: any[];
}

interface GridComponentProps {
  data: {
    columns: number;
    height: number;
    gap: number;
    padding: number;
    backgroundColor: string;
    borderRadius: number;
    gridColumns: GridColumn[];
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function GridComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: GridComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<{ columnIndex: number; componentIndex: number; component: any } | null>(null);
  const [localData, setLocalData] = useState(() => {
    // Initialize with default columns if not present
    const initialData = { ...data };
    if (!initialData.gridColumns || initialData.gridColumns.length === 0) {
      initialData.gridColumns = [];
      for (let i = 0; i < (initialData.columns || 2); i++) {
        initialData.gridColumns.push({
          id: `column-${i}`,
          components: [],
        });
      }
    }
    return initialData;
  });
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const isUpdatingFromExternal = useRef(false);

  // Debug: Log when editingComponent changes
  useEffect(() => {
    console.log("editingComponent state changed:", editingComponent);
  }, [editingComponent]);

  // Sync localData with external data changes
  useEffect(() => {
    // Only sync if we're not in the initial mount and the data has actually changed
    if (!isInitialMount.current) {
      isUpdatingFromExternal.current = true;
      setLocalData((prevLocalData) => {
        // Deep comparison to avoid unnecessary updates
        const hasChanged =
          prevLocalData.columns !== data.columns ||
          prevLocalData.height !== data.height ||
          prevLocalData.gap !== data.gap ||
          prevLocalData.padding !== data.padding ||
          prevLocalData.backgroundColor !== data.backgroundColor ||
          prevLocalData.borderRadius !== data.borderRadius ||
          JSON.stringify(prevLocalData.gridColumns) !== JSON.stringify(data.gridColumns);

        if (hasChanged) {
          return { ...data };
        }
        return prevLocalData;
      });
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingFromExternal.current = false;
      }, 0);
    }
  }, [data.columns, data.height, data.gap, data.padding, data.backgroundColor, data.borderRadius, data.gridColumns]);

  // Auto-update when localData changes (but avoid infinite loops)
  useEffect(() => {
    // Skip the first render to avoid calling onUpdate with initial data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't call onUpdate if we're updating from external changes
    if (isUpdatingFromExternal.current) {
      return;
    }

    if (onUpdate) {
      onUpdate(localData);
    }
  }, [
    localData.columns,
    localData.height,
    localData.gap,
    localData.padding,
    localData.backgroundColor,
    localData.borderRadius,
    localData.gridColumns,
  ]); // Be specific about what triggers updates

  const handleSettingsChange = useCallback((field: string, value: any) => {
    // Prevent updates if we're currently syncing from external changes
    if (isUpdatingFromExternal.current) {
      return;
    }

    setLocalData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  const handleColumnsChange = useCallback((newColumns: number) => {
    // Prevent updates if we're currently syncing from external changes
    if (isUpdatingFromExternal.current) {
      return;
    }

    setLocalData((prevData) => {
      const currentColumns = prevData.gridColumns || [];
      const updatedColumns: GridColumn[] = [];

      // Keep existing columns and their components
      for (let i = 0; i < newColumns; i++) {
        if (i < currentColumns.length) {
          updatedColumns.push(currentColumns[i]);
        } else {
          updatedColumns.push({
            id: `column-${i}`,
            components: [],
          });
        }
      }

      return { ...prevData, columns: newColumns, gridColumns: updatedColumns };
    });
  }, []);

  const handleAddComponent = useCallback((componentType: string, columnIndex: number) => {
    // Prevent adding grid components to avoid infinite nesting
    if (componentType === "grid") {
      console.warn("Grid components cannot be added inside other grid components to prevent infinite nesting");
      return;
    }

    // Prevent updates if we're currently syncing from external changes
    if (isUpdatingFromExternal.current) {
      console.log("Skipping add component - currently updating from external");
      return;
    }

    const componentTemplate = componentLibrary.find((comp) => comp.type === componentType);
    if (!componentTemplate) {
      console.warn(`Component template not found for type: ${componentType}`);
      return;
    }

    // Generate a more unique ID to prevent any potential duplicates
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const uniqueId = `${componentType}-col${columnIndex}-${timestamp}-${randomId}`;

    console.log(`Adding component: ${componentType} to column ${columnIndex} with ID: ${uniqueId}`);

    const newComponent = {
      id: uniqueId,
      type: componentType,
      data: { ...componentTemplate.data },
    };

    setLocalData((prevData) => {
      const updatedColumns = [...prevData.gridColumns];
      if (!updatedColumns[columnIndex]) {
        console.error(`Column ${columnIndex} does not exist`);
        return prevData;
      }

      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        components: [...updatedColumns[columnIndex].components, newComponent],
      };

      console.log(`Component added. Column ${columnIndex} now has ${updatedColumns[columnIndex].components.length} components`);
      return { ...prevData, gridColumns: updatedColumns };
    });
  }, []);

  const handleUpdateComponent = useCallback((columnIndex: number, componentIndex: number, newData: any) => {
    setLocalData((prevData) => {
      const updatedColumns = [...prevData.gridColumns];
      updatedColumns[columnIndex].components[componentIndex].data = newData;
      return { ...prevData, gridColumns: updatedColumns };
    });
  }, []);

  const handleRemoveComponent = useCallback((columnIndex: number, componentIndex: number) => {
    setLocalData((prevData) => {
      const updatedColumns = [...prevData.gridColumns];
      updatedColumns[columnIndex].components.splice(componentIndex, 1);
      return { ...prevData, gridColumns: updatedColumns };
    });
  }, []);

  const handleEditComponent = useCallback(
    (columnIndex: number, componentIndex: number) => {
      console.log(`handleEditComponent called: column ${columnIndex}, component ${componentIndex}`);

      if (!localData.gridColumns || !localData.gridColumns[columnIndex]) {
        console.error(`Column ${columnIndex} does not exist`);
        return;
      }

      if (!localData.gridColumns[columnIndex].components[componentIndex]) {
        console.error(`Component ${componentIndex} does not exist in column ${columnIndex}`);
        return;
      }

      const component = localData.gridColumns[columnIndex].components[componentIndex];
      console.log(`Setting editingComponent:`, { columnIndex, componentIndex, component });
      setEditingComponent({ columnIndex, componentIndex, component });
    },
    [localData.gridColumns]
  );

  const handleSaveComponentEdit = useCallback(
    (newData: any) => {
      if (editingComponent) {
        handleUpdateComponent(editingComponent.columnIndex, editingComponent.componentIndex, newData);
        setEditingComponent(null);
      }
    },
    [editingComponent, handleUpdateComponent]
  );

  // Get component icon from library
  const getComponentIcon = (componentType: string) => {
    const componentTemplate = componentLibrary.find((comp) => comp.type === componentType);
    return componentTemplate?.icon || <div className="w-4 h-4 bg-muted rounded" />;
  };

  // Get component name from library
  const getComponentName = (componentType: string) => {
    const componentTemplate = componentLibrary.find((comp) => comp.type === componentType);
    return componentTemplate?.name || componentType;
  };

  // Render component card for grid columns
  const renderComponentCard = (component: any, columnIndex: number, componentIndex: number) => (
    <motion.div
      key={`${component.id}-card-${columnIndex}-${componentIndex}`}
      className="group relative bg-background border border-muted-foreground/20 rounded-lg p-3 hover:border-muted-foreground/40 transition-colors"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Component Info */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">{getComponentIcon(component.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{getComponentName(component.type)}</div>
          <div className="text-xs text-muted-foreground">Component #{componentIndex + 1}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleEditComponent(columnIndex, componentIndex);
          }}
        >
          <Edit3 className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveComponent(columnIndex, componentIndex);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Preview indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
      </div>
    </motion.div>
  );

  const renderSettingsPanel = () => (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutGrid className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Grid Settings</h3>
          <p className="text-xs text-muted-foreground">Configure layout and components</p>
        </div>
      </div>

      {/* Grid Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Grid3X3 className="h-3 w-3" />
          Layout Configuration
        </div>

        <div className="space-y-2 pl-4">
          <div className="space-y-1">
            <Label className="text-xs">Columns</Label>
            <Select value={localData.columns.toString()} onValueChange={(value) => handleColumnsChange(parseInt(value))}>
              <SelectTrigger className="h-8" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent onClick={(e) => e.stopPropagation()}>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Height: {localData.height}px</Label>
            <Slider
              value={[localData.height]}
              onValueChange={([value]) => handleSettingsChange("height", value)}
              min={200}
              max={800}
              step={50}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Gap: {localData.gap}px</Label>
            <Slider
              value={[localData.gap]}
              onValueChange={([value]) => handleSettingsChange("gap", value)}
              min={0}
              max={50}
              step={5}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Padding: {localData.padding}px</Label>
            <Slider
              value={[localData.padding]}
              onValueChange={([value]) => handleSettingsChange("padding", value)}
              min={0}
              max={50}
              step={5}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Border Radius: {localData.borderRadius}px</Label>
            <Slider
              value={[localData.borderRadius]}
              onValueChange={([value]) => handleSettingsChange("borderRadius", value)}
              min={0}
              max={25}
              step={5}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Column Management */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Plus className="h-3 w-3" />
          Manage Components
        </div>

        {/* Compact Grid Preview in Sidebar */}
        <div className="pl-4 space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Grid Preview:</div>

          {/* Ultra-compact grid representation */}
          <div className="border rounded p-3 bg-muted/20 space-y-2">
            {/* Grid info header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{localData.columns} Columns</span>
              <span className="text-muted-foreground">{localData.height}px</span>
            </div>

            {/* Compact column representation */}
            <div className="space-y-1">
              {localData.gridColumns?.slice(0, localData.columns).map((column, index) => (
                <div
                  key={`compact-col-${index}`}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border transition-colors cursor-pointer",
                    selectedColumn === index
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-background hover:bg-muted/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColumn(selectedColumn === index ? null : index);
                  }}
                >
                  {/* Column info */}
                  <div className="flex items-center gap-2">
                    <div className={cn("text-xs font-medium", selectedColumn === index ? "text-primary" : "text-foreground")}>Col {index + 1}</div>

                    {/* Component dots */}
                    <div className="flex gap-1">
                      {column.components.slice(0, 4).map((_, compIndex) => (
                        <div
                          key={`dot-${index}-${compIndex}`}
                          className={cn("w-1.5 h-1.5 rounded-full", selectedColumn === index ? "bg-primary" : "bg-muted-foreground/60")}
                        />
                      ))}
                      {column.components.length > 4 && <span className="text-xs text-muted-foreground">+{column.components.length - 4}</span>}
                    </div>
                  </div>

                  {/* Component count badge */}
                  <div
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      selectedColumn === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {column.components.length}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="text-xs text-muted-foreground text-center pt-1 border-t">
              {localData.gridColumns?.reduce((total, col) => total + col.components.length, 0) || 0} total components
            </div>
          </div>
        </div>

        {/* Column Management */}
        <div className="space-y-2 pl-4">
          {localData.gridColumns?.slice(0, localData.columns).map((column, index) => (
            <div
              key={column.id}
              className={cn(
                "space-y-2 p-2 rounded border transition-colors",
                selectedColumn === index ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 bg-background"
              )}
            >
              {/* Column header - more compact */}
              <div className="flex items-center justify-between">
                <Label className={cn("text-xs font-medium", selectedColumn === index && "text-primary")}>Column {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{column.components.length} items</span>
                  {selectedColumn === index && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                </div>
              </div>

              {/* Compact component list - only when expanded */}
              {selectedColumn === index && column.components.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Components:</div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {column.components.map((component, compIndex) => (
                      <div
                        key={`${component.id}-sidebar-col-${index}-${compIndex}`}
                        className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
                      >
                        <span className="text-xs text-muted-foreground truncate">
                          {compIndex + 1}. {component.type}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditComponent(index, compIndex);
                            }}
                          >
                            <Edit3 className="h-2 w-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveComponent(index, compIndex);
                            }}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Component Library */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Quick Add:</div>

                {/* Always show first 4 components in 2x2 grid */}
                <div className="grid grid-cols-2 gap-1">
                  {componentLibrary
                    .filter((comp) => comp.type !== "grid") // Filter out grid components
                    .slice(0, 4)
                    .map((component) => (
                      <Button
                        key={`${component.id}-col-${index}-quick`}
                        variant="outline"
                        size="sm"
                        className="h-auto p-1 flex flex-col items-center gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddComponent(component.type, index);
                        }}
                      >
                        <div className="h-3 w-3">{component.icon}</div>
                        <span className="text-xs leading-tight truncate w-full text-center">{component.name}</span>
                      </Button>
                    ))}
                </div>

                {/* Show more components only when column is selected */}
                {selectedColumn === index && (
                  <>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {componentLibrary
                        .filter((comp) => comp.type !== "grid") // Filter out grid components
                        .slice(4)
                        .map((component) => (
                          <Button
                            key={`${component.id}-col-${index}-more`}
                            variant="outline"
                            size="sm"
                            className="h-auto p-1 flex flex-col items-center gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddComponent(component.type, index);
                            }}
                          >
                            <div className="h-3 w-3">{component.icon}</div>
                            <span className="text-xs leading-tight truncate w-full text-center">{component.name}</span>
                          </Button>
                        ))}
                    </div>
                  </>
                )}

                {/* Compact expand/collapse button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColumn(selectedColumn === index ? null : index);
                  }}
                >
                  {selectedColumn === index ? "Less" : "More"}
                </Button>
              </div>

              {/* Separator between columns */}
              {index < localData.columns - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      </div>
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
          <LayoutGrid className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">Create Grid Layout</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {isEditable ? "Configure your grid and add components to each column" : "No grid layout configured"}
          </p>
        </div>
        {isEditable && (
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
            className="mt-3"
            size="sm"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Grid
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Render minimal edit version for sidebar
  const renderMinimalEditVersion = () => (
    <div className="space-y-4">
      {/* Grid Info Header */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium text-sm">{localData.columns} Column Grid</div>
            <div className="text-xs text-muted-foreground">{localData.height}px height</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsSettingsOpen(true);
          }}
        >
          <Settings2 className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>

      {/* Check if grid is configured */}
      {!localData.gridColumns || localData.gridColumns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No grid configured</div>
          <div className="text-xs">Use settings to configure your grid</div>
        </div>
      ) : (
        /* Columns List */
        <div className="space-y-3">
          {localData.gridColumns?.slice(0, localData.columns).map((column, index) => (
            <div key={column.id} className="border rounded-lg p-3 space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40"></div>
                  <span className="font-medium text-sm">Column {index + 1}</span>
                  <span className="text-xs text-muted-foreground">({column.components.length} components)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColumn(selectedColumn === index ? null : index);
                  }}
                  className="text-xs"
                >
                  {selectedColumn === index ? "Collapse" : "Expand"}
                </Button>
              </div>

              {/* Components in Column - Show as simple cards */}
              {selectedColumn === index && (
                <div className="space-y-2 pl-5 border-l-2 border-muted">
                  {column.components.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-2">No components in this column</div>
                  ) : (
                    column.components.map((component, compIndex) => (
                      <div key={`${component.id}-sidebar-card-${index}-${compIndex}`} className="border rounded p-2 bg-background">
                        {/* Component Card - Simple version for sidebar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 p-1 rounded bg-primary/10">{getComponentIcon(component.type)}</div>
                            <div>
                              <div className="text-xs font-medium">{getComponentName(component.type)}</div>
                              <div className="text-xs text-muted-foreground">Component #{compIndex + 1}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditComponent(index, compIndex);
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComponent(index, compIndex);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Settings Panel Popover */}
      <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          side="left"
          align="start"
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
          {renderSettingsPanel()}
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div
      className="relative w-full"
      style={{
        backgroundColor: localData.backgroundColor === "transparent" ? undefined : localData.backgroundColor,
        borderRadius: `${localData.borderRadius}px`,
        padding: `${localData.padding}px`,
      }}
    >
      {/* If this is inline edit mode (sidebar), show minimal version */}
      {isInlineEdit ? (
        renderMinimalEditVersion()
      ) : (
        <>
          {/* Settings Button */}
          {isEditable && (
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background shadow-sm">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 p-0"
                side="left"
                align="start"
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
                {renderSettingsPanel()}
              </PopoverContent>
            </Popover>
          )}

          {/* Content */}
          {localData.gridColumns?.length === 0 ? (
            // Empty state
            renderEmptyState()
          ) : (
            // Main grid display - show component cards in edit mode, full components in view mode
            <div
              key={`grid-${localData.columns}-${localData.gridColumns?.map((col) => col.components.length).join("-")}`}
              className="grid h-full"
              style={{
                gridTemplateColumns: `repeat(${localData.columns}, 1fr)`,
                gap: `${localData.gap}px`,
                minHeight: `${localData.height}px`,
              }}
            >
              {localData.gridColumns?.slice(0, localData.columns).map((column, index) => (
                <div
                  key={column.id}
                  className={cn(
                    "relative h-full rounded-lg overflow-hidden",
                    isEditable ? "border-2 border-dashed border-muted-foreground/20" : "border border-muted-foreground/10"
                  )}
                  style={{ minHeight: `${localData.height}px` }}
                >
                  {/* Column content */}
                  <div className="h-full p-4 space-y-4">
                    {isEditable ? (
                      // Edit mode: Show component cards
                      <AnimatePresence>
                        {column.components.map((component, componentIndex) => renderComponentCard(component, index, componentIndex))}
                      </AnimatePresence>
                    ) : (
                      // View mode: Show full components
                      column.components.map((component, componentIndex) => (
                        <div key={`${component.id}-col-${index}-comp-${componentIndex}`} className="relative group">
                          <ComponentRenderer
                            component={component}
                            onUpdate={(newData) => handleUpdateComponent(index, componentIndex, newData)}
                            isEditable={false}
                            isInlineEdit={false}
                          />
                        </div>
                      ))
                    )}

                    {/* Empty state for columns without components */}
                    {column.components.length === 0 && isEditable && (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                          </div>
                          <div>Empty Column</div>
                          <div className="text-xs opacity-75">Use settings to add components</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column label - only in edit mode */}
                  {isEditable && (
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                      Column {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Component Edit Popup - Available for both sidebar and main area */}
      {editingComponent && (
        <Popover open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
          <PopoverTrigger asChild>
            <div></div>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 p-0"
            side="left"
            align="center"
            onInteractOutside={(e) => {
              // Only close if clicking outside, not on interactive elements
              const target = e.target as Element;
              if (!target.closest("[data-radix-select-content]") && !target.closest("[data-radix-popover-content]")) {
                setEditingComponent(null);
              } else {
                e.preventDefault();
              }
            }}
          >
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="p-2 rounded-lg bg-primary/10">{getComponentIcon(editingComponent.component.type)}</div>
                <div>
                  <h3 className="font-semibold text-sm">Edit {getComponentName(editingComponent.component.type)}</h3>
                  <p className="text-xs text-muted-foreground">
                    Column {editingComponent.columnIndex + 1} • Component #{editingComponent.componentIndex + 1}
                  </p>
                </div>
              </div>

              {/* Component Editor */}
              <ComponentRenderer component={editingComponent.component} onUpdate={handleSaveComponentEdit} isEditable={true} isInlineEdit={true} />

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingComponent(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveComponent(editingComponent.columnIndex, editingComponent.componentIndex);
                    setEditingComponent(null);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
