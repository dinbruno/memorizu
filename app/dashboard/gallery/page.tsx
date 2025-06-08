"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Music,
  Upload,
  Trash2,
  Search,
  Grid3X3,
  List,
  Play,
  Pause,
  Download,
  Eye,
  Edit,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  FileImage,
  FileAudio,
  Heart,
  Share,
  MoreHorizontal,
  Folder,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserImages, deleteImage, getUserMusic, deleteMusic, type UploadedImage, type UploadedMusic } from "@/lib/firebase/storage-service";
import { useLanguage } from "@/components/language-provider";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
  type: "image" | "music";
  duration?: string | number;
  artist?: string;
  title?: string;
}

export default function GalleryPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [music, setMusic] = useState<UploadedMusic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedPreview, setSelectedPreview] = useState<MediaFile | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Load user's media files
  const loadMediaFiles = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [userImages, userMusic] = await Promise.all([getUserImages(user.uid), getUserMusic(user.uid)]);

      setImages(userImages);
      setMusic(userMusic);
    } catch (error) {
      console.error("Error loading media files:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: t("gallery.load.error"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadMediaFiles();
  }, [loadMediaFiles]);

  // Handle media deletion
  const handleDeleteMedia = async (id: string, type: "image" | "music") => {
    if (!user) return;

    try {
      if (type === "image") {
        await deleteImage(user.uid, id);
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        await deleteMusic(user.uid, id);
        setMusic((prev) => prev.filter((track) => track.id !== id));
      }

      toast({
        title: "Success",
        description: type === "image" ? t("gallery.delete.success.image") : t("gallery.delete.success.music"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t("gallery.delete.error"),
      });
    }
  };

  // Audio playback controls
  const toggleAudioPlayback = (track: UploadedMusic) => {
    if (playingId === track.id && currentAudio) {
      currentAudio.pause();
      setPlayingId(null);
      setCurrentAudio(null);
      return;
    }

    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(track.url);
    audio.play();
    audio.onended = () => {
      setPlayingId(null);
      setCurrentAudio(null);
    };

    setCurrentAudio(audio);
    setPlayingId(track.id);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return "0:00";

    // If it's already a formatted string, return it
    if (typeof duration === "string") {
      return duration;
    }

    // If it's a number, format it
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Combined and filtered media
  const allMedia: MediaFile[] = [
    ...images.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      size: img.size,
      uploadedAt: img.uploadedAt,
      type: "image" as const,
    })),
    ...music.map((track) => ({
      id: track.id,
      name: track.title || track.name,
      url: track.url,
      size: track.size,
      uploadedAt: track.uploadedAt,
      type: "music" as const,
      duration: track.duration,
      artist: track.artist,
      title: track.title,
    })),
  ];

  // Filter and sort media
  const filteredAndSortedMedia = allMedia
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const stats = {
    totalImages: images.length,
    totalMusic: music.length,
    totalSize: allMedia.reduce((acc, item) => acc + item.size, 0),
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("gallery.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("gallery.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("gallery.back")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("gallery.stats.images")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalImages}</div>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("gallery.stats.music")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalMusic}</div>
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("gallery.stats.totalFiles")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{allMedia.length}</div>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("gallery.stats.storageUsed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder={t("gallery.search.placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <Select value={sortBy} onValueChange={(value: "name" | "date" | "size") => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t("gallery.sort.name")}</SelectItem>
            <SelectItem value="date">{t("gallery.sort.date")}</SelectItem>
            <SelectItem value="size">{t("gallery.sort.size")}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
          <Grid3X3 className="h-4 w-4" />
        </Button>

        <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Media Gallery */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            {t("gallery.tabs.all")} ({allMedia.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            {t("gallery.tabs.images")} ({images.length})
          </TabsTrigger>
          <TabsTrigger value="music">
            {t("gallery.tabs.music")} ({music.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAndSortedMedia.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("gallery.empty.title")}</h3>
                <p className="text-muted-foreground text-center max-w-sm">{searchTerm ? t("gallery.empty.search") : t("gallery.empty.upload")}</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {filteredAndSortedMedia.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="aspect-square relative bg-muted">
                        {item.type === "image" ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" onClick={() => setSelectedPreview(item)} />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800"
                            onClick={() => setSelectedPreview(item)}
                          >
                            <Music className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}

                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            {item.type === "music" && (
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAudioPlayback(music.find((m) => m.id === item.id)!);
                                }}
                              >
                                {playingId === item.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPreview(item);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="secondary" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                                  <Download className="h-4 w-4 mr-2" />
                                  {t("gallery.actions.download")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteMedia(item.id, item.type)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("gallery.actions.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* File type badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.type === "image" ? <FileImage className="h-3 w-3 mr-1" /> : <FileAudio className="h-3 w-3 mr-1" />}
                            {item.type === "image" ? t("gallery.badge.image") : t("gallery.badge.music")}
                          </Badge>
                        </div>

                        {/* Playing indicator */}
                        {item.type === "music" && playingId === item.id && (
                          <div className="absolute bottom-2 right-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            </div>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{formatFileSize(item.size)}</span>
                          {item.duration && <span>{formatDuration(item.duration)}</span>}
                        </div>
                        {item.artist && (
                          <p className="text-xs text-muted-foreground truncate mt-1" title={item.artist}>
                            {item.artist}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <AnimatePresence>
                    {filteredAndSortedMedia.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer group"
                        onClick={() => setSelectedPreview(item)}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.type === "image" ? (
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                              <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            {item.type === "music" && playingId === item.id && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                          </div>

                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{formatFileSize(item.size)}</span>
                            {item.duration && <span>{formatDuration(item.duration)}</span>}
                            <span>{item.uploadedAt.toLocaleDateString()}</span>
                          </div>

                          {item.artist && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {t("gallery.preview.artist")} {item.artist}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type === "music" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPlayback(music.find((m) => m.id === item.id)!);
                              }}
                            >
                              {playingId === item.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          )}

                          <Button size="icon" variant="ghost" onClick={() => window.open(item.url, "_blank")}>
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(item.id, item.type);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          {images
            .filter((img) => !searchTerm || img.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              let comparison = 0;
              switch (sortBy) {
                case "name":
                  comparison = a.name.localeCompare(b.name);
                  break;
                case "date":
                  comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                  break;
                case "size":
                  comparison = a.size - b.size;
                  break;
              }
              return sortOrder === "asc" ? comparison : -comparison;
            }).length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("gallery.empty.images.title")}</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {searchTerm ? t("gallery.empty.search") : t("gallery.empty.images.upload")}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images
                .filter((img) => !searchTerm || img.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {
                  let comparison = 0;
                  switch (sortBy) {
                    case "name":
                      comparison = a.name.localeCompare(b.name);
                      break;
                    case "date":
                      comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                      break;
                    case "size":
                      comparison = a.size - b.size;
                      break;
                  }
                  return sortOrder === "asc" ? comparison : -comparison;
                })
                .map((image, index) => {
                  const imageItem: MediaFile = {
                    id: image.id,
                    name: image.name,
                    url: image.url,
                    size: image.size,
                    uploadedAt: image.uploadedAt,
                    type: "image",
                  };
                  return (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="aspect-square relative bg-muted">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onClick={() => setSelectedPreview(imageItem)}
                          />

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPreview(imageItem);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="secondary" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => window.open(image.url, "_blank")}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("gallery.actions.download")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteMedia(image.id, "image")} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("gallery.actions.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              <FileImage className="h-3 w-3 mr-1" />
                              {t("gallery.badge.image")}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm truncate" title={image.name}>
                            {image.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(image.size)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {images
                    .filter((img) => !searchTerm || img.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => {
                      let comparison = 0;
                      switch (sortBy) {
                        case "name":
                          comparison = a.name.localeCompare(b.name);
                          break;
                        case "date":
                          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                          break;
                        case "size":
                          comparison = a.size - b.size;
                          break;
                      }
                      return sortOrder === "asc" ? comparison : -comparison;
                    })
                    .map((image, index) => {
                      const imageItem: MediaFile = {
                        id: image.id,
                        name: image.name,
                        url: image.url,
                        size: image.size,
                        uploadedAt: image.uploadedAt,
                        type: "image",
                      };
                      return (
                        <motion.div
                          key={image.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer group"
                          onClick={() => setSelectedPreview(imageItem)}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{image.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {t("gallery.tabs.images").toLowerCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{formatFileSize(image.size)}</span>
                              <span>{image.uploadedAt.toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => window.open(image.url, "_blank")}>
                              <Download className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(image.id, "image");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          {music
            .filter(
              (track) =>
                !searchTerm ||
                track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (track.artist && track.artist.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .sort((a, b) => {
              let comparison = 0;
              switch (sortBy) {
                case "name":
                  comparison = (a.title || a.name).localeCompare(b.title || b.name);
                  break;
                case "date":
                  comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                  break;
                case "size":
                  comparison = a.size - b.size;
                  break;
              }
              return sortOrder === "asc" ? comparison : -comparison;
            }).length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("gallery.empty.music.title")}</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {searchTerm ? t("gallery.empty.search") : t("gallery.empty.music.upload")}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {music
                .filter(
                  (track) =>
                    !searchTerm ||
                    track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (track.artist && track.artist.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .sort((a, b) => {
                  let comparison = 0;
                  switch (sortBy) {
                    case "name":
                      comparison = (a.title || a.name).localeCompare(b.title || b.name);
                      break;
                    case "date":
                      comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                      break;
                    case "size":
                      comparison = a.size - b.size;
                      break;
                  }
                  return sortOrder === "asc" ? comparison : -comparison;
                })
                .map((track, index) => {
                  const musicItem: MediaFile = {
                    id: track.id,
                    name: track.title || track.name,
                    url: track.url,
                    size: track.size,
                    uploadedAt: track.uploadedAt,
                    type: "music",
                    duration: track.duration,
                    artist: track.artist,
                    title: track.title,
                  };
                  return (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="aspect-square relative bg-muted">
                          <div
                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800"
                            onClick={() => setSelectedPreview(musicItem)}
                          >
                            <Music className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAudioPlayback(track);
                                }}
                              >
                                {playingId === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>

                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPreview(musicItem);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="secondary" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => window.open(track.url, "_blank")}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("gallery.actions.download")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteMedia(track.id, "music")} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("gallery.actions.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              <FileAudio className="h-3 w-3 mr-1" />
                              {t("gallery.badge.music")}
                            </Badge>
                          </div>

                          {playingId === track.id && (
                            <div className="absolute bottom-2 right-2">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm truncate" title={track.title || track.name}>
                            {track.title || track.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(track.size)}</span>
                            {track.duration && <span>{formatDuration(track.duration)}</span>}
                          </div>
                          {track.artist && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {t("gallery.preview.artist")} {track.artist}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {music
                    .filter(
                      (track) =>
                        !searchTerm ||
                        track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (track.artist && track.artist.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .sort((a, b) => {
                      let comparison = 0;
                      switch (sortBy) {
                        case "name":
                          comparison = (a.title || a.name).localeCompare(b.title || b.name);
                          break;
                        case "date":
                          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                          break;
                        case "size":
                          comparison = a.size - b.size;
                          break;
                      }
                      return sortOrder === "asc" ? comparison : -comparison;
                    })
                    .map((track, index) => {
                      const musicItem: MediaFile = {
                        id: track.id,
                        name: track.title || track.name,
                        url: track.url,
                        size: track.size,
                        uploadedAt: track.uploadedAt,
                        type: "music",
                        duration: track.duration,
                        artist: track.artist,
                        title: track.title,
                      };
                      return (
                        <motion.div
                          key={track.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer group"
                          onClick={() => setSelectedPreview(musicItem)}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                              <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{track.title || track.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {t("gallery.tabs.music").toLowerCase()}
                              </Badge>
                              {playingId === track.id && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                            </div>

                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{formatFileSize(track.size)}</span>
                              {track.duration && <span>{formatDuration(track.duration)}</span>}
                              <span>{track.uploadedAt.toLocaleDateString()}</span>
                            </div>

                            {track.artist && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {t("gallery.preview.artist")} {track.artist}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPlayback(track);
                              }}
                            >
                              {playingId === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>

                            <Button size="icon" variant="ghost" onClick={() => window.open(track.url, "_blank")}>
                              <Download className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(track.id, "music");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedPreview && (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedPreview.name}</DialogTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(selectedPreview.size)}</span>
                      <span>{selectedPreview.uploadedAt.toLocaleDateString()}</span>
                      {selectedPreview.duration && <span>{formatDuration(selectedPreview.duration)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open(selectedPreview.url, "_blank")}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("gallery.actions.download")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteMedia(selectedPreview.id, selectedPreview.type);
                        setSelectedPreview(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("gallery.actions.delete")}
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 pt-4">
                {selectedPreview.type === "image" ? (
                  <div className="flex justify-center">
                    <img src={selectedPreview.url} alt={selectedPreview.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg flex items-center justify-center">
                        <Music className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <audio controls src={selectedPreview.url} className="w-full max-w-md">
                        {t("gallery.audio.unsupported")}
                      </audio>
                    </div>

                    {selectedPreview.artist && (
                      <div className="text-center">
                        <p className="text-lg font-medium">{selectedPreview.title || selectedPreview.name}</p>
                        <p className="text-muted-foreground">
                          {t("gallery.preview.artist")} {selectedPreview.artist}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
