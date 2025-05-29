"use client";

import { useEffect, useState } from "react";
import { ComponentRenderer } from "@/components/builder/component-renderer";
import { EffectsOverlay } from "@/components/builder/effects/effects-overlay";
import { getPageByCustomSlug } from "@/lib/firebase/firestore-service";
import { PageAccessGuard } from "@/components/payment/page-access-guard";
import { PageNotFound } from "@/components/ui/page-not-found";
import { MemorizuLoading } from "@/components/ui/memorizu-loading";

interface PageData {
  id: string;
  userId?: string;
  title: string;
  components: any[];
  settings: {
    backgroundColor: string;
    fontFamily: string;
    customCSS: string;
  };
  published: boolean;
  customSlug?: string;
}

interface SlugPageContentProps {
  slug: string;
}

export function SlugPageContent({ slug }: SlugPageContentProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        if (!slug) {
          setError("Invalid page URL");
          return;
        }

        // Try to find by custom slug
        const pageData = await getPageByCustomSlug(slug);

        if (!pageData) {
          setError("Page not found or not published");
          return;
        }

        setPage(pageData as PageData);
      } catch (err) {
        console.error("Error loading page:", err);
        setError("Failed to load page");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return <MemorizuLoading message="Carregando página..." />;
  }

  if (error || !page) {
    // Determine the reason for the error
    let reason: "not-found" | "not-published" | "not-paid" | "access-denied" = "not-found";

    if (error?.includes("not published")) {
      reason = "not-published";
    } else if (error?.includes("payment")) {
      reason = "not-paid";
    } else if (error?.includes("permission") || error?.includes("access")) {
      reason = "access-denied";
    }

    return (
      <PageNotFound
        reason={reason}
        debugInfo={{
          slug: slug,
          route: "/s/[slug]",
        }}
      />
    );
  }

  // Extract effects from components
  const effects =
    page.components
      ?.filter(
        (component) => ["falling-hearts", "floating-bubbles", "sparkle-effect", "confetti"].includes(component.type) && component.data?.enabled
      )
      .map((component) => ({
        type: component.type,
        data: component.data,
      })) || [];

  // Filter out effect components from regular rendering
  const regularComponents =
    page.components?.filter((component) => !["falling-hearts", "floating-bubbles", "sparkle-effect", "confetti"].includes(component.type)) || [];

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
  );
}
