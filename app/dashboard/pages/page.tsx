"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Settings, Globe, Lock, Pencil, Eye, Link as LinkIcon, Trash2, Search, Filter, SortAsc, SortDesc } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertMessage } from "@/components/ui/alert-message";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserPages } from "@/lib/firebase/firestore-service";
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

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "status";
type FilterOption = "all" | "published" | "drafts" | "paid" | "unpaid";

export default function PagesManagementPage() {
  const { t, language } = useLanguage();
  const { user } = useFirebase();
  const [pages, setPages] = useState<PageData[]>([]);
  const [filteredPages, setFilteredPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    loadPages();
  }, [user]);

  useEffect(() => {
    filterAndSortPages();
  }, [pages, searchQuery, sortBy, filterBy]);

  const loadPages = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userPages = await getUserPages(user.uid);
      setPages(userPages as PageData[]);
    } catch (error) {
      console.error("Error loading pages:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPages = () => {
    let filtered = [...pages];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (page) =>
          page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.customSlug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.template?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case "published":
        filtered = filtered.filter((page) => page.published && page.paymentStatus === "paid");
        break;
      case "drafts":
        filtered = filtered.filter((page) => !page.published || page.paymentStatus !== "paid");
        break;
      case "paid":
        filtered = filtered.filter((page) => page.paymentStatus === "paid");
        break;
      case "unpaid":
        filtered = filtered.filter((page) => page.paymentStatus !== "paid");
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
          const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
          const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "title-asc":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "status":
        filtered.sort((a, b) => {
          const getStatusPriority = (page: PageData) => {
            if (page.published && page.paymentStatus === "paid") return 0;
            if (page.paymentStatus === "pending") return 1;
            if (page.paymentStatus === "failed") return 2;
            return 3;
          };
          return getStatusPriority(a) - getStatusPriority(b);
        });
        break;
    }

    setFilteredPages(filtered);
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

    if (page.published && page.paymentStatus !== "paid") {
      return (
        <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Globe className="h-3 w-3 mr-1" />
          {language === "pt-BR" ? "Publicada (Problema)" : "Published (Issue)"}
        </Badge>
      );
    }

    if (page.paymentStatus === "pending") {
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          {language === "pt-BR" ? "Pagamento Pendente" : "Payment Pending"}
        </Badge>
      );
    }

    if (page.paymentStatus === "failed") {
      return <Badge variant="destructive">{language === "pt-BR" ? "Pagamento Falhou" : "Payment Failed"}</Badge>;
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

  const getSortIcon = () => {
    if (sortBy.includes("asc") || sortBy === "oldest") {
      return <SortAsc className="h-4 w-4" />;
    }
    return <SortDesc className="h-4 w-4" />;
  };

  const getPublishedUrl = (page: PageData) => {
    if (page.customSlug) {
      return `https://www.memorizu.com/s/${page.customSlug}`;
    }
    return `https://www.memorizu.com/p/${page.id}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{language === "pt-BR" ? "Minhas Páginas" : "My Pages"}</h1>
          <p className="text-muted-foreground mt-2">
            {language === "pt-BR" ? "Gerencie e organize suas páginas criadas" : "Manage and organize your created pages"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/pages/manage">
              <Settings className="h-4 w-4 mr-2" />
              {language === "pt-BR" ? "Gerenciar" : "Manage"}
            </Link>
          </Button>

          <Button asChild>
            <Link href="/builder/new">
              <Plus className="h-4 w-4 mr-2" />
              {language === "pt-BR" ? "Nova Página" : "New Page"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <AlertMessage type="error" title={t("notification.error")} message={error} onClose={() => setError(null)} className="mb-4" />}

      {/* Success Alert */}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={language === "pt-BR" ? "Buscar páginas..." : "Search pages..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "pt-BR" ? "Todas" : "All"}</SelectItem>
            <SelectItem value="published">{language === "pt-BR" ? "Publicadas" : "Published"}</SelectItem>
            <SelectItem value="drafts">{language === "pt-BR" ? "Rascunhos" : "Drafts"}</SelectItem>
            <SelectItem value="paid">{language === "pt-BR" ? "Pagas" : "Paid"}</SelectItem>
            <SelectItem value="unpaid">{language === "pt-BR" ? "Não Pagas" : "Unpaid"}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            {getSortIcon()}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{language === "pt-BR" ? "Mais Recentes" : "Newest"}</SelectItem>
            <SelectItem value="oldest">{language === "pt-BR" ? "Mais Antigas" : "Oldest"}</SelectItem>
            <SelectItem value="title-asc">{language === "pt-BR" ? "Título A-Z" : "Title A-Z"}</SelectItem>
            <SelectItem value="title-desc">{language === "pt-BR" ? "Título Z-A" : "Title Z-A"}</SelectItem>
            <SelectItem value="status">{language === "pt-BR" ? "Por Status" : "By Status"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {language === "pt-BR" ? `${filteredPages.length} de ${pages.length} páginas` : `${filteredPages.length} of ${pages.length} pages`}
        </p>
      </div>

      {/* Pages Grid */}
      <PagesGrid
        pages={filteredPages}
        isLoading={isLoading}
        language={language}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        getPublishedUrl={getPublishedUrl}
        user={user}
      />
    </div>
  );
}

// Separate component for pages grid to avoid repetition
function PagesGrid({
  pages,
  isLoading,
  language,
  getStatusBadge,
  formatDate,
  getPublishedUrl,
  user,
}: {
  pages: PageData[];
  isLoading: boolean;
  language: string;
  getStatusBadge: (page: PageData) => React.ReactNode;
  formatDate: (timestamp: any) => string;
  getPublishedUrl: (page: PageData) => string;
  user: any;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
    );
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">{language === "pt-BR" ? "Nenhuma página encontrada" : "No pages found"}</p>
          <Button asChild>
            <Link href="/builder/new">
              <Plus className="h-4 w-4 mr-2" />
              {language === "pt-BR" ? "Criar Primeira Página" : "Create First Page"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pages.map((page, index) => (
        <motion.div key={page.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
          <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 shadow-md">
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
              {page.thumbnail ? (
                <img
                  src={page.thumbnail}
                  alt={page.title || "Page thumbnail"}
                  className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
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
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{page.title || (language === "pt-BR" ? "Sem título" : "Untitled")}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <span>{formatDate(page.updatedAt)}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{page.components?.length || 0} components</span>
                {page.template && <span className="capitalize">{page.template.replace("-", " ")} template</span>}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/builder/${page.id}`}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </Button>

                {/* Slug management button for paid pages */}
                {page.published && page.paymentStatus === "paid" && (
                  <Button variant="outline" size="sm" asChild className="px-3">
                    <Link href={`/dashboard/pages/manage?page=${page.id}`}>
                      <LinkIcon className="h-3 w-3" />
                    </Link>
                  </Button>
                )}

                {page.published && page.paymentStatus === "paid" ? (
                  <Button variant="default" size="sm" className="flex-1" asChild>
                    <Link href={getPublishedUrl(page)} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3 w-3 mr-1" />
                      View Live
                    </Link>
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1" disabled>
                    <Lock className="h-3 w-3 mr-1" />
                    {language === "pt-BR" ? "Rascunho" : "Draft"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
