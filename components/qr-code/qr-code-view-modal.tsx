"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Share2, ExternalLink, QrCode, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { PageQRCode, generatePageQRCode } from "@/lib/firebase/firestore-service";
import { formatDate } from "@/lib/utils/date-formatter";
import Image from "next/image";

interface QRCodeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: PageQRCode | null;
  pageTitle?: string;
  pageUrl?: string;
  pageId?: string;
  userId?: string;
  onQRCodeGenerated?: (qrCode: PageQRCode) => void;
}

export function QRCodeViewModal({ open, onOpenChange, qrCode, pageTitle, pageUrl, pageId, userId, onQRCodeGenerated }: QRCodeViewModalProps) {
  const { language } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localQRCode, setLocalQRCode] = useState<PageQRCode | null>(qrCode);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalQRCode(qrCode);
      if (qrCode) {
        setImageLoaded(false);
      }
    }
  }, [open, qrCode]);

  const handleGenerateQRCode = async () => {
    if (!userId || !pageId) return;

    setIsGenerating(true);
    try {
      const newQRCode = await generatePageQRCode(userId, pageId);
      setLocalQRCode(newQRCode);
      onQRCodeGenerated?.(newQRCode);
      toast.success(language === "pt-BR" ? "QR Code gerado com sucesso!" : "QR Code generated successfully!");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error(language === "pt-BR" ? "Erro ao gerar QR Code. Tente novamente." : "Error generating QR Code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!localQRCode?.qrCodeUrl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(language === "pt-BR" ? "Não foi possível abrir janela de impressão" : "Could not open print window");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${language === "pt-BR" ? "QR Code -" : "QR Code -"} ${pageTitle || localQRCode.pageId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              margin: 0;
              background: white;
            }
            .qr-container {
              text-align: center;
              max-width: 400px;
            }
            .qr-image {
              width: 300px;
              height: 300px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              margin: 20px 0;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1f2937;
            }
            .url {
              font-size: 14px;
              color: #6b7280;
              word-break: break-all;
              margin-bottom: 20px;
            }
            .info {
              font-size: 12px;
              color: #9ca3af;
              margin-top: 20px;
            }
            @page {
              margin: 1in;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="title">${pageTitle || (language === "pt-BR" ? "Página" : "Page")}</div>
            <img src="${localQRCode.qrCodeUrl}" alt="QR Code" class="qr-image" />
            <div class="url">${pageUrl || localQRCode.pageUrl}</div>
            <div class="info">
              ${language === "pt-BR" ? "Escaneie este QR Code para acessar a página" : "Scan this QR Code to access the page"}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

    toast.success(language === "pt-BR" ? "Abrindo janela de impressão..." : "Opening print window...");
  };

  const handleDownload = async () => {
    if (!localQRCode?.qrCodeUrl) return;

    try {
      const response = await fetch(localQRCode.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-code-${localQRCode.pageId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success(language === "pt-BR" ? "QR Code baixado!" : "QR Code downloaded!");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error(language === "pt-BR" ? "Erro ao baixar QR Code" : "Error downloading QR Code");
    }
  };

  const handleShare = async () => {
    if (!localQRCode?.qrCodeUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `QR Code - ${pageTitle || localQRCode.pageId}`,
          text:
            language === "pt-BR"
              ? `Escaneie este QR Code para acessar: ${pageUrl || localQRCode.pageUrl}`
              : `Scan this QR Code to access: ${pageUrl || localQRCode.pageUrl}`,
          url: localQRCode.qrCodeUrl,
        });
      } else {
        // Fallback para copiar URL
        await navigator.clipboard.writeText(localQRCode.qrCodeUrl);
        toast.success(language === "pt-BR" ? "Link do QR Code copiado!" : "QR Code link copied!");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      // Fallback final
      try {
        await navigator.clipboard.writeText(localQRCode.qrCodeUrl);
        toast.success(language === "pt-BR" ? "Link do QR Code copiado!" : "QR Code link copied!");
      } catch (clipboardError) {
        toast.error(language === "pt-BR" ? "Erro ao compartilhar QR Code" : "Error sharing QR Code");
      }
    }
  };

  const handleOpenUrl = () => {
    if (pageUrl || localQRCode?.pageUrl) {
      window.open(pageUrl || localQRCode?.pageUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {language === "pt-BR" ? "Visualizar QR Code" : "View QR Code"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                {localQRCode ? (
                  <>
                    <div className="relative">
                      <Image
                        src={localQRCode.qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="border-2 border-gray-200 rounded-lg"
                        onLoadingComplete={() => setImageLoaded(true)}
                      />
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>

                    {pageTitle && (
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{pageTitle}</h3>
                      </div>
                    )}

                    <div className="text-center text-sm text-muted-foreground">
                      <p className="break-all">{pageUrl || localQRCode.pageUrl}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{language === "pt-BR" ? "QR Code não encontrado" : "QR Code not found"}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === "pt-BR"
                          ? "Esta página ainda não possui um QR Code. Clique no botão abaixo para gerar um."
                          : "This page doesn't have a QR Code yet. Click the button below to generate one."}
                      </p>
                      {pageTitle && <p className="text-sm font-medium">{pageTitle}</p>}
                      {pageUrl && <p className="text-xs text-muted-foreground break-all mt-1">{pageUrl}</p>}
                    </div>
                    <Button onClick={handleGenerateQRCode} disabled={isGenerating} className="w-full">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {language === "pt-BR" ? "Gerando..." : "Generating..."}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "pt-BR" ? "Gerar QR Code" : "Generate QR Code"}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Info - only show if QR code exists */}
          {localQRCode && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{language === "pt-BR" ? "Criado em:" : "Created:"}</span>
              <Badge variant="secondary">{formatDate(localQRCode.createdAt, language === "pt-BR" ? "pt-BR" : "en-US")}</Badge>
            </div>
          )}

          {localQRCode && (
            <>
              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  {language === "pt-BR" ? "Imprimir" : "Print"}
                </Button>

                <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {language === "pt-BR" ? "Baixar" : "Download"}
                </Button>

                <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  {language === "pt-BR" ? "Compartilhar" : "Share"}
                </Button>

                <Button onClick={handleOpenUrl} variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {language === "pt-BR" ? "Abrir Página" : "Open Page"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
