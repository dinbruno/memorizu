"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ComponentRenderer } from "@/components/builder/component-renderer"
import { EffectsOverlay } from "@/components/builder/effects/effects-overlay"
import { getPageById } from "@/lib/firebase/firestore-service"
import { Loader2 } from "lucide-react"
import { PageAccessGuard } from "@/components/payment/page-access-guard"

interface PageData {
  id: string
  title: string
  components: any[]
  settings: {
    backgroundColor: string
    fontFamily: string
    customCSS: string
  }
}

export default function PublishedPage() {
  const params = useParams()
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPage() {
      try {
        if (!params.pageId || !params.userId) {
          setError("Invalid page URL")
          return
        }

        console.log("Loading page with userId:", params.userId, "pageId:", params.pageId)

        // Fix: Pass both userId and pageId parameters
        const pageData = await getPageById(params.userId as string, params.pageId as string)

        if (!pageData) {
          setError("Page not found")
          return
        }

        console.log("Page loaded successfully:", pageData)
        setPage(pageData as PageData)
      } catch (err) {
        console.error("Error loading page:", err)
        setError("Failed to load page")
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [params.pageId, params.userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">{error || "The page you're looking for doesn't exist."}</p>
        </div>
      </div>
    )
  }

  // Extract effects from components
  const effects =
    page.components
      ?.filter(
        (component) =>
          ["falling-hearts", "floating-bubbles", "sparkle-effect", "confetti"].includes(component.type) &&
          component.data?.enabled,
      )
      .map((component) => ({
        type: component.type,
        data: component.data,
      })) || []

  // Filter out effect components from regular rendering
  const regularComponents =
    page.components?.filter(
      (component) => !["falling-hearts", "floating-bubbles", "sparkle-effect", "confetti"].includes(component.type),
    ) || []

  return (
    <PageAccessGuard pageData={page}>
      <div
        className="min-h-screen relative"
        style={{
          backgroundColor: page.settings?.backgroundColor || "#ffffff",
          fontFamily: page.settings?.fontFamily || "inherit",
        }}
      >
        {/* Effects Overlay */}
        <EffectsOverlay effects={effects} />

        {/* Page Content */}
        <div className="relative z-10">
          {regularComponents.map((component, index) => (
            <ComponentRenderer key={`${component.type}-${index}`} component={component} isPreview={true} />
          ))}
        </div>

        {/* Custom CSS */}
        {page.settings?.customCSS && <style dangerouslySetInnerHTML={{ __html: page.settings.customCSS }} />}
      </div>
    </PageAccessGuard>
  )
}
