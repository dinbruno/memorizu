"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { templateLibrary } from "@/lib/template-library";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TemplatesPanelProps {
  onApplyTemplate: (template: any) => void;
}

export function TemplatesPanel({ onApplyTemplate }: TemplatesPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {templateLibrary.map((template) => (
          <motion.div key={template.id} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
            <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group border-border/40">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={template.thumbnail || "/placeholder.svg?height=200&width=300&query=template preview"}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-bold text-xs mb-1 leading-tight">{template.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-white/20 backdrop-blur-sm text-white border-white/30">
                      {"category" in template ? (template.category as string) : "General"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">{template.description}</p>
                <Button size="sm" className="w-full h-7 text-xs" onClick={() => onApplyTemplate(template)}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
