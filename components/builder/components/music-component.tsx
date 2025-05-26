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
import { Settings2, Music, Play, Pause, Upload, Volume2, ExternalLink, AlertCircle, Code, Link, CheckCircle, Copy, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MusicGallery } from "@/components/builder/music-gallery";

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
    const audio = audioRef.current;
    if (!audio) return;

    const volumeValue = newVolume[0] / 100;
    audio.volume = volumeValue;
    setVolume(newVolume[0]);
    setIsMuted(volumeValue === 0);
  };

  const handleSeek = (newTime: number[]) => {
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

  const renderSpotifyPlayer = () => {
    const embedUrl = getSpotifyEmbedUrl();
    if (!embedUrl) return null;

    // Compact player for fixed minimized mode
    if (displayData.isFixed && displayData.isMinimized) {
      return (
        <motion.div
          className="w-64 bg-gradient-to-br from-background via-background to-muted/30 rounded-2xl shadow-2xl backdrop-blur-sm border border-border/30 overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <iframe
              src={embedUrl}
              width="100%"
              height="120"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-t-2xl"
              style={{
                borderRadius: "16px 16px 0 0",
                colorScheme: displayData.embedTheme === "auto" ? "auto" : displayData.embedTheme,
              }}
            />
            {/* Spotify badge */}
            <motion.div
              className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Spotify
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return (
      <Card className="overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
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
                borderRadius: "12px",
                colorScheme: displayData.embedTheme === "auto" ? "auto" : displayData.embedTheme,
              }}
            />

            <motion.div
              className="absolute top-4 left-4 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <Music className="h-3 w-3 mr-1" />
                Spotify {displayData.type === "spotify-embed" ? "Embed" : "URL"}
              </Badge>
            </motion.div>

            <motion.a
              href={displayData.spotifyUrl || extractSpotifyUrl(displayData.spotifyEmbedCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in Spotify
              </Button>
            </motion.a>
          </div>
        </CardContent>
      </Card>
    );
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

  // Main render logic
  return (
    <motion.div
      className={cn("group relative", getPositionClasses())}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn("flex w-full", alignmentClasses[displayData.align])}>
        <div className={cn("w-full relative", displayData.isFixed && displayData.isMinimized ? "w-64" : "max-w-2xl")}>
          {/* Settings Button - Always part of the main component */}
          {isEditable && (
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <motion.div
                  className={cn("absolute z-20", displayData.isFixed && displayData.isMinimized ? "top-1 right-1" : "top-4 right-4")}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      "rounded-full bg-background/90 backdrop-blur-sm shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-200",
                      displayData.isFixed && displayData.isMinimized ? "h-6 w-6" : "h-10 w-10"
                    )}
                  >
                    <Settings2 className={cn(displayData.isFixed && displayData.isMinimized ? "h-3 w-3" : "h-4 w-4")} />
                    <span className="sr-only">Music settings</span>
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-[480px] p-0" align="end">
                {renderSettingsPanel()}
              </PopoverContent>
            </Popover>
          )}

          {(displayData.type === "spotify-url" && displayData.spotifyUrl && isValidSpotifyUrl) ||
          (displayData.type === "spotify-embed" && displayData.spotifyEmbedCode && isValidSpotifyEmbed) ? (
            renderSpotifyPlayer()
          ) : displayData.type === "upload" && displayData.audioUrl ? (
            displayData.isFixed && displayData.isMinimized ? (
              <motion.div
                className="w-64 bg-gradient-to-br from-background via-background to-muted/30 rounded-2xl shadow-2xl backdrop-blur-sm border border-border/30 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 space-y-3">
                  {displayData.audioUrl && (
                    <audio ref={audioRef} src={displayData.audioUrl} loop={displayData.loop} autoPlay={displayData.autoplay} className="hidden" />
                  )}

                  {/* Header with play button and track info */}
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/60 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-200 shadow-lg"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary ml-0.5" />}
                      </Button>
                    </motion.div>

                    <div className="flex-1 min-w-0 space-y-1">
                      {displayData.title && <h4 className="text-sm font-semibold text-foreground truncate leading-tight">{displayData.title}</h4>}
                      {displayData.artist && <p className="text-xs text-muted-foreground truncate leading-tight">{displayData.artist}</p>}
                    </div>

                    {/* Audio visualization */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary/60 rounded-full"
                          animate={
                            isPlaying
                              ? {
                                  height: [4, 12, 8, 16, 6],
                                }
                              : {
                                  height: 4,
                                }
                          }
                          transition={{
                            duration: 1.2,
                            repeat: isPlaying ? Infinity : 0,
                            delay: i * 0.1,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {displayData.controls && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Slider
                          value={[duration ? (currentTime / duration) * 100 : 0]}
                          max={100}
                          step={0.1}
                          className="w-full h-2"
                          onValueChange={handleSeek}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span className="font-mono">{formatTime(currentTime)}</span>
                          <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Volume control */}
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <Slider value={[volume]} max={100} step={1} className="flex-1 h-1" onValueChange={handleVolumeChange} />
                        <span className="text-xs text-muted-foreground font-mono w-8 text-right">{Math.round(volume)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Audio file badge */}
                  <div className="flex justify-center">
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Audio File
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <Card className="overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6" style={{ backgroundColor: displayData.backgroundColor }}>
                  {displayData.audioUrl && (
                    <audio ref={audioRef} src={displayData.audioUrl} loop={displayData.loop} autoPlay={displayData.autoplay} className="hidden" />
                  )}

                  <div className="space-y-4">
                    {(displayData.title || displayData.artist) && (
                      <div className="text-center space-y-1">
                        {displayData.title && <h3 className="font-semibold text-lg text-foreground">{displayData.title}</h3>}
                        {displayData.artist && <p className="text-muted-foreground">{displayData.artist}</p>}
                      </div>
                    )}

                    {displayData.controls && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={togglePlayPause}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <Slider
                              value={[duration ? (currentTime / duration) * 100 : 0]}
                              max={100}
                              step={0.1}
                              className="flex-1"
                              onValueChange={handleSeek}
                            />
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Slider value={[volume]} max={100} step={1} className="flex-1" onValueChange={handleVolumeChange} />
                          <span className="text-xs text-muted-foreground w-8">{Math.round(volume)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 min-h-[200px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">Add Music</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {isEditable ? "Upload audio files, paste Spotify URLs, or use embed codes" : "No audio content provided"}
                  </p>
                </div>
                {isEditable && (
                  <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="mt-4">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Configure Music
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Music Gallery */}
      <MusicGallery isOpen={isMusicGalleryOpen} onClose={() => setIsMusicGalleryOpen(false)} onSelectTracks={handleTracksSelect} />
    </motion.div>
  );
}
