"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Settings, Link as LinkIcon, Trash2, Search, Filter, Globe, Lock, Pencil, Eye, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertMessage } from "@/components/ui/alert-message";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserPages, getPageById, deletePage } from "@/lib/firebase/firestore-service";
import { SlugManager } from "@/components/slug/slug-manager";
import { BulkDeleteManager } from "@/components/pages/bulk-delete-manager";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

interface PageData {
  id: string;
  title: string;
  template: string;
  updatedAt: any;
  published: boolean;
  publishedUrl: string | null;
  customSlug?: string;
  paymentStatus?: "paid" | "unpaid" | "pending" | "failed" | "disputed" | "refunded";
  thumbnail?: string;
  components?: any[];
}

export default function ManagePagesPage() {
  const { language } = useLanguage();
  const { user } = useFirebase();
  const searchParams = useSearchParams();
  const selectedPageId = searchParams.get("page");

  const [pages, setPages] = useState<PageData[]>([]);
  const [filteredPages, setFilteredPages] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "published" | "with-slug">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);

  // Check if we're managing a specific page
  const isManagingSpecificPage = !!selectedPageId && !!selectedPage;

  // Dynamic page title and description
  const getPageTitle = () => {
    if (isManagingSpecificPage) {
      return language === "pt-BR" ? "Gerenciar Página" : "Manage Page";
    }
    return language === "pt-BR" ? "Gerenciar Páginas" : "Manage Pages";
  };

  const getPageDescription = () => {
    if (isManagingSpecificPage) {
      return language === "pt-BR"
        ? `Configurações avançadas para: ${selectedPage?.title || "Sem título"}`
        : `Advanced settings for: ${selectedPage?.title || "Untitled"}`;
    }
    return language === "pt-BR" ? "Gerencie URLs personalizadas e exclua rascunhos em lote" : "Manage custom URLs and bulk delete drafts";
  };

  useEffect(() => {
    loadPages();
  }, [user]);

  useEffect(() => {
    if (selectedPageId && pages.length > 0) {
      const page = pages.find((p) => p.id === selectedPageId);
      if (page) {
        setSelectedPage(page);
      } else {
        // Page not found, redirect to general management
        window.history.replaceState({}, "", "/dashboard/pages/manage");
        setError(language === "pt-BR" ? "Página não encontrada" : "Page not found");
      }
    } else if (!selectedPageId) {
      setSelectedPage(null);
    }
  }, [selectedPageId, pages, language]);

  useEffect(() => {
    filterPages();
  }, [pages, searchQuery, filterBy]);

  useEffect(() => {
    // Reset filter when switching between modes
    if (!isManagingSpecificPage) {
      setFilterBy("all");
    }
  }, [isManagingSpecificPage]);

  const loadPages = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userPages = await getUserPages(user.uid);
      setPages(userPages as PageData[]);

      // If there's a selected page ID, load that specific page
      if (selectedPageId) {
        const pageData = await getPageById(user.uid, selectedPageId);
        if (pageData) {
          setSelectedPage(pageData as PageData);
        }
      }
    } catch (error) {
      console.error("Error loading pages:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...pages];

    // If managing multiple pages, only show published pages
    if (!isManagingSpecificPage) {
      filtered = filtered.filter((page) => page.published && page.paymentStatus === "paid");
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (page) => page.title?.toLowerCase().includes(searchQuery.toLowerCase()) || page.customSlug?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter (only when managing multiple pages)
    if (!isManagingSpecificPage) {
      switch (filterBy) {
        case "with-slug":
          filtered = filtered.filter((page) => page.customSlug);
          break;
        // "published" and "all" show the same since we already filter to published pages
      }
    }

    setFilteredPages(filtered);
  };

  const handlePagesDeleted = (deletedCount: number) => {
    setSuccess(language === "pt-BR" ? `${deletedCount} página(s) excluída(s) com sucesso!` : `${deletedCount} page(s) deleted successfully!`);
    loadPages(); // Reload pages
  };

  const handleSlugUpdate = (pageId: string, newSlug: string) => {
    setPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, customSlug: newSlug } : page)));
    if (selectedPage && selectedPage.id === pageId) {
      setSelectedPage((prev) => (prev ? { ...prev, customSlug: newSlug } : null));
    }
    setSuccess(language === "pt-BR" ? "URL personalizada atualizada com sucesso!" : "Custom URL updated successfully!");
  };

  const openDeleteConfirm = (page: PageData) => {
    setPageToDelete(page);
    setShowDeleteConfirm(true);
    setDeleteStep(1);
    setDeleteConfirmText("");
    setIsDeleting(false);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setPageToDelete(null);
    setDeleteStep(1);
    setDeleteConfirmText("");
    setIsDeleting(false);
  };

  const handleDeleteStepNext = () => {
    if (deleteStep === 1) {
      setDeleteStep(2);
    } else if (deleteStep === 2) {
      const expectedTitle = pageToDelete?.title || (language === "pt-BR" ? "Sem título" : "Untitled");
      if (deleteConfirmText.trim().toLowerCase() === expectedTitle.toLowerCase()) {
        handleDeletePage();
      }
    }
  };

  const handleDeletePage = async () => {
    if (!pageToDelete || !user) return;

    setIsDeleting(true);
    try {
      await deletePage(user.uid, pageToDelete.id);

      setPages((prev) => prev.filter((page) => page.id !== pageToDelete.id));
      if (selectedPage && selectedPage.id === pageToDelete.id) {
        setSelectedPage(null);
      }

      setSuccess(language === "pt-BR" ? "Página excluída com sucesso!" : "Page deleted successfully!");
      closeDeleteConfirm();
    } catch (error) {
      console.error("Error deleting page:", error);
      const errorMessage = getContextualErrorMessage(error, language, "delete");
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (page: PageData) => {
    if (page.published && page.paymentStatus === "paid") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
          <Globe className="h-3 w-3 mr-1" />
          {language === "pt-BR" ? "Publicada" : "Published"}
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Lock className="h-3 w-3 mr-1" />
        {language === "pt-BR" ? "Rascunho" : "Draft"}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPublishedUrl = (page: PageData) => {
    if (page.customSlug) {
      return `https://www.memorizu.com/s/${page.customSlug}`;
    }
    return `https://www.memorizu.com/p/${page.id}`;
  };

  const publishedPages = pages.filter((page) => page.published && page.paymentStatus === "paid");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/pages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "pt-BR" ? "Voltar" : "Back"}
            </Link>
          </Button>
        </div>
      </div>
      <div className="my-4">
        <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
      </div>

      {/* Error Alert */}
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-4" />}

      {/* Success Alert */}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />}

      <Tabs defaultValue="urls" className="space-y-6">
        <TabsList className={`grid w-full ${isManagingSpecificPage ? "grid-cols-1" : "grid-cols-2"}`}>
          <TabsTrigger value="urls" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            {isManagingSpecificPage
              ? language === "pt-BR"
                ? "URL Personalizada"
                : "Custom URL"
              : language === "pt-BR"
              ? "URLs Personalizadas"
              : "Custom URLs"}
          </TabsTrigger>
          {!isManagingSpecificPage && (
            <TabsTrigger value="cleanup" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {language === "pt-BR" ? "Limpeza" : "Cleanup"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="urls" className="space-y-6">
          {isManagingSpecificPage ? (
            // Single page management
            <div className="max-w-4xl">
              {selectedPage && (
                <div className="space-y-6">
                  {/* Page Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        {selectedPage.title || (language === "pt-BR" ? "Sem título" : "Untitled")}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{formatDate(selectedPage.updatedAt)}</span>
                        <span>•</span>
                        <span>{selectedPage.components?.length || 0} components</span>
                        <span>•</span>
                        <div>{getStatusBadge(selectedPage)}</div>
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* URLs Section */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">{language === "pt-BR" ? "URLs da Página" : "Page URLs"}</h3>

                    {/* Custom URL */}
                    {selectedPage.customSlug ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <LinkIcon className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-medium text-green-700">
                                {language === "pt-BR" ? "URL Personalizada (Ativa)" : "Custom URL (Active)"}
                              </p>
                            </div>
                            <p className="text-sm text-green-600 font-mono break-all">https://www.memorizu.com/s/{selectedPage.customSlug}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={getPublishedUrl(selectedPage)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              {language === "pt-BR" ? "Abrir" : "Open"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/50 border border-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">{language === "pt-BR" ? "URL Padrão" : "Default URL"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono break-all">https://www.memorizu.com/p/{selectedPage.id}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Slug Manager */}
                  <SlugManager
                    userId={user?.uid || ""}
                    pageId={selectedPage.id}
                    currentSlug={selectedPage.customSlug}
                    pageTitle={selectedPage.title}
                    isPaid={selectedPage.published && selectedPage.paymentStatus === "paid"}
                    onSlugUpdate={(newSlug) => handleSlugUpdate(selectedPage.id, newSlug)}
                  />

                  <Separator />

                  {/* Page Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{language === "pt-BR" ? "Ações da Página" : "Page Actions"}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" asChild>
                        <Link href={`/builder/${selectedPage.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {language === "pt-BR" ? "Editar Página" : "Edit Page"}
                        </Link>
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={getPublishedUrl(selectedPage)} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          {language === "pt-BR" ? "Ver Online" : "View Live"}
                        </Link>
                      </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-700">{language === "pt-BR" ? "Zona de Perigo" : "Danger Zone"}</h4>
                          <p className="text-sm text-red-600 mt-1">
                            {language === "pt-BR"
                              ? "Excluir esta página permanentemente. Esta ação não pode ser desfeita."
                              : "Delete this page permanently. This action cannot be undone."}
                          </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(selectedPage)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          {language === "pt-BR" ? "Excluir" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Multiple pages management
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Page Selector */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {language === "pt-BR" ? "Páginas Publicadas" : "Published Pages"}
                    </CardTitle>
                    <CardDescription>
                      {language === "pt-BR" ? "Selecione uma página para personalizar sua URL" : "Select a page to customize its URL"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search and Filter */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder={language === "pt-BR" ? "Buscar páginas..." : "Search pages..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                        <SelectTrigger>
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === "pt-BR" ? "Todas Publicadas" : "All Published"}</SelectItem>
                          <SelectItem value="with-slug">{language === "pt-BR" ? "Com URL Personalizada" : "With Custom URL"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pages List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredPages.length > 0 ? (
                        filteredPages.map((page) => (
                          <div
                            key={page.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedPage?.id === page.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedPage(page)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">{page.title || (language === "pt-BR" ? "Sem título" : "Untitled")}</h4>
                                {getStatusBadge(page)}
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">{language === "pt-BR" ? "URL atual:" : "Current URL:"}</p>
                                <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                                  {page.customSlug ? `/s/${page.customSlug}` : `/p/${page.id}`}
                                </p>
                              </div>
                              {page.customSlug && (
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs text-blue-600 font-medium">
                                    {language === "pt-BR" ? "URL Personalizada" : "Custom URL"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{language === "pt-BR" ? "Nenhuma página encontrada" : "No pages found"}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* URL Manager */}
              <div className="lg:col-span-2">
                {selectedPage ? (
                  <div className="space-y-4">
                    {/* Selected Page Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Pencil className="h-5 w-5" />
                          {selectedPage.title || (language === "pt-BR" ? "Sem título" : "Untitled")}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span>{formatDate(selectedPage.updatedAt)}</span>
                          <span>•</span>
                          <span>{selectedPage.components?.length || 0} components</span>
                          <span>•</span>
                          <Button variant="link" size="sm" className="h-auto p-0" asChild>
                            <Link href={getPublishedUrl(selectedPage)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              {language === "pt-BR" ? "Ver Online" : "View Live"}
                            </Link>
                          </Button>
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {/* Slug Manager */}
                    <SlugManager
                      userId={user?.uid || ""}
                      pageId={selectedPage.id}
                      currentSlug={selectedPage.customSlug}
                      pageTitle={selectedPage.title}
                      isPaid={selectedPage.published && selectedPage.paymentStatus === "paid"}
                      onSlugUpdate={(newSlug) => handleSlugUpdate(selectedPage.id, newSlug)}
                    />

                    <Separator />

                    {/* Page Actions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">{language === "pt-BR" ? "Ações da Página" : "Page Actions"}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" asChild>
                          <Link href={`/builder/${selectedPage.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {language === "pt-BR" ? "Editar Página" : "Edit Page"}
                          </Link>
                        </Button>

                        <Button variant="outline" asChild>
                          <Link href={getPublishedUrl(selectedPage)} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            {language === "pt-BR" ? "Ver Online" : "View Live"}
                          </Link>
                        </Button>
                      </div>

                      {/* Danger Zone */}
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-700">{language === "pt-BR" ? "Zona de Perigo" : "Danger Zone"}</h4>
                            <p className="text-sm text-red-600 mt-1">
                              {language === "pt-BR"
                                ? "Excluir esta página permanentemente. Esta ação não pode ser desfeita."
                                : "Delete this page permanently. This action cannot be undone."}
                            </p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(selectedPage)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            {language === "pt-BR" ? "Excluir" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card className="border-dashed h-full">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <LinkIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">{language === "pt-BR" ? "Selecione uma Página" : "Select a Page"}</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        {language === "pt-BR"
                          ? "Escolha uma página publicada na lista ao lado para personalizar sua URL"
                          : "Choose a published page from the list to customize its URL"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          {!isManagingSpecificPage && (
            <div className="max-w-4xl">
              <BulkDeleteManager userId={user?.uid || ""} onPagesDeleted={handlePagesDeleted} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && pageToDelete && (
        <Dialog open={showDeleteConfirm} onOpenChange={(open) => !isDeleting && setShowDeleteConfirm(open)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                {language === "pt-BR" ? "Confirmar Exclusão" : "Confirm Deletion"}
              </DialogTitle>
              <DialogDescription>
                {deleteStep === 1
                  ? language === "pt-BR"
                    ? "Esta ação não pode ser desfeita."
                    : "This action cannot be undone."
                  : language === "pt-BR"
                  ? "Digite o nome da página para confirmar:"
                  : "Type the page name to confirm:"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {deleteStep === 1 ? (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>{language === "pt-BR" ? "Página:" : "Page:"}</strong>{" "}
                      {pageToDelete.title || (language === "pt-BR" ? "Sem título" : "Untitled")}
                    </p>
                    {pageToDelete.customSlug && (
                      <p className="text-sm text-red-700 mt-1">
                        <strong>{language === "pt-BR" ? "URL:" : "URL:"}</strong> memorizu.com/s/{pageToDelete.customSlug}
                      </p>
                    )}
                    <p className="text-sm text-red-700 mt-1">
                      <strong>{language === "pt-BR" ? "Componentes:" : "Components:"}</strong> {pageToDelete.components?.length || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={closeDeleteConfirm} disabled={isDeleting}>
                      {language === "pt-BR" ? "Cancelar" : "Cancel"}
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={handleDeleteStepNext} disabled={isDeleting}>
                      {language === "pt-BR" ? "Continuar" : "Continue"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirm-title">{language === "pt-BR" ? "Digite o título da página:" : "Type the page title:"}</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {pageToDelete.title || (language === "pt-BR" ? "Sem título" : "Untitled")}
                    </p>
                    <Input
                      id="confirm-title"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={pageToDelete.title || (language === "pt-BR" ? "Sem título" : "Untitled")}
                      className={`${
                        deleteConfirmText.trim() &&
                        deleteConfirmText.trim().toLowerCase() ===
                          (pageToDelete?.title || (language === "pt-BR" ? "Sem título" : "Untitled")).toLowerCase()
                          ? "border-green-500 focus:border-green-500"
                          : deleteConfirmText.trim()
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isDeleting}
                    />
                    {deleteConfirmText.trim() && (
                      <p
                        className={`text-xs ${
                          deleteConfirmText.trim().toLowerCase() ===
                          (pageToDelete?.title || (language === "pt-BR" ? "Sem título" : "Untitled")).toLowerCase()
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {deleteConfirmText.trim().toLowerCase() ===
                        (pageToDelete?.title || (language === "pt-BR" ? "Sem título" : "Untitled")).toLowerCase()
                          ? language === "pt-BR"
                            ? "✓ Título confirmado"
                            : "✓ Title confirmed"
                          : language === "pt-BR"
                          ? "✗ Título não confere"
                          : "✗ Title doesn't match"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setDeleteStep(1)} disabled={isDeleting}>
                      {language === "pt-BR" ? "Voltar" : "Back"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDeleteStepNext}
                      disabled={
                        isDeleting ||
                        deleteConfirmText.trim().toLowerCase() !==
                          (pageToDelete?.title || (language === "pt-BR" ? "Sem título" : "Untitled")).toLowerCase()
                      }
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {language === "pt-BR" ? "Excluindo..." : "Deleting..."}
                        </>
                      ) : language === "pt-BR" ? (
                        "Excluir Definitivamente"
                      ) : (
                        "Delete Permanently"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
