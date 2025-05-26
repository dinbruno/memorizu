"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, FileText, Settings, CreditCard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getUserData, getUserPages } from "@/lib/firebase/firestore-service"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  email: string
  plan: string
  pagesCount: number
}

interface PageData {
  id: string
  title: string
  template: string
  updatedAt: any
  published: boolean
  publishedUrl: string | null
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user, signOut } = useFirebase()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentPages, setRecentPages] = useState<PageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          setUserData(userData as UserData)

          const pages = await getUserPages(user.uid)
          setRecentPages(pages.slice(0, 3) as PageData[])
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            variant: "destructive",
            title: t("notification.error"),
            description: "Failed to load dashboard data",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [user, t, toast])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: t("notification.logout"),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: (error as Error).message,
      })
    }
  }

  const dashboardCards = [
    {
      title: t("dashboard.pages"),
      description: "Manage your created pages",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/pages",
    },
    {
      title: t("builder.settings"),
      description: "Update your account settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
    {
      title: "Billing",
      description: "Manage your subscription",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/billing",
    },
  ]

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href={card.href}>View</Link>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[200px]">
                <CardHeader>
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{page.title || t("builder.untitled")}</CardTitle>
                    <CardDescription>{page.template && t(`templates.${page.template.toLowerCase()}`)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{page.updatedAt?.toDate().toLocaleDateString()}</p>
                    {page.published && (
                      <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                        Published
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" asChild>
                      <Link href={`/builder/${page.id}`}>Edit</Link>
                    </Button>
                    {page.published && (
                      <Button variant="outline" asChild>
                        <Link href={`/p/${page.publishedUrl}`} target="_blank">
                          View
                        </Link>
                      </Button>
                    )}
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
      </div>
    </div>
  )
}
