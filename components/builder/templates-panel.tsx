"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { templateLibrary } from "@/lib/template-library"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface TemplatesPanelProps {
  onApplyTemplate: (template: any) => void
}

export function TemplatesPanel({ onApplyTemplate }: TemplatesPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {templateLibrary.map((template) => (
          <motion.div key={template.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={template.thumbnail || "/placeholder.svg?height=200&width=300&query=template preview"}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm mb-1">{template.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.category || "General"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <Button size="sm" className="w-full" onClick={() => onApplyTemplate(template)}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
