"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageGallery } from "../image-gallery";

interface HeroComponentProps {
  data: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    buttonText: string;
    buttonUrl: string;
    overlay: boolean;
    height: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    borderRadius: number;
    textAlign: "left" | "center" | "right";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function HeroComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: HeroComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const handleTitleEdit = () => {
    if (titleRef.current && onUpdate) {
      onUpdate({ ...data, title: titleRef.current.textContent || "" });
    }
  };

  const handleSubtitleEdit = () => {
    if (subtitleRef.current && onUpdate) {
      onUpdate({ ...data, subtitle: subtitleRef.current.textContent || "" });
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    const updatedData = { ...localData, backgroundImage: imageUrl };
    setLocalData(updatedData);
    if (onUpdate) {
      onUpdate({ ...data, backgroundImage: imageUrl });
    }
    setIsGalleryOpen(false);
  };

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={localData.title} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Digite o título principal" />
        </div>

        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Input value={localData.subtitle} onChange={(e) => handleSettingsChange("subtitle", e.target.value)} placeholder="Digite um subtítulo" />
        </div>

        <div className="space-y-2">
          <Label>Configurações Rápidas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSettingsChange("height", 80);
                handleSettingsChange("borderRadius", 0);
                handleSettingsChange("marginTop", 0);
                handleSettingsChange("marginBottom", 0);
                handleSettingsChange("paddingTop", 40);
                handleSettingsChange("paddingBottom", 40);
              }}
            >
              📐 Padrão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSettingsChange("height", 60);
                handleSettingsChange("borderRadius", 20);
                handleSettingsChange("marginTop", 20);
                handleSettingsChange("marginBottom", 20);
                handleSettingsChange("paddingTop", 30);
                handleSettingsChange("paddingBottom", 30);
              }}
            >
              🎨 Moderno
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSettingsChange("height", 100);
                handleSettingsChange("borderRadius", 0);
                handleSettingsChange("marginTop", 0);
                handleSettingsChange("marginBottom", 0);
                handleSettingsChange("paddingTop", 60);
                handleSettingsChange("paddingBottom", 60);
              }}
            >
              🖼️ Tela Cheia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSettingsChange("height", 40);
                handleSettingsChange("borderRadius", 15);
                handleSettingsChange("marginTop", 10);
                handleSettingsChange("marginBottom", 10);
                handleSettingsChange("paddingTop", 20);
                handleSettingsChange("paddingBottom", 20);
              }}
            >
              📱 Compacto
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagem de Fundo</Label>
          <div className="space-y-2">
            {localData.backgroundImage && (
              <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                <img src={localData.backgroundImage || "/placeholder.svg"} alt="Pré-visualização da imagem" className="w-full h-full object-cover" />
              </div>
            )}
            <Button variant="outline" onClick={() => setIsGalleryOpen(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {localData.backgroundImage ? "Trocar Imagem" : "Escolher Imagem da Galeria"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto do Botão</Label>
            <Input value={localData.buttonText} onChange={(e) => handleSettingsChange("buttonText", e.target.value)} placeholder="Ex: Saiba Mais" />
          </div>

          <div className="space-y-2">
            <Label>Link do Botão</Label>
            <Input value={localData.buttonUrl} onChange={(e) => handleSettingsChange("buttonUrl", e.target.value)} placeholder="Ex: #contato" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="overlay" checked={localData.overlay} onCheckedChange={(checked) => handleSettingsChange("overlay", checked)} />
          <Label htmlFor="overlay">Escurecer fundo da imagem</Label>
        </div>

        <div className="space-y-2">
          <Label>Alinhamento do Texto</Label>
          <Select value={localData.textAlign} onValueChange={(value) => handleSettingsChange("textAlign", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o alinhamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Altura da Seção</Label>
          <div className="space-y-2">
            <Slider
              value={[localData.height]}
              onValueChange={(value) => handleSettingsChange("height", value[0])}
              max={100}
              min={20}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Baixa (20%)</span>
              <span className="font-medium">{localData.height}%</span>
              <span>Alta (100%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Cantos Arredondados</Label>
          <div className="space-y-2">
            <Slider
              value={[localData.borderRadius]}
              onValueChange={(value) => handleSettingsChange("borderRadius", value[0])}
              max={50}
              min={0}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reto</span>
              <span className="font-medium">{localData.borderRadius}px</span>
              <span>Muito Arredondado</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Espaçamento Externo</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">↑ Superior</Label>
              <Slider
                value={[localData.marginTop]}
                onValueChange={(value) => handleSettingsChange("marginTop", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.marginTop}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">↓ Inferior</Label>
              <Slider
                value={[localData.marginBottom]}
                onValueChange={(value) => handleSettingsChange("marginBottom", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.marginBottom}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">← Esquerda</Label>
              <Slider
                value={[localData.marginLeft]}
                onValueChange={(value) => handleSettingsChange("marginLeft", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.marginLeft}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">→ Direita</Label>
              <Slider
                value={[localData.marginRight]}
                onValueChange={(value) => handleSettingsChange("marginRight", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.marginRight}px</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Espaçamento Interno</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">↑ Superior</Label>
              <Slider
                value={[localData.paddingTop]}
                onValueChange={(value) => handleSettingsChange("paddingTop", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.paddingTop}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">↓ Inferior</Label>
              <Slider
                value={[localData.paddingBottom]}
                onValueChange={(value) => handleSettingsChange("paddingBottom", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.paddingBottom}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">← Esquerda</Label>
              <Slider
                value={[localData.paddingLeft]}
                onValueChange={(value) => handleSettingsChange("paddingLeft", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.paddingLeft}px</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">→ Direita</Label>
              <Slider
                value={[localData.paddingRight]}
                onValueChange={(value) => handleSettingsChange("paddingRight", value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{localData.paddingRight}px</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Aplicar Alterações
        </Button>

        <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isEditable && !isInlineEdit && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Hero settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Imagem de Fundo</Label>
                <div className="space-y-2">
                  {localData.backgroundImage && (
                    <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                      <img
                        src={localData.backgroundImage || "/placeholder.svg"}
                        alt="Pré-visualização da imagem"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setIsGalleryOpen(true)} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {localData.backgroundImage ? "Trocar Imagem" : "Escolher Imagem da Galeria"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do Botão</Label>
                <Input
                  id="buttonText"
                  value={localData.buttonText}
                  onChange={(e) => handleSettingsChange("buttonText", e.target.value)}
                  placeholder="Ex: Saiba Mais"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonUrl">Link do Botão</Label>
                <Input
                  id="buttonUrl"
                  value={localData.buttonUrl}
                  onChange={(e) => handleSettingsChange("buttonUrl", e.target.value)}
                  placeholder="Ex: #contato"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="overlay" checked={localData.overlay} onCheckedChange={(checked) => handleSettingsChange("overlay", checked)} />
                <Label htmlFor="overlay">Escurecer fundo da imagem</Label>
              </div>

              <div className="space-y-2">
                <Label>Alinhamento do Texto</Label>
                <Select value={localData.textAlign} onValueChange={(value) => handleSettingsChange("textAlign", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o alinhamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Altura da Seção</Label>
                <Slider
                  value={[localData.height]}
                  onValueChange={(value) => handleSettingsChange("height", value[0])}
                  max={100}
                  min={20}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Baixa</span>
                  <span className="font-medium">{localData.height}%</span>
                  <span>Alta</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Cantos Arredondados</Label>
                <Slider
                  value={[localData.borderRadius]}
                  onValueChange={(value) => handleSettingsChange("borderRadius", value[0])}
                  max={50}
                  min={0}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reto</span>
                  <span className="font-medium">{localData.borderRadius}px</span>
                  <span>Arredondado</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Espaçamento Externo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">↑ {localData.marginTop}px</Label>
                    <Slider
                      value={[localData.marginTop]}
                      onValueChange={(value) => handleSettingsChange("marginTop", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">↓ {localData.marginBottom}px</Label>
                    <Slider
                      value={[localData.marginBottom]}
                      onValueChange={(value) => handleSettingsChange("marginBottom", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">← {localData.marginLeft}px</Label>
                    <Slider
                      value={[localData.marginLeft]}
                      onValueChange={(value) => handleSettingsChange("marginLeft", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">→ {localData.marginRight}px</Label>
                    <Slider
                      value={[localData.marginRight]}
                      onValueChange={(value) => handleSettingsChange("marginRight", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Espaçamento Interno</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">↑ {localData.paddingTop}px</Label>
                    <Slider
                      value={[localData.paddingTop]}
                      onValueChange={(value) => handleSettingsChange("paddingTop", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">↓ {localData.paddingBottom}px</Label>
                    <Slider
                      value={[localData.paddingBottom]}
                      onValueChange={(value) => handleSettingsChange("paddingBottom", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">← {localData.paddingLeft}px</Label>
                    <Slider
                      value={[localData.paddingLeft]}
                      onValueChange={(value) => handleSettingsChange("paddingLeft", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">→ {localData.paddingRight}px</Label>
                    <Slider
                      value={[localData.paddingRight]}
                      onValueChange={(value) => handleSettingsChange("paddingRight", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div
        className="relative flex items-center justify-center bg-cover bg-center w-full"
        style={{
          backgroundImage: `url(${data.backgroundImage})`,
          height: `${data.height || 60}vh`,
          marginTop: `${data.marginTop || 0}px`,
          marginBottom: `${data.marginBottom || 0}px`,
          marginLeft: `${data.marginLeft || 0}px`,
          marginRight: `${data.marginRight || 0}px`,
          paddingTop: `${data.paddingTop || 0}px`,
          paddingBottom: `${data.paddingBottom || 0}px`,
          paddingLeft: `${data.paddingLeft || 0}px`,
          paddingRight: `${data.paddingRight || 0}px`,
          borderRadius: `${data.borderRadius || 0}px`,
        }}
      >
        {data.overlay && <div className="absolute inset-0 bg-black/50" style={{ borderRadius: `${data.borderRadius || 0}px` }} />}
        <div
          className="relative z-10 px-4 py-16 max-w-3xl mx-auto"
          style={{
            textAlign: data.textAlign || "center",
          }}
        >
          <h2
            ref={titleRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleTitleEdit}
            className={cn(
              "text-4xl md:text-5xl font-bold text-white mb-4",
              isEditable ? "outline-none focus:outline-none hover:bg-black/20 transition-colors" : ""
            )}
          >
            {data.title}
          </h2>
          <p
            ref={subtitleRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleSubtitleEdit}
            className={cn("text-xl text-white/90 mb-8", isEditable ? "outline-none focus:outline-none hover:bg-black/20 transition-colors" : "")}
          >
            {data.subtitle}
          </p>
          {data.buttonText && (
            <div className={cn("flex", data.textAlign === "left" ? "justify-start" : data.textAlign === "right" ? "justify-end" : "justify-center")}>
              <Button size="lg" asChild>
                <a href={data.buttonUrl}>{data.buttonText}</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
    </div>
  );
}
