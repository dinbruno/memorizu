"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Settings, CreditCard, LogOut, Calendar, Globe, Lock, Pencil, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserData, getUserPages } from "@/lib/firebase/firestore-service";
import { useToast } from "@/components/ui/use-toast";
import { PageStatusDebug } from "@/components/debug/page-status-debug";
import { QuickFixButton } from "@/components/debug/quick-fix-button";

interface UserData {
  email: string;
  plan: string;
  pagesCount: number;
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
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, signOut } = useFirebase();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentPages, setRecentPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const fetchedUserData = await getUserData(user.uid);
          if (fetchedUserData) {
            setUserData(fetchedUserData as unknown as UserData);
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
              toast({
                title: "🎉 Page Published Successfully!",
                description: `"${page.title || "Untitled"}" is now live and accessible to everyone.`,
                duration: 6000,
              });
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            variant: "destructive",
            title: t("notification.error"),
            description: "Failed to load dashboard data",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user, t, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t("notification.logout"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: (error as Error).message,
      });
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
  const totalPages = recentPages.length; // This would be better with actual total count
  const publishedPages = recentPages.filter((page) => page.published && page.paymentStatus === "paid").length;

  const dashboardCards = [
    {
      title: "Total Pages",
      description: `${totalPages} pages created`,
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/pages",
      value: totalPages,
    },
    {
      title: "Published",
      description: `${publishedPages} pages live`,
      icon: <Globe className="h-5 w-5" />,
      href: "/dashboard/pages",
      value: publishedPages,
    },
    {
      title: t("builder.settings"),
      description: "Account settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
    {
      title: "Billing",
      description: "Subscription management",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/billing",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("dashboard.welcome")}
            {userData && `, ${userData.email}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
                  <Link href={card.href}>{card.title.includes("Pages") || card.title.includes("Published") ? "Manage" : "View"}</Link>
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
            <Link href="/dashboard/pages">View all</Link>
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                          <Link href={`/p/${page.publishedUrl}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 mr-1" />
                            View Live
                          </Link>
                        </Button>
                      ) : page.published && page.paymentStatus !== "paid" ? (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/p/${page.publishedUrl}`} target="_blank" rel="noopener noreferrer">
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
                    (page) => page.paymentStatus === "pending" || page.paymentStatus === "failed" || (page.published && page.paymentStatus !== "paid")
                  )
                  .map((page) => (
                    <PageStatusDebug key={page.id} userId={user?.uid || ""} pageId={page.id} pageTitle={page.title || "Untitled"} />
                  ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
