"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { QrCode, Download, Share2, Copy, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { generatePageQRCode, getPageQRCode, type PageQRCode } from "@/lib/firebase/firestore-service";
import { formatDate } from "@/lib/utils/date-formatter";
import { PaymentRecovery } from "@/components/payment/payment-recovery";

interface PageQRCodeProps {
  userId: string;
  pageId: string;
  pageTitle: string;
  isPublished: boolean;
  paymentStatus?: string;
  className?: string;
}

export function PageQRCodeComponent({ userId, pageId, pageTitle, isPublished, paymentStatus, className }: PageQRCodeProps) {
  const [qrCode, setQrCode] = useState<PageQRCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load existing QR code on mount
  useEffect(() => {
    if (isPublished) {
      loadQRCode();
    }
  }, [isPublished, pageId, userId]);

  const loadQRCode = async () => {
    setIsLoading(true);
    try {
      const existingQR = await getPageQRCode(userId, pageId);
      setQrCode(existingQR);
    } catch (error) {
      console.error("Error loading QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      const newQR = await generatePageQRCode(userId, pageId);
      setQrCode(newQR);
      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready to share.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);

      // Show more helpful error for payment issues
      const errorMessage = error instanceof Error ? error.message : "Failed to generate QR code";
      const isPaymentError = errorMessage.includes("not found") || errorMessage.includes("not published");

      toast({
        variant: "destructive",
        title: "Error",
        description: isPaymentError ? "Page not found or not published. If you just paid, try the payment verification button below." : errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(qrCode.pageUrl);
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

  const handleDownloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode.qrCodeUrl;
    link.download = `qr-code-${pageTitle.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded!",
      description: "QR code image saved to your device.",
    });
  };

  const handleShare = async () => {
    if (!qrCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: `Check out my page: ${pageTitle}`,
          url: qrCode.pageUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log("Share cancelled or failed:", error);
      }
    } else {
      // Fallback to copying URL
      handleCopyUrl();
    }
  };

  if (!isPublished) {
    return (
      <div className="space-y-4">
        {/* Payment Recovery Component */}
        <PaymentRecovery
          userId={userId}
          pageId={pageId}
          pageStatus={{
            published: isPublished,
            paymentStatus,
          }}
          onRecoverySuccess={() => {
            // Refresh the page or trigger a re-render
            window.location.reload();
          }}
        />

        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>Publish your page to generate a QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your page needs to be published before you can generate a QR code.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code
          {qrCode && <Badge variant="secondary">Generated</Badge>}
        </CardTitle>
        <CardDescription>Share your page with a QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading QR code...</p>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            {/* QR Code Preview */}
            <div className="text-center">
              <img
                src={qrCode.qrCodeUrl}
                alt="QR Code"
                className="mx-auto border rounded-lg shadow-sm bg-white p-2"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            </div>

            {/* Page URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Page URL:</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono truncate">{qrCode.pageUrl}</code>
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    View Full Size
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code for "{pageTitle}"</DialogTitle>
                    <DialogDescription>Scan this QR code to visit your page</DialogDescription>
                  </DialogHeader>
                  <div className="text-center space-y-4">
                    <img
                      src={qrCode.qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto border rounded-lg shadow-sm bg-white p-4"
                      style={{ maxWidth: "300px", height: "auto" }}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleDownloadQR} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={handleShare} size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" onClick={() => window.open(qrCode.pageUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Page
              </Button>
            </div>

            {/* Regenerate Button */}
            <div className="pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={handleGenerateQR} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-muted-foreground mb-4">No QR code generated yet.</p>
              <Button onClick={handleGenerateQR} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {qrCode && <div className="text-xs text-muted-foreground text-center pt-2 border-t">Generated on {formatDate(qrCode.createdAt)}</div>}
      </CardContent>
    </Card>
  );
}
