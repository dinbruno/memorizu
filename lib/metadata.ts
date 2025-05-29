import { Metadata } from "next";
import { getPublishedPageById, getPageByCustomSlug } from "@/lib/firebase/firestore-service";

interface PageData {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  components: any[];
  settings: {
    backgroundColor: string;
    fontFamily: string;
    customCSS: string;
  };
  published: boolean;
  customSlug?: string;
  publishedAt?: any;
}

// Extract description from page components
function extractDescription(components: any[]): string {
  // Look for text components to extract description
  for (const component of components) {
    if (component.type === "text" && component.data?.content) {
      // Remove HTML tags and get first 160 characters
      const text = component.data.content.replace(/<[^>]*>/g, "").trim();
      if (text.length > 0) {
        return text.length > 160 ? text.substring(0, 157) + "..." : text;
      }
    }
    if (component.type === "heading" && component.data?.text) {
      const text = component.data.text.replace(/<[^>]*>/g, "").trim();
      if (text.length > 0) {
        return text.length > 160 ? text.substring(0, 157) + "..." : text;
      }
    }
  }
  return "Uma página especial criada com Memorizu";
}

// Extract first image from page components
function extractFirstImage(components: any[]): string | null {
  for (const component of components) {
    if (component.type === "image" && component.data?.src) {
      return component.data.src;
    }
    if (component.type === "gallery" && component.data?.images && component.data.images.length > 0) {
      return component.data.images[0].src || component.data.images[0].url;
    }
  }
  return null;
}

// Generate metadata for page by ID
export async function generatePageMetadata(pageId: string): Promise<Metadata> {
  try {
    const pageData = (await getPublishedPageById(pageId)) as PageData | null;

    if (!pageData) {
      return {
        title: "Página não encontrada | Memorizu",
        description: "A página que você está procurando não foi encontrada ou não está mais disponível.",
      };
    }

    const title = pageData.title || "Página Memorizu";
    const description = pageData.description || extractDescription(pageData.components);
    const image = extractFirstImage(pageData.components);
    const url = `https://www.memorizu.com/p/${pageId}`;

    return {
      title: `${title} | Memorizu`,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Memorizu",
        type: "website",
        images: image
          ? [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [
              {
                url: "https://www.memorizu.com/MEMORIZU.png",
                width: 1200,
                height: 630,
                alt: "Memorizu - Crie páginas especiais",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : ["https://www.memorizu.com/MEMORIZU.png"],
      },
      other: {
        "application-name": "Memorizu",
        "apple-mobile-web-app-title": "Memorizu",
        "msapplication-TileColor": "#000000",
        "theme-color": "#000000",
      },
    };
  } catch (error) {
    console.error("Error generating page metadata:", error);
    return {
      title: "Memorizu",
      description: "Crie páginas especiais e inesquecíveis",
    };
  }
}

// Generate metadata for page by slug
export async function generateSlugMetadata(slug: string): Promise<Metadata> {
  try {
    const pageData = (await getPageByCustomSlug(slug)) as PageData | null;

    if (!pageData) {
      return {
        title: "Página não encontrada | Memorizu",
        description: "A página que você está procurando não foi encontrada ou não está mais disponível.",
      };
    }

    const title = pageData.title || "Página Memorizu";
    const description = pageData.description || extractDescription(pageData.components);
    const image = extractFirstImage(pageData.components);
    const url = `https://www.memorizu.com/s/${slug}`;

    return {
      title: `${title} | Memorizu`,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Memorizu",
        type: "website",
        images: image
          ? [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [
              {
                url: "https://www.memorizu.com/MEMORIZU.png",
                width: 1200,
                height: 630,
                alt: "Memorizu - Crie páginas especiais",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : ["https://www.memorizu.com/MEMORIZU.png"],
      },
      other: {
        "application-name": "Memorizu",
        "apple-mobile-web-app-title": "Memorizu",
        "msapplication-TileColor": "#000000",
        "theme-color": "#000000",
      },
    };
  } catch (error) {
    console.error("Error generating slug metadata:", error);
    return {
      title: "Memorizu",
      description: "Crie páginas especiais e inesquecíveis",
    };
  }
}
