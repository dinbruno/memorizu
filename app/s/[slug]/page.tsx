import { Metadata } from "next";
import { generateSlugMetadata } from "@/lib/metadata";
import { SlugPageContent } from "@/components/pages/slug-page-content";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for this page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return await generateSlugMetadata(slug);
}

export default async function CustomSlugPage({ params }: Props) {
  const { slug } = await params;
  return <SlugPageContent slug={slug} />;
}
