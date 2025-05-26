"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { componentLibrary } from "@/lib/component-library"

interface ComponentPanelProps {
  onAddComponent: (component: any) => void
}

export function ComponentPanel({ onAddComponent }: ComponentPanelProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredComponents = componentLibrary.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = Array.from(new Set(filteredComponents.map((c) => c.category)))

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm uppercase tracking-wide text-foreground">{category}</h4>
              <Badge variant="secondary" className="text-xs">
                {filteredComponents.filter((c) => c.category === category).length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filteredComponents
                .filter((c) => c.category === category)
                .map((component) => (
                  <motion.div
                    key={component.id}
                    className="group relative border rounded-lg p-4 bg-card hover:bg-accent cursor-pointer transition-all duration-200 hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddComponent(component)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        {component.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">{component.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {component.description || `Add a ${component.name.toLowerCase()} to your page`}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
