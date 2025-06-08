"use client";

import { useFirebase } from "@/lib/firebase/firebase-provider";
import { QRCodesList } from "@/components/qr-code/qr-codes-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QRCodesPage() {
  const { user } = useFirebase();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your QR codes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My QR Codes</h1>
            <p className="text-muted-foreground">Manage QR codes for all your published pages</p>
          </div>
        </div>
      </div>

      <QRCodesList userId={user.uid} />
    </div>
  );
}
