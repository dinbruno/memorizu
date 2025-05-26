"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder } from "framer-motion";
import { Save, Eye, Upload, ArrowLeft, Trash2, Settings, Edit3, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { createPage, getPageById, updatePage } from "@/lib/firebase/firestore-service";
import { ComponentPanel } from "./component-panel";
import { SettingsPanel } from "./settings-panel";
import { TemplatesPanel } from "./templates-panel";
import { BuilderDropzone } from "./builder-dropzone";
import { ComponentRenderer } from "./component-renderer";
import { EffectsOverlay } from "./effects/effects-overlay";
import { PublicationPaymentDialog } from "@/components/payment/publication-payment-dialog";

interface PageBuilderProps {
  pageId?: string;
}

interface Page {
  id: string;
  title: string;
  components: any[];
  settings: any;
}

export function PageBuilder({ pageId }: PageBuilderProps) {
  const { t } = useLanguage();
  const { user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [components, setComponents] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter",
    template: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("components");
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Keyboard shortcuts and zoom with Ctrl+Scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete component with Delete key
      if (e.key === "Delete" && selectedComponent) {
        e.preventDefault();
        handleDeleteComponent(selectedComponent);
      }

      // Save with Ctrl+S
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Preview with Ctrl+P
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setPreviewMode(!previewMode);
      }

      // Escape to deselect component
      if (e.key === "Escape") {
        setSelectedComponent(null);
        setShowEditPanel(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Zoom with Ctrl+Scroll only in canvas area
      if (e.ctrlKey && e.target instanceof Element) {
        const canvasArea = document.querySelector('[data-canvas="true"]');
        if (canvasArea && canvasArea.contains(e.target)) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -25 : 25;
          setZoomLevel((prev) => Math.max(50, Math.min(200, prev + delta)));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [selectedComponent, previewMode]);

  useEffect(() => {
    const loadPage = async () => {
      if (!user) return;

      if (pageId && pageId !== "new") {
        try {
          const page = (await getPageById(user.uid, pageId)) as Page;
          if (page) {
            setTitle(page.title || "");
            setComponents(page.components || []);
            setSettings(
              page.settings || {
                backgroundColor: "#ffffff",
                textColor: "#000000",
                fontFamily: "Inter",
                template: "",
              }
            );
          }
        } catch (error) {
          console.error("Error loading page:", error);
          toast({
            variant: "destructive",
            title: t("notification.error"),
            description: "Failed to load page",
          });
        }
      }

      setIsLoading(false);
    };

    loadPage();
  }, [user, pageId, t, toast]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const pageData = {
        title,
        components,
        settings,
      };

      if (pageId && pageId !== "new") {
        await updatePage(user.uid, pageId, pageData);
      } else {
        const newPage = await createPage(user.uid, pageData);
        router.push(`/builder/${newPage.id}`);
      }

      toast({
        title: t("notification.saved"),
        description: "Page saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: "Failed to save page",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !pageId || pageId === "new") return;

    // Show payment dialog
    setShowPaymentDialog(true);
  };

  const handleAddComponent = (component: any) => {
    const newComponent = { ...component, id: `component-${Date.now()}` };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
    setShowEditPanel(true);
  };

  const handleUpdateComponent = useCallback((id: string, newData: any) => {
    console.log("PageBuilder handleUpdateComponent:", { id, newData });
    setComponents((prevComponents) =>
      prevComponents.map((c) => {
        if (c.id === id) {
          const updatedComponent = { ...c, data: { ...c.data, ...newData } };
          console.log("Updated component:", updatedComponent);
          return updatedComponent;
        }
        return c;
      })
    );
  }, []);

  const handleDeleteComponent = useCallback(
    (id: string) => {
      setComponents(components.filter((c) => c.id !== id));
      if (selectedComponent === id) {
        setSelectedComponent(null);
        setShowEditPanel(false);
      }
      toast({
        title: "Component deleted",
        description: "Component has been removed from the page",
      });
    },
    [components, selectedComponent, toast]
  );

  const handleSelectComponent = (id: string) => {
    setSelectedComponent(id);
    setShowEditPanel(true);
  };

  const handleReorderComponents = (newOrder: any[]) => {
    setComponents(newOrder);
  };

  const handleApplyTemplate = (template: any) => {
    setTitle(template.title);
    setComponents(template.components);
    setSettings({
      ...settings,
      backgroundColor: template.settings.backgroundColor,
      textColor: template.settings.textColor,
      fontFamily: template.settings.fontFamily,
      template: template.id,
    });
    setActiveTab("components");
    toast({
      title: "Template applied",
      description: `${template.title} template has been applied to your page`,
    });
  };

  const getSelectedComponent = () => {
    return components.find((c) => c.id === selectedComponent);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const getActiveEffects = () => {
    const effects = components
      .filter(
        (component) =>
          ["falling-hearts", "floating-bubbles", "sparkle-effect", "confetti"].includes(component.type) && component.data?.enabled === true
      )
      .map((component) => ({
        type: component.type,
        data: component.data,
      }));

    console.log("Active effects:", effects);
    return effects;
  };

  const closeEditPanel = () => {
    setSelectedComponent(null);
    setShowEditPanel(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Builder Header */}
      <header className="border-b bg-background z-10 relative">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("builder.untitled")}
              className="w-64 border-none text-lg font-medium focus-visible:ring-0"
            />
          </div>

          {/* Zoom Controls */}
          {!previewMode && (
            <div className="flex items-center gap-2 mx-4">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground ml-2">Ctrl+Scroll to zoom</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {pageId && pageId !== "new" && (
              <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                <Upload className="h-4 w-4 mr-2" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Builder Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Components & Templates */}
        {!previewMode && (
          <motion.div
            className="w-80 border-r bg-background overflow-y-auto relative z-10"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b bg-muted/30">
                <TabsList className="w-full h-12 grid grid-cols-3 rounded-none bg-transparent">
                  <TabsTrigger value="components" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">Components</span>
                      <span className="text-[10px] text-muted-foreground">Add elements</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">Templates</span>
                      <span className="text-[10px] text-muted-foreground">Quick start</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span className="text-xs font-medium">Page</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="components" className="m-0 p-6 h-full">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Add Components</h3>
                      <p className="text-sm text-muted-foreground mb-4">Drag and drop components to build your page. Click to add instantly.</p>
                    </div>
                    <ComponentPanel onAddComponent={handleAddComponent} />
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="m-0 p-6 h-full">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Page Templates</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start with a pre-designed template and customize it to your needs.</p>
                    </div>
                    <TemplatesPanel onApplyTemplate={handleApplyTemplate} />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="m-0 p-6 h-full">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Page Settings</h3>
                      <p className="text-sm text-muted-foreground mb-4">Customize the overall appearance and behavior of your page.</p>
                    </div>
                    <SettingsPanel settings={settings} onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })} />
                  </div>
                </TabsContent>
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="border-t bg-muted/20 p-4">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground">Keyboard Shortcuts</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Save</span>
                    <span className="font-mono">Ctrl+S</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preview</span>
                    <span className="font-mono">Ctrl+P</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete</span>
                    <span className="font-mono">Del</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deselect</span>
                    <span className="font-mono">Esc</span>
                  </div>
                </div>
              </div>
            </Tabs>
          </motion.div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <div
            data-canvas="true"
            className="w-full h-full overflow-auto relative"
            style={{
              backgroundColor: "#f5f5f5",
            }}
          >
            {/* Effects Overlay - Only covers the canvas area */}
            <EffectsOverlay effects={getActiveEffects()} />

            <div
              className="origin-top-left transition-transform duration-200 min-h-full relative"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                width: `${10000 / zoomLevel}%`,
                backgroundColor: settings.backgroundColor,
                color: settings.textColor,
                fontFamily: settings.fontFamily,
              }}
            >
              {previewMode ? (
                <div className="min-h-full">
                  {components.map((component) => (
                    <ComponentRenderer key={component.id} component={component} isPreview={true} />
                  ))}
                </div>
              ) : (
                <Reorder.Group axis="y" values={components} onReorder={handleReorderComponents} className="min-h-full p-4">
                  {components.length === 0 ? (
                    <BuilderDropzone onAddComponent={handleAddComponent} isEmpty={true} />
                  ) : (
                    <>
                      {components.map((component, index) => (
                        <Reorder.Item key={component.id} value={component} className="relative group mb-4">
                          <div
                            className={`relative border-2 border-transparent rounded-lg transition-all duration-200 ${
                              selectedComponent === component.id
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "hover:border-muted-foreground/30 hover:shadow-md"
                            }`}
                            onClick={() => handleSelectComponent(component.id)}
                          >
                            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectComponent(component.id);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComponent(component.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {selectedComponent === component.id && (
                              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                                {component.name || component.type} - Press Del to delete
                              </div>
                            )}

                            <ComponentRenderer
                              component={component}
                              onUpdate={(data) => handleUpdateComponent(component.id, data)}
                              isEditable={false}
                            />
                          </div>
                          {index === components.length - 1 && <BuilderDropzone onAddComponent={handleAddComponent} isEmpty={false} />}
                        </Reorder.Item>
                      ))}
                    </>
                  )}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Component Editor */}
        {!previewMode && showEditPanel && selectedComponent && (
          <motion.div
            className="w-80 border-l bg-background overflow-y-auto relative z-10"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full flex flex-col">
              <div className="border-b bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Edit Component</h3>
                    <p className="text-sm text-muted-foreground">{getSelectedComponent()?.name || getSelectedComponent()?.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComponent(selectedComponent)}
                      className="hover:bg-destructive/90"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant="ghost" size="icon" onClick={closeEditPanel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <ComponentRenderer
                    component={getSelectedComponent()}
                    onUpdate={(data) => handleUpdateComponent(selectedComponent, data)}
                    isEditable={true}
                    isInlineEdit={true}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Publication Payment Dialog */}
      {user && pageId && pageId !== "new" && (
        <PublicationPaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} pageId={pageId} pageTitle={title} userId={user.uid} />
      )}
    </div>
  );
}
