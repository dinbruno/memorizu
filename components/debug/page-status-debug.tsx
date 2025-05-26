"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface PageStatusDebugProps {
  userId: string;
  pageId: string;
  pageTitle: string;
}

export function PageStatusDebug({ userId, pageId, pageTitle }: PageStatusDebugProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isForcePublishing, setIsForcePublishing] = useState(false);
  const [pageStatus, setPageStatus] = useState<any>(null);
  const { toast } = useToast();

  const checkPageStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/debug/page-status?userId=${userId}&pageId=${pageId}`);
      const data = await response.json();

      if (response.ok) {
        setPageStatus(data);
        toast({
          title: "Status checked",
          description: "Page status retrieved successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check page status",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const forcePublish = async () => {
    setIsForcePublishing(true);
    try {
      const response = await fetch("/api/debug/force-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pageId }),
      });

      const data = await response.json();

      if (response.ok) {
        setPageStatus(null); // Clear status to force refresh
        toast({
          title: "Success",
          description: "Page has been force published! Please refresh the dashboard.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to force publish",
      });
    } finally {
      setIsForcePublishing(false);
    }
  };

  const getStatusBadge = (status: string, published: boolean) => {
    if (published && status === "paid") {
      return <Badge className="bg-green-500">Published & Paid</Badge>;
    }
    if (published && status !== "paid") {
      return (
        <Badge variant="secondary" className="bg-orange-500 text-white">
          Published (Payment Issue)
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          Payment Pending
        </Badge>
      );
    }
    if (status === "failed") {
      return <Badge variant="destructive">Payment Failed</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Debug: {pageTitle}
        </CardTitle>
        <CardDescription className="text-xs">Debug tools for payment/publication issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={checkPageStatus} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Check Status
          </Button>

          <Button variant="secondary" size="sm" onClick={forcePublish} disabled={isForcePublishing}>
            {isForcePublishing ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
            Force Publish
          </Button>
        </div>

        {pageStatus && (
          <div className="text-xs space-y-2 p-3 bg-muted rounded">
            <div className="flex justify-between">
              <span>Status:</span>
              {getStatusBadge(pageStatus.paymentStatus, pageStatus.published)}
            </div>
            <div className="flex justify-between">
              <span>Published:</span>
              <span>{pageStatus.published ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span>{pageStatus.paymentStatus || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Intent:</span>
              <span className="font-mono text-xs">{pageStatus.paymentIntentId || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span>Published URL:</span>
              <span className="font-mono text-xs">{pageStatus.publishedUrl || "None"}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
