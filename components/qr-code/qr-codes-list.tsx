"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { QrCode, Download, Share2, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { getAllUserQRCodes, getPageById, type PageQRCode } from "@/lib/firebase/firestore-service";
import { formatDate } from "@/lib/utils/date-formatter";

interface QRCodesListProps {
  userId: string;
  className?: string;
}

interface QRCodeWithPageInfo extends PageQRCode {
  pageTitle?: string;
}

export function QRCodesList({ userId, className }: QRCodesListProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeWithPageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQRCodes();
  }, [userId]);

  const loadQRCodes = async () => {
    setIsLoading(true);
    try {
      const userQRCodes = await getAllUserQRCodes(userId);

      // Enrich QR codes with page information
      const enrichedQRCodes = await Promise.all(
        userQRCodes.map(async (qr) => {
          try {
            const page = await getPageById(userId, qr.pageId);
            return {
              ...qr,
              pageTitle: (page as any)?.title || "Untitled Page",
            };
          } catch (error) {
            console.error(`Error loading page ${qr.pageId}:`, error);
            return {
              ...qr,
              pageTitle: "Unknown Page",
            };
          }
        })
      );

      setQrCodes(enrichedQRCodes);
    } catch (error) {
      console.error("Error loading QR codes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load QR codes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async (pageUrl: string) => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast({
        title: "URL Copied!",
        description: "Page URL copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL to clipboard.",
      });
    }
  };

  const handleDownloadQR = (qrCode: QRCodeWithPageInfo) => {
    const link = document.createElement("a");
    link.href = qrCode.qrCodeUrl;
    link.download = `qr-code-${qrCode.pageTitle?.replace(/[^a-zA-Z0-9]/g, "-") || qrCode.pageId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded!",
      description: "QR code image saved to your device.",
    });
  };

  const handleShare = async (qrCode: QRCodeWithPageInfo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: qrCode.pageTitle || "My Page",
          text: `Check out my page: ${qrCode.pageTitle}`,
          url: qrCode.pageUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log("Share cancelled or failed:", error);
      }
    } else {
      // Fallback to copying URL
      handleCopyUrl(qrCode.pageUrl);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            My QR Codes
          </CardTitle>
          <CardDescription>All QR codes for your published pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading QR codes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            My QR Codes
          </CardTitle>
          <CardDescription>All QR codes for your published pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No QR codes generated yet.</p>
            <p className="text-sm">Publish a page and generate a QR code to see it here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          My QR Codes
          <Badge variant="secondary">{qrCodes.length}</Badge>
        </CardTitle>
        <CardDescription>All QR codes for your published pages</CardDescription>
        <Button variant="outline" size="sm" onClick={loadQRCodes} className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-base truncate">{qrCode.pageTitle}</CardTitle>
                <CardDescription className="text-xs">Created {formatDate(qrCode.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* QR Code Image */}
                <div className="text-center">
                  <img
                    src={qrCode.qrCodeUrl}
                    alt={`QR Code for ${qrCode.pageTitle}`}
                    className="mx-auto border rounded-lg shadow-sm bg-white p-2"
                    style={{ maxWidth: "120px", height: "auto" }}
                  />
                </div>

                {/* Page URL */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">URL:</label>
                  <div className="flex items-center gap-1">
                    <code className="flex-1 px-2 py-1 bg-muted rounded text-xs font-mono truncate">
                      {qrCode.pageUrl.replace("https://", "").replace("http://", "")}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyUrl(qrCode.pageUrl)} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadQR(qrCode)} className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare(qrCode)} className="flex-1">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(qrCode.pageUrl, "_blank")} className="px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
