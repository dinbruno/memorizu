"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";
import { getComponentLibrary } from "@/lib/component-library";

interface ComponentPanelProps {
  onAddComponent: (component: any) => void;
}

export function ComponentPanel({ onAddComponent }: ComponentPanelProps) {
  const { language } = useLanguage();
  const translations = useBuilderTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const componentLibrary = getComponentLibrary(language as "pt-BR" | "en");

  const filteredComponents = componentLibrary.filter(
    (component: any) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) || component.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(filteredComponents.map((c: any) => c.category)));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={translations.searchPlaceholder}
          className="pl-9 h-8 text-xs bg-muted/30 border-muted-foreground/20 focus:bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">{category}</h4>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-muted/50">
                {filteredComponents.filter((c) => c.category === category).length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {filteredComponents
                .filter((c: any) => c.category === category)
                .map((component: any) => (
                  <motion.div
                    key={component.id}
                    className="group relative border border-border/40 rounded-lg p-3 bg-card/50 hover:bg-accent/60 cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-primary/30"
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onAddComponent(component)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                        <div className="text-primary [&>svg]:w-3.5 [&>svg]:h-3.5">{component.icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs truncate text-foreground">{component.name}</h5>
                        <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                          {component.description || `Add a ${component.name.toLowerCase()} to your page`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <Plus className="h-3 w-3 text-primary group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
