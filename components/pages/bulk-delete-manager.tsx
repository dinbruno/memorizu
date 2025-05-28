"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/ui/alert-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Trash2, FileText, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { getUnpaidPages, deleteUnpaidPages } from "@/lib/firebase/firestore-service";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

interface UnpaidPage {
  id: string;
  title: string;
  updatedAt: any;
  template?: string;
  components?: any[];
}

interface BulkDeleteManagerProps {
  userId: string;
  onPagesDeleted?: (deletedCount: number) => void;
}

export function BulkDeleteManager({ userId, onPagesDeleted }: BulkDeleteManagerProps) {
  const [unpaidPages, setUnpaidPages] = useState<UnpaidPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadUnpaidPages();
  }, [userId]);

  const loadUnpaidPages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pages = await getUnpaidPages(userId);
      setUnpaidPages(pages as UnpaidPage[]);
    } catch (error) {
      console.error("Error loading unpaid pages:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(unpaidPages.map((page) => page.id));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPages((prev) => [...prev, pageId]);
    } else {
      setSelectedPages((prev) => prev.filter((id) => id !== pageId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPages.length === 0) return;

    setIsDeleting(true);
    setDeleteProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const totalPages = selectedPages.length;
      let deletedCount = 0;

      // Delete pages one by one with progress updates
      for (let i = 0; i < selectedPages.length; i++) {
        const pageId = selectedPages[i];
        const page = unpaidPages.find((p) => p.id === pageId);

        setCurrentlyDeleting(page?.title || pageId);
        setDeleteProgress(Math.round((i / totalPages) * 100));

        try {
          await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UX
          const result = await deleteUnpaidPages(userId, [pageId]);

          if (result.success.length > 0) {
            deletedCount++;
          }
        } catch (error) {
          console.error(`Error deleting page ${pageId}:`, error);
        }
      }

      setDeleteProgress(100);
      setCurrentlyDeleting("");

      // Update the pages list
      setUnpaidPages((prev) => prev.filter((page) => !selectedPages.includes(page.id)));
      setSelectedPages([]);

      setSuccess(language === "pt-BR" ? `${deletedCount} página(s) excluída(s) com sucesso!` : `${deletedCount} page(s) deleted successfully!`);

      onPagesDeleted?.(deletedCount);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      const errorMessage = getContextualErrorMessage(error, language, "delete");
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteProgress(0);
      setCurrentlyDeleting("");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {language === "pt-BR" ? "Gerenciar Rascunhos" : "Manage Drafts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unpaidPages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {language === "pt-BR" ? "Gerenciar Rascunhos" : "Manage Drafts"}
          </CardTitle>
          <CardDescription>{language === "pt-BR" ? "Exclua páginas não publicadas em lote" : "Delete unpublished pages in bulk"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{language === "pt-BR" ? "Nenhum rascunho encontrado" : "No drafts found"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          {language === "pt-BR" ? "Gerenciar Rascunhos" : "Manage Drafts"}
        </CardTitle>
        <CardDescription>
          {language === "pt-BR" ? "Exclua páginas não publicadas em lote para liberar espaço" : "Delete unpublished pages in bulk to free up space"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

        {/* Success Alert */}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Delete Progress */}
        <AnimatePresence>
          {isDeleting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">{language === "pt-BR" ? "Excluindo páginas..." : "Deleting pages..."}</span>
              </div>

              <Progress value={deleteProgress} className="h-2" />

              {currentlyDeleting && (
                <p className="text-sm text-blue-600">
                  {language === "pt-BR" ? "Excluindo: " : "Deleting: "}
                  <span className="font-medium">{currentlyDeleting}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="select-all" checked={selectedPages.length === unpaidPages.length} onCheckedChange={handleSelectAll} disabled={isDeleting} />
            <label htmlFor="select-all" className="text-sm font-medium">
              {language === "pt-BR" ? "Selecionar todos" : "Select all"}
            </label>
            {selectedPages.length > 0 && (
              <Badge variant="secondary">
                {selectedPages.length} {language === "pt-BR" ? "selecionada(s)" : "selected"}
              </Badge>
            )}
          </div>

          <Button onClick={handleBulkDelete} disabled={selectedPages.length === 0 || isDeleting} variant="destructive" size="sm">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {language === "pt-BR" ? "Excluir Selecionadas" : "Delete Selected"}
          </Button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">{language === "pt-BR" ? "Atenção!" : "Warning!"}</p>
            <p>
              {language === "pt-BR"
                ? "Esta ação não pode ser desfeita. As páginas excluídas serão permanentemente removidas."
                : "This action cannot be undone. Deleted pages will be permanently removed."}
            </p>
          </div>
        </div>

        {/* Pages List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {unpaidPages.map((page) => (
            <motion.div key={page.id} layout className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={selectedPages.includes(page.id)}
                onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                disabled={isDeleting}
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{page.title || (language === "pt-BR" ? "Sem título" : "Untitled")}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(page.updatedAt)}
                  </span>
                  {page.template && <span className="capitalize">{page.template.replace("-", " ")} template</span>}
                  <span>{page.components?.length || 0} components</span>
                </div>
              </div>

              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {language === "pt-BR" ? "Rascunho" : "Draft"}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
