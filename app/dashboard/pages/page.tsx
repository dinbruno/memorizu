"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Pencil, Eye, Trash2, MoreHorizontal, Calendar, Globe, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/components/language-provider"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getUserPages, deletePage } from "@/lib/firebase/firestore-service"
import { useToast } from "@/components/ui/use-toast"

interface PageData {
  id: string
  title: string
  template: string
  updatedAt: any
  published: boolean
  publishedUrl: string | null
  paymentStatus: "paid" | "unpaid" | "pending"
  thumbnail?: string
  components?: any[]
}

export default function PagesPage() {
  const { t } = useLanguage()
  const { user } = useFirebase()
  const { toast } = useToast()
  const [pages, setPages] = useState<PageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
      if (user) {
        try {
          const pages = await getUserPages(user.uid)
          setPages(pages as PageData[])
        } catch (error) {
          console.error("Error fetching pages:", error)
          toast({
            variant: "destructive",
            title: t("notification.error"),
            description: "Failed to load pages",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchPages()
  }, [user, t, toast])

  const handleDeletePage = async () => {
    if (!user || !pageToDelete) return

    try {
      await deletePage(user.uid, pageToDelete)
      setPages(pages.filter((page) => page.id !== pageToDelete))
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: "Failed to delete page",
      })
    } finally {
      setPageToDelete(null)
    }
  }

  const getStatusBadge = (page: PageData) => {
    if (page.paymentStatus === "paid" && page.published) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <Globe className="h-3 w-3 mr-1" />
          Published
        </Badge>
      )
    }
    if (page.paymentStatus === "pending") {
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Calendar className="h-3 w-3 mr-1" />
          Pending Payment
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Lock className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    )
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.pages")}</h1>
            <p className="text-muted-foreground mt-2">Create and manage your event pages</p>
          </div>
          <Button asChild>
            <Link href="/builder/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.create")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.pages")}</h1>
          <p className="text-muted-foreground mt-2">Create and manage your event pages</p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/builder/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("dashboard.create")}
          </Link>
        </Button>
      </div>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pages.map((page, index) => (
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

                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur-sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/builder/${page.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {page.published && page.paymentStatus === "paid" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/p/${page.publishedUrl}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View Live
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the page.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => setPageToDelete(page.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                    {page.published && page.paymentStatus === "paid" ? (
                      <Button variant="default" size="sm" className="flex-1" asChild>
                        <Link href={`/p/${page.publishedUrl}`} target="_blank">
                          <Eye className="h-3 w-3 mr-1" />
                          View
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
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No pages yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create your first event page and start sharing your special moments with the world.
            </p>
            <Button asChild size="lg">
              <Link href="/builder/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.start")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
