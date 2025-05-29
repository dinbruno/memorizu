import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { PublishedPageContent } from "@/components/pages/published-page-content";

interface Props {
  params: Promise<{
    pageId: string;
  }>;
}

// Generate metadata for this page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params;
  return await generatePageMetadata(pageId);
}

export default async function PublishedPage({ params }: Props) {
  const { pageId } = await params;
  return <PublishedPageContent pageId={pageId} />;
}
