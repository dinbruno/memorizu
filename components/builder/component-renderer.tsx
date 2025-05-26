"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextComponent } from "./components/text-component";
import { ImageComponent } from "./components/image-component";
import { ButtonComponent } from "./components/button-component";
import { HeaderComponent } from "./components/header-component";
import { HeroComponent } from "./components/hero-component";
import { GalleryComponent } from "./components/gallery-component";
import { QuoteComponent } from "./components/quote-component";
import { CountdownComponent } from "./components/countdown-component";
import { TimelineComponent } from "./components/timeline-component";
import { MessageComponent } from "./components/message-component";
import { FooterComponent } from "./components/footer-component";
import { FallingHeartsComponent } from "./components/falling-hearts-component";
import { FloatingBubblesComponent } from "./components/floating-bubbles-component";
import { SparkleEffectComponent } from "./components/sparkle-effect-component";
import { ConfettiComponent } from "./components/confetti-component";
import { VideoComponent } from "./components/video-component";
import { MusicComponent } from "./components/music-component";

interface ComponentRendererProps {
  component: any;
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isPreview?: boolean;
  isInlineEdit?: boolean;
}

export function ComponentRenderer({ component, onUpdate, isEditable = false, isPreview = false, isInlineEdit = false }: ComponentRendererProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderComponent = () => {
    const props = {
      data: component.data || {},
      onUpdate: (updates: any) => {
        console.log("ComponentRenderer onUpdate called:", { componentId: component.id, updates });
        if (onUpdate) {
          onUpdate(updates);
        }
      },
      isEditable: isEditable || isInlineEdit,
      isInlineEdit,
    };

    switch (component.type) {
      case "text":
        return <TextComponent {...props} />;
      case "image":
        return <ImageComponent {...props} />;
      case "button":
        return <ButtonComponent {...props} />;
      case "header":
        return <HeaderComponent {...props} />;
      case "hero":
        return <HeroComponent {...props} />;
      case "gallery":
        return <GalleryComponent {...props} />;
      case "quote":
        return <QuoteComponent {...props} />;
      case "countdown":
        return <CountdownComponent {...props} />;
      case "timeline":
        return <TimelineComponent {...props} />;
      case "message":
        return <MessageComponent {...props} />;
      case "footer":
        return <FooterComponent {...props} />;
      case "falling-hearts":
        return <FallingHeartsComponent {...props} />;
      case "floating-bubbles":
        return <FloatingBubblesComponent {...props} />;
      case "sparkle-effect":
        return <SparkleEffectComponent {...props} />;
      case "confetti":
        return <ConfettiComponent {...props} />;
      case "video":
        return <VideoComponent {...props} />;
      case "music":
        return <MusicComponent {...props} />;
      default:
        return <div>Unknown component type: {component.type}</div>;
    }
  };

  if (isPreview || isInlineEdit) {
    return renderComponent();
  }

  return (
    <motion.div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} transition={{ duration: 0.2 }}>
      {renderComponent()}
    </motion.div>
  );
}
