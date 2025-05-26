"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Loader2 } from "lucide-react";

interface QuickFixButtonProps {
  userId: string;
  pageId: string;
  pageTitle: string;
  onSuccess?: () => void;
}

export function QuickFixButton({ userId, pageId, pageTitle, onSuccess }: QuickFixButtonProps) {
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const handleQuickFix = async () => {
    setIsFixing(true);
    try {
      const response = await fetch("/api/debug/force-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pageId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Fixed!",
          description: `"${pageTitle}" payment status has been corrected. Please refresh the page.`,
          duration: 5000,
        });
        onSuccess?.();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fix page status",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button onClick={handleQuickFix} disabled={isFixing} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
      {isFixing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
      Quick Fix
    </Button>
  );
}
