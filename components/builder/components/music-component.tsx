"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings2,
  Music,
  Play,
  Pause,
  Upload,
  Volume2,
  ExternalLink,
  AlertCircle,
  Code,
  Link,
  CheckCircle,
  Copy,
  Info,
  X,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MusicGallery } from "@/components/builder/music-gallery";
import { ColorPicker } from "@/components/ui/color-picker";

interface MusicTrack {
  id: string;
  type: "upload" | "spotify-url" | "spotify-embed";
  audioUrl: string;
  spotifyUrl: string;
  spotifyEmbedCode: string;
  title: string;
  artist: string;
  fileName?: string;
}

interface MusicComponentProps {
  data: {
    type: "upload" | "spotify-url" | "spotify-embed";
    audioUrl: string;
    spotifyUrl: string;
    spotifyEmbedCode: string;
    title: string;
    artist: string;
    autoplay: boolean;
    loop: boolean;
    controls: boolean;
    volume: number;
    align: "left" | "center" | "right";
    showArtwork: boolean;
    backgroundColor: string;
    isFixed: boolean;
    fixedPosition: "top-left" | "top-right" | "top-center";
    isMinimized: boolean;
    tracks: MusicTrack[];
    embedHeight: number;
    embedTheme: "light" | "dark" | "auto";
    showCoverArt: boolean;
    playerStyle: "modern" | "minimal" | "classic" | "glassmorphism";
    animatedBackground: boolean;
    glowEffects: boolean;
    size: "compact" | "medium" | "large";
    width: number;
    maxWidth: string;
    position: "static" | "sticky" | "fixed";
    margin: { top: number; bottom: number; left: number; right: number };
    padding: { top: number; bottom: number; left: number; right: number };
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function MusicComponent({ data, onUpdate, isEditable = false }: MusicComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicGalleryOpen, setIsMusicGalleryOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(data.volume * 100);
  const [isMuted, setIsMuted] = useState(false);
  const [isValidSpotifyUrl, setIsValidSpotifyUrl] = useState(false);
  const [isValidSpotifyEmbed, setIsValidSpotifyEmbed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [embedPreview, setEmbedPreview] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Update localData when data prop changes
  useEffect(() => {
    setLocalData({ ...data });
  }, [data]);

  // Use localData when editing to show immediate updates, otherwise use data
  const displayData = isEditable ? localData : data;

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [localData.audioUrl, data.audioUrl]);

  const currentTrack = displayData.tracks?.[currentTrackIndex] || {
    id: "default",
    type: displayData.type,
    audioUrl: displayData.audioUrl,
    spotifyUrl: displayData.spotifyUrl,
    spotifyEmbedCode: displayData.spotifyEmbedCode,
    title: displayData.title,
    artist: displayData.artist,
  };

  useEffect(() => {
    const validateSpotifyUrl = (url: string) => {
      const spotifyPattern = /^https:\/\/open\.spotify\.com\/(intl-[a-z]{2}\/)?(track|playlist|album)\/[a-zA-Z0-9]+/;
      return spotifyPattern.test(url);
    };

    const validateSpotifyEmbed = (embedCode: string) => {
      const iframePattern = /<iframe[^>]*src="https:\/\/open\.spotify\.com\/embed\/[^"]*"[^>]*><\/iframe>/;
      const srcPattern = /https:\/\/open\.spotify\.com\/embed\/(track|playlist|album)\/[a-zA-Z0-9]+/;
      return iframePattern.test(embedCode) || srcPattern.test(embedCode);
    };

    setIsValidSpotifyUrl(validateSpotifyUrl(localData.spotifyUrl || ""));
    setIsValidSpotifyEmbed(validateSpotifyEmbed(localData.spotifyEmbedCode || ""));

    // Generate embed preview
    if (localData.spotifyEmbedCode) {
      const srcMatch = localData.spotifyEmbedCode.match(/src="([^"]*)"/);
      if (srcMatch) {
        setEmbedPreview(srcMatch[1]);
      } else if (localData.spotifyEmbedCode.includes("open.spotify.com/embed")) {
        setEmbedPreview(localData.spotifyEmbedCode);
      }
    }
  }, [localData.spotifyUrl, localData.spotifyEmbedCode]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  // Audio control functions
  const togglePlayPause = () => {
    // Prevent audio playback in edit mode
    if (isEditable) {
      toast({
        title: "Preview Mode",
        description: "Audio playback is disabled in edit mode. View the page to test audio.",
      });
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Unable to play audio file",
        });
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    // Prevent volume changes in edit mode
    if (isEditable) return;

    const audio = audioRef.current;
    if (!audio) return;

    const volumeValue = newVolume[0] / 100;
    audio.volume = volumeValue;
    setVolume(newVolume[0]);
    setIsMuted(volumeValue === 0);
  };

  const handleSeek = (newTime: number[]) => {
    // Prevent seeking in edit mode
    if (isEditable) return;

    const audio = audioRef.current;
    if (!audio || !duration) return;

    const timeValue = (newTime[0] / 100) * duration;
    audio.currentTime = timeValue;
    setCurrentTime(timeValue);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
    toast({
      title: "Settings saved",
      description: "Your music settings have been updated successfully.",
    });
  };

  const handleTracksSelect = (tracks: any[]) => {
    if (tracks.length > 0) {
      const selectedTrack = tracks[0];

      // Create updated data
      let updatedData = { ...localData };
      updatedData.audioUrl = selectedTrack.audioUrl;
      updatedData.title = selectedTrack.title;
      updatedData.artist = selectedTrack.artist;

      if (selectedTrack.type === "spotify") {
        updatedData.spotifyUrl = selectedTrack.spotifyUrl;
        updatedData.type = "spotify-url";
      } else {
        updatedData.type = "upload";
      }

      // Update local state
      setLocalData(updatedData);

      // Apply changes immediately
      if (onUpdate) {
        onUpdate(updatedData);
      }
    }
    setIsMusicGalleryOpen(false);
    toast({
      title: "Track selected",
      description: "Music track has been added successfully.",
    });
  };

  const extractSpotifyUrl = (embedCode: string) => {
    const srcMatch = embedCode.match(/src="([^"]*)"/);
    if (srcMatch) {
      return srcMatch[1].replace("/embed/", "/");
    }
    return embedCode;
  };

  const generateEmbedFromUrl = (url: string) => {
    const embedUrl = url.replace("open.spotify.com/", "open.spotify.com/embed/");
    return `<iframe style="border-radius:12px" src="${embedUrl}?utm_source=generator" width="100%" height="${
      displayData.embedHeight || 352
    }" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  };

  const copyEmbedCode = () => {
    if (localData.spotifyEmbedCode) {
      navigator.clipboard.writeText(localData.spotifyEmbedCode);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard.",
      });
    }
  };

  const getSpotifyEmbedUrl = () => {
    if (displayData.type === "spotify-embed" && displayData.spotifyEmbedCode) {
      const srcMatch = displayData.spotifyEmbedCode.match(/src="([^"]*)"/);
      if (srcMatch) {
        return srcMatch[1];
      }
      if (displayData.spotifyEmbedCode.includes("open.spotify.com/embed")) {
        return displayData.spotifyEmbedCode;
      }
    } else if (displayData.type === "spotify-url" && displayData.spotifyUrl && isValidSpotifyUrl) {
      let url = displayData.spotifyUrl;

      // Remove any query parameters
      url = url.split("?")[0];

      // Handle international URLs (intl-xx) correctly
      if (url.includes("/intl-")) {
        // Convert: https://open.spotify.com/intl-pt/track/xyz -> https://open.spotify.com/embed/track/xyz
        url = url.replace(/\/intl-[a-z]{2}\//, "/embed/");
      } else {
        // Convert: https://open.spotify.com/track/xyz -> https://open.spotify.com/embed/track/xyz
        url = url.replace("open.spotify.com/", "open.spotify.com/embed/");
      }

      return url;
    }
    return "";
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const renderSettingsPanel = () => (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <Music className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Music Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your audio content</p>
        </div>
      </div>

      <Tabs value={localData.type} onValueChange={(value) => handleSettingsChange("type", value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="spotify-url" className="text-xs">
            <Link className="h-3 w-3 mr-1" />
            Spotify URL
          </TabsTrigger>
          <TabsTrigger value="spotify-embed" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Embed Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Audio File</Label>
            <div className="space-y-3">
              <Button variant="outline" onClick={() => setIsMusicGalleryOpen(true)} className="w-full">
                <Music className="h-4 w-4 mr-2" />
                Choose from Music Gallery
              </Button>
              {localData.audioUrl && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Audio Selected</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSettingsChange("audioUrl", "")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{localData.audioUrl}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="music-title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="music-title"
                value={localData.title}
                onChange={(e) => handleSettingsChange("title", e.target.value)}
                placeholder="Song title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="music-artist" className="text-sm font-medium">
                Artist
              </Label>
              <Input
                id="music-artist"
                value={localData.artist}
                onChange={(e) => handleSettingsChange("artist", e.target.value)}
                placeholder="Artist name"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spotify-url" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>Paste a Spotify track, album, or playlist URL. We'll automatically convert it to an embed player.</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="spotify-url" className="text-sm font-medium">
              Spotify URL
            </Label>
            <div className="relative">
              <Input
                id="spotify-url"
                value={localData.spotifyUrl}
                onChange={(e) => handleSettingsChange("spotifyUrl", e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className={cn(
                  "pr-10 transition-all duration-200",
                  isValidSpotifyUrl ? "border-green-500 focus:border-green-500" : localData.spotifyUrl ? "border-red-500 focus:border-red-500" : ""
                )}
              />
              {localData.spotifyUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidSpotifyUrl ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              )}
            </div>
            {localData.spotifyUrl && !isValidSpotifyUrl && <p className="text-xs text-red-500">Please enter a valid Spotify URL</p>}
            {isValidSpotifyUrl && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSettingsChange("spotifyEmbedCode", generateEmbedFromUrl(localData.spotifyUrl))}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Generate Embed
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(localData.spotifyUrl, "_blank")}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spotify-embed" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>Paste the complete Spotify embed code from Spotify's share menu, or just the embed URL.</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="spotify-embed" className="text-sm font-medium">
                Spotify Embed Code
              </Label>
              {localData.spotifyEmbedCode && (
                <Button variant="ghost" size="sm" onClick={copyEmbedCode}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
            <div className="relative">
              <Textarea
                id="spotify-embed"
                value={localData.spotifyEmbedCode}
                onChange={(e) => handleSettingsChange("spotifyEmbedCode", e.target.value)}
                placeholder='<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/..." width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
                className={cn(
                  "min-h-[120px] font-mono text-xs transition-all duration-200",
                  isValidSpotifyEmbed
                    ? "border-green-500 focus:border-green-500"
                    : localData.spotifyEmbedCode
                    ? "border-red-500 focus:border-red-500"
                    : ""
                )}
              />
              {localData.spotifyEmbedCode && (
                <div className="absolute top-3 right-3">
                  {isValidSpotifyEmbed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              )}
            </div>
            {localData.spotifyEmbedCode && !isValidSpotifyEmbed && (
              <p className="text-xs text-red-500">Please enter a valid Spotify embed code or URL</p>
            )}
            {isValidSpotifyEmbed && embedPreview && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Preview URL:</Label>
                <div className="p-2 bg-muted rounded text-xs font-mono break-all">{embedPreview}</div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">How to get Spotify embed code:</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open Spotify and find your track/playlist/album</li>
              <li>Click the "..." menu and select "Share"</li>
              <li>Choose "Embed track/playlist/album"</li>
              <li>Copy the entire iframe code and paste it above</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      {(localData.type === "spotify-url" || localData.type === "spotify-embed") && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">Spotify Player Options</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="embed-height" className="text-sm font-medium">
                Player Height
              </Label>
              <Select
                value={localData.embedHeight?.toString() || "352"}
                onValueChange={(value) => handleSettingsChange("embedHeight", Number.parseInt(value))}
              >
                <SelectTrigger id="embed-height">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="152">Compact (152px)</SelectItem>
                  <SelectItem value="232">Medium (232px)</SelectItem>
                  <SelectItem value="352">Standard (352px)</SelectItem>
                  <SelectItem value="452">Large (452px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-theme" className="text-sm font-medium">
                Theme
              </Label>
              <Select value={localData.embedTheme || "auto"} onValueChange={(value) => handleSettingsChange("embedTheme", value)}>
                <SelectTrigger id="embed-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Show Cover Art</Label>
                <p className="text-xs text-muted-foreground">Display album artwork in compact mode</p>
              </div>
              <Switch checked={localData.showCoverArt !== false} onCheckedChange={(checked) => handleSettingsChange("showCoverArt", checked)} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Visual Customization</h4>
        <div className="space-y-3">
          <ColorPicker
            label="Background Color"
            value={localData.backgroundColor || "#f8f9fa"}
            onChange={(color) => handleSettingsChange("backgroundColor", color)}
          />

          <div className="space-y-2">
            <Label htmlFor="player-style" className="text-sm font-medium">
              Player Style
            </Label>
            <Select value={localData.playerStyle || "modern"} onValueChange={(value) => handleSettingsChange("playerStyle", value)}>
              <SelectTrigger id="player-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="glassmorphism">Glassmorphism</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Show Artwork</Label>
              <p className="text-xs text-muted-foreground">Display album artwork when available</p>
            </div>
            <Switch checked={localData.showArtwork !== false} onCheckedChange={(checked) => handleSettingsChange("showArtwork", checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Animated Background</Label>
              <p className="text-xs text-muted-foreground">Add subtle background animations</p>
            </div>
            <Switch
              checked={localData.animatedBackground || false}
              onCheckedChange={(checked) => handleSettingsChange("animatedBackground", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Glow Effects</Label>
              <p className="text-xs text-muted-foreground">Add glow effects to buttons</p>
            </div>
            <Switch checked={localData.glowEffects || false} onCheckedChange={(checked) => handleSettingsChange("glowEffects", checked)} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Size & Layout</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm font-medium">
              Player Size
            </Label>
            <Select value={localData.size || "compact"} onValueChange={(value) => handleSettingsChange("size", value)}>
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium">
                Width (%)
              </Label>
              <Input
                id="width"
                type="number"
                min="20"
                max="100"
                value={localData.width || 100}
                onChange={(e) => handleSettingsChange("width", Number(e.target.value))}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-width" className="text-sm font-medium">
                Max Width
              </Label>
              <Select value={localData.maxWidth || "2xl"} onValueChange={(value) => handleSettingsChange("maxWidth", value)}>
                <SelectTrigger id="max-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small (24rem)</SelectItem>
                  <SelectItem value="md">Medium (28rem)</SelectItem>
                  <SelectItem value="lg">Large (32rem)</SelectItem>
                  <SelectItem value="xl">Extra Large (36rem)</SelectItem>
                  <SelectItem value="2xl">2X Large (42rem)</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alignment" className="text-sm font-medium">
              Alignment
            </Label>
            <Select value={localData.align} onValueChange={(value) => handleSettingsChange("align", value)}>
              <SelectTrigger id="alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Spacing</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Margin (px)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.margin?.top || 0}
                  onChange={(e) => handleSettingsChange("margin", { ...localData.margin, top: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.margin?.bottom || 0}
                  onChange={(e) => handleSettingsChange("margin", { ...localData.margin, bottom: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.margin?.left || 0}
                  onChange={(e) => handleSettingsChange("margin", { ...localData.margin, left: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.margin?.right || 0}
                  onChange={(e) => handleSettingsChange("margin", { ...localData.margin, right: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Padding (px)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.padding?.top || 0}
                  onChange={(e) => handleSettingsChange("padding", { ...localData.padding, top: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.padding?.bottom || 0}
                  onChange={(e) => handleSettingsChange("padding", { ...localData.padding, bottom: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.padding?.left || 0}
                  onChange={(e) => handleSettingsChange("padding", { ...localData.padding, left: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localData.padding?.right || 0}
                  onChange={(e) => handleSettingsChange("padding", { ...localData.padding, right: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Position Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Fixed Position</Label>
              <p className="text-xs text-muted-foreground">Make player stick to screen corner</p>
            </div>
            <Switch checked={localData.isFixed} onCheckedChange={(checked) => handleSettingsChange("isFixed", checked)} />
          </div>

          {localData.isFixed && (
            <div className="space-y-2">
              <Label htmlFor="fixed-position" className="text-sm font-medium">
                Corner Position
              </Label>
              <Select value={localData.fixedPosition} onValueChange={(value) => handleSettingsChange("fixedPosition", value)}>
                <SelectTrigger id="fixed-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Minimized</Label>
              <p className="text-xs text-muted-foreground">Show compact player when fixed</p>
            </div>
            <Switch
              checked={localData.isMinimized}
              onCheckedChange={(checked) => handleSettingsChange("isMinimized", checked)}
              disabled={!localData.isFixed}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">General Options</h4>
        <div className="space-y-3">
          {[
            { key: "controls", label: "Show Controls", description: "Display playback controls (upload only)" },
            { key: "autoplay", label: "Autoplay", description: "Start playing automatically" },
            { key: "loop", label: "Loop", description: "Repeat audio continuously (upload only)" },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                checked={localData[option.key as keyof typeof localData] as boolean}
                onCheckedChange={(checked) => handleSettingsChange(option.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSaveSettings} className="flex-1">
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderSpotifyPlayer = () => {
    const embedUrl = getSpotifyEmbedUrl();
    if (!embedUrl) return null;

    // Ultra compact player for fixed minimized mode
    if (displayData.isFixed && displayData.isMinimized) {
      return (
        <motion.div
          className="bg-gradient-to-r from-green-500/10 via-background/95 to-green-500/5 backdrop-blur-xl border border-green-500/20 rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center h-14 px-4 gap-3">
            {/* Spotify logo/indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background" />
              </div>
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground truncate leading-tight">Spotify Player</h4>
                <p className="text-xs text-muted-foreground truncate leading-tight">Now Playing</p>
              </div>
            </div>

            {/* Spotify branding */}
            <div className="flex items-center gap-1">
              <div className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Spotify</div>
            </div>

            {/* Hidden functional iframe */}
            <div className="w-0 h-0 overflow-hidden absolute">
              <iframe
                src={embedUrl}
                width="1"
                height="1"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{
                  colorScheme: displayData.embedTheme === "auto" ? "auto" : displayData.embedTheme,
                }}
              />
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <Card className="overflow-hidden border border-border/30 shadow-md hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative">
            <iframe
              src={embedUrl}
              width="100%"
              height={displayData.embedHeight || 352}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
              style={{
                borderRadius: "8px",
                colorScheme: displayData.embedTheme === "auto" ? "auto" : displayData.embedTheme,
              }}
            />

            <motion.div
              className="absolute top-3 left-3 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm text-xs">
                <Music className="h-3 w-3 mr-1" />
                Spotify
              </Badge>
            </motion.div>

            <motion.a
              href={displayData.spotifyUrl || extractSpotifyUrl(displayData.spotifyEmbedCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" variant="secondary" className="bg-background/95 backdrop-blur-sm text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Open
              </Button>
            </motion.a>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Position classes for fixed positioning
  const getPositionClasses = () => {
    if (!displayData.isFixed) return "relative";

    const baseClasses = "fixed z-50";
    switch (displayData.fixedPosition) {
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      case "top-right":
        return `${baseClasses} top-4 right-4`;
      case "top-center":
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Compact audio player for fixed position
  const renderCompactAudioPlayer = () => {
    return (
      <motion.div
        className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.02, y: -2 }}
      >
        <div className="flex items-center h-14 px-4 gap-3">
          {displayData.audioUrl && (
            <audio ref={audioRef} src={displayData.audioUrl} loop={displayData.loop} autoPlay={displayData.autoplay} className="hidden" />
          )}

          {/* Play/Pause button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary ml-0.5" />}
            </Button>
          </motion.div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium text-foreground truncate leading-tight">{displayData.title || "Music Player"}</h4>
              {displayData.artist && <p className="text-xs text-muted-foreground truncate leading-tight">{displayData.artist}</p>}
            </div>
          </div>

          {/* Mini progress indicator */}
          {duration > 0 && (
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/20" />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - currentTime / duration)}`}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Standard audio player
  const renderStandardAudioPlayer = () => {
    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    // Size variations
    const getSizeStyles = () => {
      switch (displayData.size) {
        case "compact":
          return {
            content: "p-4",
            iconSize: "h-4 w-4",
            titleSize: "text-lg",
            artistSize: "text-sm",
            buttonSize: "h-10 w-10",
            playButtonSize: "h-12 w-12",
            playIconSize: "h-5 w-5",
            spacing: "space-y-3",
          };
        case "large":
          return {
            content: "p-10",
            iconSize: "h-8 w-8",
            titleSize: "text-3xl",
            artistSize: "text-xl",
            buttonSize: "h-14 w-14",
            playButtonSize: "h-20 w-20",
            playIconSize: "h-8 w-8",
            spacing: "space-y-8",
          };
        default: // medium
          return {
            content: "p-8",
            iconSize: "h-6 w-6",
            titleSize: "text-2xl",
            artistSize: "text-lg",
            buttonSize: "h-12 w-12",
            playButtonSize: "h-16 w-16",
            playIconSize: "h-7 w-7",
            spacing: "space-y-6",
          };
      }
    };

    // Style variations based on playerStyle
    const getPlayerStyles = () => {
      switch (displayData.playerStyle) {
        case "minimal":
          return {
            card: "overflow-hidden border border-border/20 shadow-lg bg-background/95 backdrop-blur-sm",
            background: "opacity-5",
          };
        case "classic":
          return {
            card: "overflow-hidden border-2 border-border shadow-xl bg-card",
            background: "opacity-20",
          };
        case "glassmorphism":
          return {
            card: "overflow-hidden border border-white/20 shadow-2xl bg-white/10 backdrop-blur-xl",
            background: "opacity-30",
          };
        default: // modern
          return {
            card: "overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm",
            background: "opacity-10",
          };
      }
    };

    // Get max width class
    const getMaxWidthClass = () => {
      switch (displayData.maxWidth) {
        case "sm":
          return "max-w-sm";
        case "md":
          return "max-w-md";
        case "lg":
          return "max-w-lg";
        case "xl":
          return "max-w-xl";
        case "2xl":
          return "max-w-2xl";
        case "full":
          return "max-w-full";
        default:
          return "max-w-lg"; // compact default
      }
    };

    const styles = getPlayerStyles();
    const sizeStyles = getSizeStyles();

    // Apply spacing styles
    const spacingStyles = {
      marginTop: `${displayData.margin?.top || 0}px`,
      marginBottom: `${displayData.margin?.bottom || 0}px`,
      marginLeft: `${displayData.margin?.left || 0}px`,
      marginRight: `${displayData.margin?.right || 0}px`,
      paddingTop: `${displayData.padding?.top || 0}px`,
      paddingBottom: `${displayData.padding?.bottom || 0}px`,
      paddingLeft: `${displayData.padding?.left || 0}px`,
      paddingRight: `${displayData.padding?.right || 0}px`,
      width: `${displayData.width || 100}%`,
    };

    return (
      <Card className={cn(styles.card, displayData.animatedBackground && "animate-pulse")} style={spacingStyles}>
        <CardContent className={sizeStyles.content}>
          {displayData.audioUrl && !isEditable && (
            <audio ref={audioRef} src={displayData.audioUrl} loop={displayData.loop} autoPlay={displayData.autoplay} className="hidden" />
          )}

          {/* Background gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-primary via-primary/50 to-transparent",
              styles.background,
              displayData.animatedBackground && "animate-gradient-x"
            )}
            style={{ backgroundColor: displayData.backgroundColor }}
          />

          <div className={cn("relative", sizeStyles.spacing)}>
            {/* Header with music icon */}
            <div className="flex items-center justify-center mb-2">
              <div
                className={cn("p-3 rounded-full bg-primary/10 border border-primary/20", displayData.glowEffects && "shadow-lg shadow-primary/25")}
              >
                <Music className={sizeStyles.iconSize + " text-primary"} />
              </div>
            </div>

            {/* Track info */}
            <div className="text-center space-y-2">
              {displayData.title && (
                <motion.h3
                  className={cn("font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text", sizeStyles.titleSize)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {displayData.title}
                </motion.h3>
              )}
              {displayData.artist && (
                <motion.p
                  className={cn("text-muted-foreground font-medium", sizeStyles.artistSize)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {displayData.artist}
                </motion.p>
              )}
            </div>

            {displayData.controls && (
              <div className={sizeStyles.spacing}>
                {/* Progress bar with time */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full bg-gradient-to-r from-primary to-primary/80 rounded-full relative",
                          displayData.glowEffects && "shadow-lg shadow-primary/50"
                        )}
                        style={{ width: `${progressPercentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={cn(
                            "absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background",
                            displayData.glowEffects && "shadow-primary/50"
                          )}
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main controls */}
                <div className="flex items-center justify-center gap-6">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        sizeStyles.buttonSize + " rounded-full hover:bg-primary/10 transition-all duration-200",
                        displayData.glowEffects && "hover:shadow-lg hover:shadow-primary/25"
                      )}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                    <Button
                      variant="default"
                      size="icon"
                      className={cn(
                        sizeStyles.playButtonSize +
                          " rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl border-4 border-background relative overflow-hidden",
                        displayData.glowEffects && "shadow-2xl shadow-primary/50"
                      )}
                      onClick={togglePlayPause}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                      {isPlaying ? (
                        <Pause className={sizeStyles.playIconSize + " text-primary-foreground relative z-10"} />
                      ) : (
                        <Play className={sizeStyles.playIconSize + " text-primary-foreground ml-1 relative z-10"} />
                      )}
                    </Button>

                    {/* Pulse animation when playing */}
                    {isPlaying && (
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full border-4 border-primary/30 animate-ping",
                          displayData.glowEffects && "border-primary/50"
                        )}
                      />
                    )}
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        sizeStyles.buttonSize + " rounded-full hover:bg-primary/10 transition-all duration-200",
                        displayData.glowEffects && "hover:shadow-lg hover:shadow-primary/25"
                      )}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-4 px-4">
                  <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 relative">
                    <Slider value={[volume]} max={100} step={1} className="w-full" onValueChange={handleVolumeChange} />
                  </div>
                  <span className="text-sm text-muted-foreground font-mono w-12 text-right">{Math.round(volume)}%</span>
                </div>

                {/* Additional controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button variant="ghost" size="sm" className={cn("text-xs", displayData.loop ? "text-primary" : "text-muted-foreground")}>
                    Loop
                  </Button>
                  <div className="w-px h-4 bg-border" />
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Shuffle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Empty state
  const renderEmptyState = () => {
    return (
      <motion.div
        className="flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 min-h-[180px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Add Music</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isEditable ? "Upload audio files, paste Spotify URLs, or use embed codes" : "No audio content provided"}
            </p>
          </div>
          {isEditable && (
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="mt-3" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Configure Music
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  // Main render logic
  return (
    <>
      {/* Fixed version - only renders when isFixed is true AND not in edit mode */}
      {displayData.isFixed && !isEditable && (
        <div className={cn(getPositionClasses())}>
          {(displayData.type === "spotify-url" && displayData.spotifyUrl && isValidSpotifyUrl) ||
          (displayData.type === "spotify-embed" && displayData.spotifyEmbedCode && isValidSpotifyEmbed)
            ? renderSpotifyPlayer()
            : displayData.type === "upload" && displayData.audioUrl
            ? displayData.isMinimized
              ? renderCompactAudioPlayer()
              : renderStandardAudioPlayer()
            : renderEmptyState()}
        </div>
      )}

      {/* Normal version - renders when isFixed is false OR when in edit mode */}
      {(!displayData.isFixed || isEditable) && (
        <motion.div className={cn("group relative")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className={cn("flex w-full", alignmentClasses[displayData.align])}>
            <div
              className={cn(
                "w-full relative",
                displayData.maxWidth === "full"
                  ? "max-w-full"
                  : displayData.maxWidth === "2xl"
                  ? "max-w-2xl"
                  : displayData.maxWidth === "xl"
                  ? "max-w-xl"
                  : displayData.maxWidth === "lg"
                  ? "max-w-lg"
                  : displayData.maxWidth === "md"
                  ? "max-w-md"
                  : displayData.maxWidth === "sm"
                  ? "max-w-sm"
                  : "max-w-lg" // compact default
              )}
            >
              {/* Settings Button - only show when editable */}
              {isEditable && (
                <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <PopoverTrigger asChild>
                    <motion.div
                      className="absolute z-20 top-2 right-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm shadow-md border border-border/30 hover:border-primary/30 transition-all duration-200"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Music settings</span>
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[480px] p-0" align="end">
                    {renderSettingsPanel()}
                  </PopoverContent>
                </Popover>
              )}

              {/* Content */}
              {(displayData.type === "spotify-url" && displayData.spotifyUrl && isValidSpotifyUrl) ||
              (displayData.type === "spotify-embed" && displayData.spotifyEmbedCode && isValidSpotifyEmbed)
                ? renderSpotifyPlayer()
                : displayData.type === "upload" && displayData.audioUrl
                ? renderStandardAudioPlayer()
                : renderEmptyState()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Music Gallery */}
      <MusicGallery isOpen={isMusicGalleryOpen} onClose={() => setIsMusicGalleryOpen(false)} onSelectTracks={handleTracksSelect} />
    </>
  );
}
