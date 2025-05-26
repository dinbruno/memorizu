"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder } from "framer-motion";
import {
  Save,
  Eye,
  Upload,
  ArrowLeft,
  Trash2,
  Settings,
  Edit3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  TreePine,
  Undo2,
  UndoDot,
  Undo2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { createPage, getPageById, updatePage } from "@/lib/firebase/firestore-service";
import { generateAndUploadThumbnail } from "@/lib/utils/thumbnail-generator";
import { ComponentPanel } from "./component-panel";
import { SettingsPanel } from "./settings-panel";
import { TemplatesPanel } from "./templates-panel";
import { BuilderDropzone } from "./builder-dropzone";
import { ComponentRenderer } from "./component-renderer";
import { EffectsOverlay } from "./effects/effects-overlay";
import { PublicationPaymentDialog } from "@/components/payment/publication-payment-dialog";
import { ComponentTreeVisualizer } from "./component-tree-visualizer";
import { ThumbnailIndicator } from "@/components/ui/thumbnail-indicator";

interface PageBuilderProps {
  pageId?: string;
}

interface Page {
  id: string;
  title: string;
  components: any[];
  settings: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    template: string;
  };
  published?: boolean;
  paymentStatus?: "paid" | "unpaid" | "pending" | "failed" | "disputed" | "refunded";
  publishedUrl?: string;
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
  const [showComponentTree, setShowComponentTree] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);
  const [pageStatus, setPageStatus] = useState<{
    published: boolean;
    paymentStatus?: string;
    publishedUrl?: string;
  }>({ published: false });

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

      // Component Tree with Ctrl+T
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        setShowComponentTree(!showComponentTree);
      }

      // Escape to deselect component
      if (e.key === "Escape") {
        setSelectedComponent(null);
        setShowEditPanel(false);
        setShowComponentTree(false);
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
  }, [selectedComponent, previewMode, showComponentTree]);

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
            // Set page status
            setPageStatus({
              published: page.published || false,
              paymentStatus: page.paymentStatus,
              publishedUrl: page.publishedUrl,
            });
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

  // Function to sanitize data for Firestore (remove unsupported types like Symbol, Function, etc.)
  const sanitizeDataForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeDataForFirestore(item));
    }

    if (typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const valueType = typeof value;

        // Skip unsupported types
        if (valueType === "symbol" || valueType === "function" || valueType === "undefined") {
          console.warn(`PageBuilder: Skipping unsupported type "${valueType}" for key "${key}"`);
          continue;
        }

        // Handle blob URLs (they are temporary and shouldn't be saved to Firestore)
        if (typeof value === "string" && (value.startsWith("blob:") || value.includes("createObjectURL"))) {
          console.warn(`PageBuilder: Removing blob URL for key "${key}": ${value}`);
          // For music components, keep the field but clear the value
          if (key === "audioUrl") {
            sanitized[key] = "";
          }
          continue;
        }

        // Handle File objects (they can't be serialized)
        if (value instanceof File || value instanceof Blob) {
          console.warn(`PageBuilder: Removing File/Blob object for key "${key}"`);
          continue;
        }

        sanitized[key] = sanitizeDataForFirestore(value);
      }
      return sanitized;
    }

    // Return primitive values as-is (string, number, boolean)
    return obj;
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const pageData = {
        title,
        components: sanitizeDataForFirestore(components),
        settings: sanitizeDataForFirestore(settings),
      };

      let currentPageId = pageId;

      // Save page first
      if (pageId && pageId !== "new") {
        await updatePage(user.uid, pageId, pageData);
      } else {
        const newPage = await createPage(user.uid, pageData);
        currentPageId = newPage.id;
        router.push(`/builder/${newPage.id}`);
      }

      // Generate thumbnail if we have components and a valid page ID
      if (components.length > 0 && currentPageId && currentPageId !== "new") {
        try {
          setIsGeneratingThumbnail(true);
          setThumbnailGenerated(false);

          const canvasElement = document.querySelector('[data-page-content="true"]') as HTMLElement;

          if (canvasElement) {
            console.log("Generating thumbnail for page:", currentPageId);

            // Generate and upload thumbnail
            const thumbnailURL = await generateAndUploadThumbnail(user.uid, currentPageId, canvasElement);

            // Update page with thumbnail URL
            await updatePage(user.uid, currentPageId, {
              thumbnail: thumbnailURL,
              thumbnailGeneratedAt: new Date(),
            });

            console.log("Thumbnail generated and saved:", thumbnailURL);

            setThumbnailGenerated(true);

            // Hide success indicator after 2 seconds
            setTimeout(() => {
              setThumbnailGenerated(false);
            }, 2000);
          }
        } catch (thumbnailError) {
          console.error("Failed to generate thumbnail:", thumbnailError);

          // Show a non-intrusive warning to the user
          toast({
            title: "Thumbnail generation failed",
            description: "Page saved successfully, but thumbnail couldn't be generated. This doesn't affect your page.",
            variant: "default", // Not destructive since page was saved
          });
        } finally {
          setIsGeneratingThumbnail(false);
        }
      }

      toast({
        title: t("notification.saved"),
        description: components.length > 0 ? "Page saved with thumbnail generated!" : "Page saved successfully",
      });
    } catch (error) {
      console.error("Save error:", error);
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

    // If page was never paid, show payment dialog
    if (!pageStatus.paymentStatus || pageStatus.paymentStatus !== "paid") {
      setShowPaymentDialog(true);
      return;
    }

    // If page is already paid, toggle publish status
    await handleTogglePublish();
  };

  const handleTogglePublish = async () => {
    if (!user || !pageId || pageId === "new") return;

    setIsPublishing(true);

    try {
      const newPublishedState = !pageStatus.published;

      await updatePage(user.uid, pageId, {
        published: newPublishedState,
        publishedUrl: newPublishedState ? `${user.uid}/${pageId}` : null,
        publishedAt: newPublishedState ? new Date() : null,
      });

      setPageStatus((prev) => ({
        ...prev,
        published: newPublishedState,
        publishedUrl: newPublishedState ? `${user.uid}/${pageId}` : undefined,
      }));

      toast({
        title: newPublishedState ? "Page Published!" : "Page Unpublished",
        description: newPublishedState ? "Your page is now live and accessible to everyone." : "Your page has been taken offline.",
      });
    } catch (error) {
      console.error("Toggle publish error:", error);
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: "Failed to update page status",
      });
    } finally {
      setIsPublishing(false);
    }
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

  const handleTreeNodeSelect = (componentId: string) => {
    setSelectedComponent(componentId);
    setShowEditPanel(true);
    setShowComponentTree(false);
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
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="flex flex-col">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("builder.untitled")}
                className="w-64 border-none text-lg font-medium focus-visible:ring-0"
              />
              {/* Page Status Indicator */}
              {pageStatus.paymentStatus === "paid" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {pageStatus.published ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Live at /p/{pageStatus.publishedUrl}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Paid • Ready to publish</span>
                    </>
                  )}
                </div>
              )}
            </div>
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
            <Button variant="outline" size="sm" onClick={() => setShowComponentTree(!showComponentTree)}>
              <TreePine className="h-4 w-4 mr-1" />
              Tree
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {pageId && pageId !== "new" && (
              <>
                {pageStatus.paymentStatus === "paid" ? (
                  // For paid pages, show toggle publish/unpublish
                  <Button size="sm" onClick={handleTogglePublish} disabled={isPublishing} variant={pageStatus.published ? "secondary" : "default"}>
                    {pageStatus.published ? (
                      <>
                        <Undo2Icon className="h-4 w-4 mr-1" />
                        {isPublishing ? "Updating..." : "Unpublish"}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        {isPublishing ? "Publishing..." : "Publish"}
                      </>
                    )}
                  </Button>
                ) : (
                  // For unpaid pages, show pay to publish
                  <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                    <Upload className="h-4 w-4 mr-1" />
                    {isPublishing ? "Publishing..." : "Pay & Publish"}
                  </Button>
                )}

                {/* Show live page link if published */}
                {pageStatus.published && pageStatus.publishedUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/p/${pageStatus.publishedUrl}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      View Live
                    </a>
                  </Button>
                )}
              </>
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
              <div className="border-b bg-gradient-to-r from-background to-muted/10 px-1 py-1">
                <TabsList className="w-full h-14 grid grid-cols-3 rounded-lg bg-muted/20 p-1">
                  <TabsTrigger
                    value="components"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all hover:bg-background/80 rounded-md"
                  >
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary/60" />
                        <span className="text-xs font-semibold">Components</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-none">Add elements</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all hover:bg-background/80 rounded-md"
                  >
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500/60" />
                        <span className="text-xs font-semibold">Templates</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-none">Quick start</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all hover:bg-background/80 rounded-md"
                  >
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="flex items-center gap-1.5">
                        <Settings className="h-3 w-3 text-emerald-500/80" />
                        <span className="text-xs font-semibold">Page</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-none">Configure</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="components" className="m-0 h-full">
                  <div className="p-4 space-y-4">
                    <div className="px-1">
                      <h3 className="font-bold text-sm mb-1 text-foreground">Add Components</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Select a component to add it to your page.</p>
                    </div>
                    <ComponentPanel onAddComponent={handleAddComponent} />
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="m-0 h-full">
                  <div className="p-4 space-y-4">
                    <div className="px-1">
                      <h3 className="font-bold text-sm mb-1 text-foreground">Page Templates</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Start with a pre-designed template and customize it to your needs.
                      </p>
                    </div>
                    <TemplatesPanel onApplyTemplate={handleApplyTemplate} />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="m-0 h-full">
                  <div className="p-4 space-y-4">
                    <div className="px-1">
                      <h3 className="font-bold text-sm mb-1 text-foreground">Page Settings</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Customize the overall appearance and behavior of your page.</p>
                    </div>
                    <SettingsPanel settings={settings} onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })} />
                  </div>
                </TabsContent>
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="border-t bg-gradient-to-b from-muted/10 to-muted/30 p-3">
                <h4 className="text-[10px] font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  Keyboard Shortcuts
                </h4>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Save</span>
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[9px]">Ctrl+S</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Preview</span>
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[9px]">Ctrl+P</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tree View</span>
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[9px]">Ctrl+T</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delete</span>
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[9px]">Del</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Deselect</span>
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[9px]">Esc</span>
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
              data-page-content="true"
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
                            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ignore-thumbnail">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background ignore-thumbnail"
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
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-destructive ignore-thumbnail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComponent(component.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {selectedComponent === component.id && (
                              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium ignore-thumbnail">
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

      {/* Component Tree Overlay */}
      {showComponentTree && (
        <ComponentTreeVisualizer
          components={components}
          selectedComponent={selectedComponent}
          onSelectComponent={handleTreeNodeSelect}
          onClose={() => setShowComponentTree(false)}
        />
      )}

      {/* Publication Payment Dialog */}
      {user && pageId && pageId !== "new" && (
        <PublicationPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          pageId={pageId}
          pageTitle={title}
          userId={user.uid}
          onPaymentSuccess={() => {
            // Update page status after successful payment
            setPageStatus((prev) => ({
              ...prev,
              paymentStatus: "paid",
              published: true,
              publishedUrl: `${user.uid}/${pageId}`,
            }));
          }}
        />
      )}

      {/* Thumbnail Generation Indicator */}
      <ThumbnailIndicator isGenerating={isGeneratingThumbnail} hasGenerated={thumbnailGenerated} />
    </div>
  );
}
