"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Settings,
  CreditCard,
  Calendar,
  Globe,
  Lock,
  Pencil,
  Eye,
  Link as LinkIcon,
  MoreVertical,
  Copy,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertMessage } from "@/components/ui/alert-message";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserData, getUserPages, updateUserData, deletePage } from "@/lib/firebase/firestore-service";
import { useToast } from "@/components/ui/use-toast";
import { PageStatusDebug } from "@/components/debug/page-status-debug";
import { QuickFixButton } from "@/components/debug/quick-fix-button";
import { WelcomeModal } from "@/components/welcome/welcome-modal";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";
import { SlugManager } from "@/components/slug/slug-manager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserData {
  email: string;
  plan: string;
  pagesCount: number;
  displayName?: string;
  isFirstLogin?: boolean;
}

interface PageData {
  id: string;
  title: string;
  template: string;
  updatedAt: any;
  published: boolean;
  publishedUrl: string | null;
  paymentStatus?: "paid" | "unpaid" | "pending" | "failed" | "disputed" | "refunded";
  thumbnail?: string;
  components?: any[];
  customSlug?: string;
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useFirebase();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentPages, setRecentPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPageForSlug, setSelectedPageForSlug] = useState<any>(null);
  const [showSlugManager, setShowSlugManager] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const fetchedUserData = await getUserData(user.uid);
          if (fetchedUserData) {
            const userData = fetchedUserData as unknown as UserData;
            setUserData(userData);

            // Check if this is the user's first login
            if (userData.isFirstLogin !== false) {
              setShowWelcomeModal(true);
            }
          } else {
            // New user - show welcome modal
            setShowWelcomeModal(true);
          }

          const pages = await getUserPages(user.uid);
          setRecentPages(pages.slice(0, 3) as PageData[]);

          // Check for recently published pages (published in the last 5 minutes)
          const recentlyPublished = pages.filter((page: any) => {
            if (!page.published || !page.publishedAt) return false;
            const publishedAt = page.publishedAt.toDate ? page.publishedAt.toDate() : new Date(page.publishedAt);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return publishedAt > fiveMinutesAgo;
          });

          // Show success notification for recently published pages
          if (recentlyPublished.length > 0) {
            recentlyPublished.forEach((page: any) => {
              setSuccess(
                language === "pt-BR"
                  ? `🎉 "${page.title || "Sem título"}" está agora online e acessível a todos.`
                  : `🎉 "${page.title || "Untitled"}" is now live and accessible to everyone.`
              );
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          const errorMessage = getContextualErrorMessage(error, language, "dashboard");
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user, t, language]);

  const handleWelcomeComplete = async (name: string) => {
    if (!user || !name.trim()) return;

    try {
      const updateData: any = {
        isFirstLogin: false,
        displayName: name.trim(),
        updatedAt: new Date(),
      };

      await updateUserData(user.uid, updateData);

      // Update local state
      setUserData((prev) => (prev ? { ...prev, displayName: name.trim(), isFirstLogin: false } : null));
      setShowWelcomeModal(false);

      // Show success message
      setSuccess(language === "pt-BR" ? `Bem-vindo ao Memorizu, ${name.trim()}! 🎉` : `Welcome to Memorizu, ${name.trim()}! 🎉`);
    } catch (error) {
      console.error("Error updating user data:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    }
  };

  const getStatusBadge = (page: PageData) => {
    // Published and paid
    if (page.published && page.paymentStatus === "paid") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
          <Globe className="h-3 w-3 mr-1" />
          Published
        </Badge>
      );
    }

    // Published but payment pending/failed
    if (page.published && page.paymentStatus !== "paid") {
      return (
        <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Globe className="h-3 w-3 mr-1" />
          Published (Payment Issue)
        </Badge>
      );
    }

    // Payment pending
    if (page.paymentStatus === "pending") {
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Calendar className="h-3 w-3 mr-1" />
          Payment Pending
        </Badge>
      );
    }

    // Payment failed
    if (page.paymentStatus === "failed") {
      return (
        <Badge variant="destructive">
          <Calendar className="h-3 w-3 mr-1" />
          Payment Failed
        </Badge>
      );
    }

    // Default draft
    return (
      <Badge variant="outline">
        <Lock className="h-3 w-3 mr-1" />
        Draft
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

  // Calculate statistics
  const totalPages = recentPages.length;
  const publishedPages = recentPages.filter((page) => page.published && page.paymentStatus === "paid").length;

  const dashboardCards = [
    {
      title: language === "pt-BR" ? "Total de Páginas" : "Total Pages",
      description: language === "pt-BR" ? `${totalPages} páginas criadas` : `${totalPages} pages created`,
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/pages",
      value: totalPages,
    },
    {
      title: language === "pt-BR" ? "Publicadas" : "Published",
      description: language === "pt-BR" ? `${publishedPages} páginas online` : `${publishedPages} pages live`,
      icon: <Globe className="h-5 w-5" />,
      href: "/dashboard/pages",
      value: publishedPages,
    },
    {
      title: language === "pt-BR" ? "Configurações" : "Settings",
      description: language === "pt-BR" ? "Configurações da conta" : "Account settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
    {
      title: language === "pt-BR" ? "Faturamento" : "Billing",
      description: language === "pt-BR" ? "Gerenciar assinatura" : "Subscription management",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/billing",
    },
  ];

  const getUserDisplayName = () => {
    if (userData?.displayName) {
      return userData.displayName;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    return "";
  };

  const getWelcomeMessage = () => {
    const displayName = getUserDisplayName();
    if (language === "pt-BR") {
      return displayName ? `Bem-vindo ao Memorizu, ${displayName}!` : "Bem-vindo ao Memorizu!";
    } else {
      return displayName ? `Welcome to Memorizu, ${displayName}!` : "Welcome to Memorizu!";
    }
  };

  const handleSlugUpdate = (pageId: string, newSlug: string) => {
    setRecentPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, customSlug: newSlug } : page)));
    setSuccess(language === "pt-BR" ? "URL personalizada atualizada com sucesso!" : "Custom URL updated successfully!");
  };

  const openSlugModal = (page: PageData) => {
    setSelectedPageForSlug(page);
    setShowSlugManager(true);
  };

  const closeSlugModal = () => {
    setShowSlugManager(false);
    setSelectedPageForSlug(null);
  };

  const copyPageUrl = async (page: PageData) => {
    try {
      const url = getPublishedUrl(page);
      await navigator.clipboard.writeText(url);
      setSuccess(language === "pt-BR" ? "URL copiada para a área de transferência!" : "URL copied to clipboard!");
    } catch (error) {
      console.error("Error copying URL:", error);
      setError(language === "pt-BR" ? "Erro ao copiar URL" : "Error copying URL");
    }
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

      setRecentPages((prev) => prev.filter((page) => page.id !== pageToDelete.id));
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

  const getPublishedUrl = (page: PageData) => {
    if (page.customSlug) {
      return `https://www.memorizu.com/s/${page.customSlug}`;
    }
    return `https://www.memorizu.com/p/${page.id}`;
  };

  return (
    <>
      <WelcomeModal isOpen={showWelcomeModal} onComplete={handleWelcomeComplete} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Alert */}
        {error && <AlertMessage type="error" title={t("notification.error")} message={error} onClose={() => setError(null)} className="mb-4" />}

        {/* Success Alert */}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-2">{getWelcomeMessage()}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/builder/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.create")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{card.icon}</div>
                </CardHeader>
                <CardContent>
                  {card.value !== undefined ? <div className="text-2xl font-bold">{card.value}</div> : null}
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href={card.href}>
                      {card.title.includes("Pages") ||
                      card.title.includes("Published") ||
                      card.title.includes("Páginas") ||
                      card.title.includes("Publicadas")
                        ? language === "pt-BR"
                          ? "Gerenciar"
                          : "Manage"
                        : language === "pt-BR"
                        ? "Visualizar"
                        : "View"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">{t("dashboard.pages")}</h2>
            <Button variant="outline" asChild>
              <Link href="/dashboard/pages">{language === "pt-BR" ? "Ver todas" : "View all"}</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[320px] animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <CardHeader className="pb-3">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 shadow-md">
                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                      {page.thumbnail ? (
                        <img
                          src={page.thumbnail || "/placeholder.svg"}
                          alt={page.title || "Page thumbnail"}
                          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                          style={{ objectPosition: "center" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="text-center text-muted-foreground">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Pencil className="h-6 w-6" />
                            </div>
                            <p className="text-sm">No preview</p>
                          </div>
                        </div>
                      )}

                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 left-3">{getStatusBadge(page)}</div>

                      {/* Three-dots menu for all pages */}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Copy URL - only for published pages */}
                            {page.published && page.paymentStatus === "paid" && (
                              <DropdownMenuItem onClick={() => copyPageUrl(page)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {language === "pt-BR" ? "Copiar URL" : "Copy URL"}
                              </DropdownMenuItem>
                            )}

                            {/* Manage URL - only for published pages */}
                            {page.published && page.paymentStatus === "paid" && (
                              <DropdownMenuItem onClick={() => openSlugModal(page)}>
                                <LinkIcon className="h-4 w-4 mr-2" />
                                {language === "pt-BR" ? "Gerenciar URL" : "Manage URL"}
                              </DropdownMenuItem>
                            )}

                            {/* Delete option - only for unpublished pages */}
                            {!page.published && (
                              <DropdownMenuItem onClick={() => openDeleteConfirm(page)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {language === "pt-BR" ? "Excluir" : "Delete"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{page.title || t("builder.untitled")}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(page.updatedAt)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>{page.components?.length || 0} components</span>
                        {page.template && <span className="capitalize">{page.template.replace("-", " ")} template</span>}
                      </div>

                      {/* Quick Fix for pages with payment issues */}
                      {page.published && !page.paymentStatus && (
                        <div className="mt-2">
                          <QuickFixButton
                            userId={user?.uid || ""}
                            pageId={page.id}
                            pageTitle={page.title || "Untitled"}
                            onSuccess={() => window.location.reload()}
                          />
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/builder/${page.id}`}>
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        {page.published && page.paymentStatus === "paid" ? (
                          <Button variant="default" size="sm" className="flex-1" asChild>
                            <Link href={getPublishedUrl(page)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              View Live
                            </Link>
                          </Button>
                        ) : page.published && page.paymentStatus !== "paid" ? (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={getPublishedUrl(page)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              View (Issue)
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" className="flex-1" disabled>
                            <Lock className="h-3 w-3 mr-1" />
                            Draft
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">{t("dashboard.empty")}</p>
                <Button asChild>
                  <Link href="/builder/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("dashboard.start")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Debug Section - Only show if there are problematic pages and in development */}
          {process.env.NODE_ENV === "development" &&
            recentPages.some(
              (page) => page.paymentStatus === "pending" || page.paymentStatus === "failed" || (page.published && page.paymentStatus !== "paid")
            ) && (
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold text-destructive">⚠️ Pages with Payment Issues (Debug)</h3>
                <div className="grid gap-4">
                  {recentPages
                    .filter(
                      (page) =>
                        page.paymentStatus === "pending" || page.paymentStatus === "failed" || (page.published && page.paymentStatus !== "paid")
                    )
                    .map((page) => (
                      <PageStatusDebug key={page.id} userId={user?.uid || ""} pageId={page.id} pageTitle={page.title || "Untitled"} />
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Slug Manager Modal */}
      {showSlugManager && selectedPageForSlug && (
        <Dialog open={showSlugManager} onOpenChange={closeSlugModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {language === "pt-BR" ? "Gerenciar URL Personalizada" : "Manage Custom URL"}
              </DialogTitle>
              <DialogDescription>
                {language === "pt-BR"
                  ? `Configuração rápida de URL para: ${selectedPageForSlug.title || "Sem título"}`
                  : `Quick URL setup for: ${selectedPageForSlug.title || "Untitled"}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Page Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{language === "pt-BR" ? "Status" : "Status"}</p>
                  <div className="mt-1">{getStatusBadge(selectedPageForSlug)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{language === "pt-BR" ? "Última atualização" : "Last updated"}</p>
                  <p className="text-sm">{formatDate(selectedPageForSlug.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{language === "pt-BR" ? "Componentes" : "Components"}</p>
                  <p className="text-sm">{selectedPageForSlug.components?.length || 0}</p>
                </div>
              </div>

              {/* URLs Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{language === "pt-BR" ? "URLs da Página" : "Page URLs"}</h3>

                {/* Custom URL */}
                {selectedPageForSlug.customSlug ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <LinkIcon className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-700">
                            {language === "pt-BR" ? "URL Personalizada (Ativa)" : "Custom URL (Active)"}
                          </p>
                        </div>
                        <p className="text-sm text-green-600 font-mono break-all">https://www.memorizu.com/s/{selectedPageForSlug.customSlug}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={getPublishedUrl(selectedPageForSlug)} target="_blank" rel="noopener noreferrer">
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
                    <p className="text-sm text-muted-foreground font-mono break-all">https://www.memorizu.com/p/{selectedPageForSlug.id}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Slug Manager */}
              <SlugManager
                userId={user?.uid || ""}
                pageId={selectedPageForSlug.id}
                currentSlug={selectedPageForSlug.customSlug}
                pageTitle={selectedPageForSlug.title}
                isPaid={selectedPageForSlug.published && selectedPageForSlug.paymentStatus === "paid"}
                onSlugUpdate={(newSlug) => {
                  handleSlugUpdate(selectedPageForSlug.id, newSlug);
                  setSelectedPageForSlug((prev: any) => (prev ? { ...prev, customSlug: newSlug } : null));
                }}
              />

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/builder/${selectedPageForSlug.id}`}>
                    <Pencil className="h-3 w-3 mr-1" />
                    {language === "pt-BR" ? "Editar Página" : "Edit Page"}
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/dashboard/pages/manage?page=${selectedPageForSlug.id}`}>
                    <Settings className="h-3 w-3 mr-1" />
                    {language === "pt-BR" ? "Gerenciar Avançado" : "Advanced Management"}
                  </Link>
                </Button>
              </div>

              {/* Info Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>{language === "pt-BR" ? "💡 Dica:" : "💡 Tip:"}</strong>{" "}
                  {language === "pt-BR"
                    ? "Para operações avançadas como exclusão de páginas, acesse o Gerenciamento Avançado."
                    : "For advanced operations like page deletion, access Advanced Management."}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
                        <strong>{language === "pt-BR" ? "URL:" : "URL:"}</strong> memorizu.com/p/{pageToDelete.customSlug}
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
    </>
  );
}
