"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { PageBuilder } from "@/components/builder/page-builder"

export default function BuilderPage({ params }: { params: { id: string } }) {
  const { user, loading } = useFirebase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <PageBuilder pageId={params.id} />
}
