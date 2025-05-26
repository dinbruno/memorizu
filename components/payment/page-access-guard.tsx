"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CreditCard, ArrowLeft } from "lucide-react";

interface PageAccessGuardProps {
  children: React.ReactNode;
  pageData: {
    id: string;
    title: string;
    paymentStatus?: string;
    published?: boolean;
  };
}

export function PageAccessGuard({ children, pageData }: PageAccessGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if page is published and paid
    // Esta verificação só se aplica para páginas públicas (/p/userId/pageId)
    // Não afeta o builder (/builder/pageId)
    const hasAccess = !!(pageData.published && pageData.paymentStatus === "paid");
    setIsAuthorized(hasAccess);
  }, [pageData]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Page Not Available</CardTitle>
            <CardDescription>This page is not publicly accessible. It may not have been published or payment may be required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Page:</strong> {pageData.title || "Untitled"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong>{" "}
                <span
                  className={`font-medium ${
                    pageData.paymentStatus === "paid" ? "text-green-600" : pageData.paymentStatus === "failed" ? "text-red-600" : "text-yellow-600"
                  }`}
                >
                  {pageData.paymentStatus || "Unpaid"}
                </span>
              </p>
            </div>

            {pageData.paymentStatus !== "paid" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Payment Required</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This page requires a one-time payment of R$ 19,99 to be published and made publicly accessible.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="w-full">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
