"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings2,
  Type,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Strikethrough,
  Subscript,
  Superscript,
} from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

// TipTap imports with fallback
let useEditor: any = null;
let EditorContent: any = null;
let StarterKit: any = null;
let TextAlign: any = null;
let TextStyle: any = null;
let FontFamily: any = null;
let Underline: any = null;
let Link: any = null;
let Image: any = null;
let Table: any = null;
let TableRow: any = null;
let TableCell: any = null;
let TableHeader: any = null;

// Try to import TipTap, fallback to null if not available
try {
  const tiptapReact = require("@tiptap/react");
  useEditor = tiptapReact.useEditor;
  EditorContent = tiptapReact.EditorContent;

  StarterKit = require("@tiptap/starter-kit").default;
  TextAlign = require("@tiptap/extension-text-align").default;
  TextStyle = require("@tiptap/extension-text-style").default;
  FontFamily = require("@tiptap/extension-font-family").default;
  Underline = require("@tiptap/extension-underline").default;
  Link = require("@tiptap/extension-link").default;
  Image = require("@tiptap/extension-image").default;
  Table = require("@tiptap/extension-table").default;
  TableRow = require("@tiptap/extension-table-row").default;
  TableCell = require("@tiptap/extension-table-cell").default;
  TableHeader = require("@tiptap/extension-table-header").default;
} catch (error) {
  console.log("TipTap not installed, using fallback editor");
}

interface TextComponentProps {
  data: {
    content: string; // HTML content from TipTap or plain text
    fontSize: number;
    fontFamily: string;
    textColor: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    marginBottom: number;
    minHeight: number;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function TextComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: TextComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState(() => {
    const defaults = {
      content: "<p>Click to edit text</p>",
      fontSize: 16,
      fontFamily: "Inter, sans-serif",
      textColor: "#000000",
      backgroundColor: "transparent",
      padding: 16,
      borderRadius: 0,
      marginBottom: 16,
      minHeight: 60,
    };
    return { ...defaults, ...data };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const isInitialMount = useRef(true);
  const isUpdatingFromExternal = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if TipTap is available
  const hasTipTap = useEditor !== null;

  // TipTap Editor Configuration (only if available) - removed Color extension
  const editor = hasTipTap
    ? useEditor({
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3, 4, 5, 6],
            },
          }),
          TextAlign.configure({
            types: ["heading", "paragraph"],
          }),
          TextStyle,
          FontFamily,
          Underline,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: "text-primary underline",
            },
          }),
          Image.configure({
            HTMLAttributes: {
              class: "max-w-full h-auto rounded",
            },
          }),
          Table.configure({
            resizable: true,
          }),
          TableRow,
          TableHeader,
          TableCell,
        ],
        content: localData.content,
        editable: isEditing,
        onUpdate: ({ editor }: any) => {
          if (!isUpdatingFromExternal.current) {
            const html = editor.getHTML();
            setLocalData((prev) => ({ ...prev, content: html }));
          }
        },
        editorProps: {
          attributes: {
            class: cn(
              "prose prose-sm max-w-none focus:outline-none",
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground prose-p:leading-relaxed",
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-em:text-foreground prose-blockquote:text-foreground",
              "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded",
              "prose-pre:bg-muted prose-pre:text-foreground",
              "prose-ul:text-foreground prose-ol:text-foreground",
              "prose-li:text-foreground prose-table:text-foreground",
              "min-h-[40px] p-3"
            ),
            style: `font-size: ${localData.fontSize}px; font-family: ${localData.fontFamily}; color: ${localData.textColor}; min-height: ${localData.minHeight}px;`,
          },
        },
      })
    : null;

  // Extract plain text from HTML for fallback editor
  const getPlainText = (html: string) => {
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    }
    return html.replace(/<[^>]*>/g, "");
  };

  // Convert plain text to simple HTML
  const textToHtml = (text: string) => {
    return `<p>${text.replace(/\n/g, "</p><p>")}</p>`;
  };

  // Initialize editing text
  useEffect(() => {
    if (!hasTipTap) {
      setEditingText(getPlainText(localData.content));
    }
  }, [localData.content, hasTipTap]);

  // Sync localData with external data changes
  useEffect(() => {
    if (!isInitialMount.current) {
      isUpdatingFromExternal.current = true;
      setLocalData((prevLocalData) => {
        const hasChanged =
          prevLocalData.content !== data.content ||
          prevLocalData.fontSize !== data.fontSize ||
          prevLocalData.fontFamily !== data.fontFamily ||
          prevLocalData.textColor !== data.textColor ||
          prevLocalData.backgroundColor !== data.backgroundColor ||
          prevLocalData.padding !== data.padding ||
          prevLocalData.borderRadius !== data.borderRadius ||
          prevLocalData.marginBottom !== data.marginBottom ||
          prevLocalData.minHeight !== data.minHeight;

        if (hasChanged) {
          const newData = { ...prevLocalData, ...data };
          return newData;
        }
        return prevLocalData;
      });
      setTimeout(() => {
        isUpdatingFromExternal.current = false;
      }, 0);
    }
  }, [
    data.content,
    data.fontSize,
    data.fontFamily,
    data.textColor,
    data.backgroundColor,
    data.padding,
    data.borderRadius,
    data.marginBottom,
    data.minHeight,
  ]);

  // Separate useEffect for TipTap content updates to avoid render cycle issues
  useEffect(() => {
    if (hasTipTap && editor && !isUpdatingFromExternal.current && !isInitialMount.current) {
      const currentContent = editor.getHTML();
      if (currentContent !== localData.content) {
        editor.commands.setContent(localData.content);
      }
    }
  }, [localData.content, editor, hasTipTap]);

  // Auto-update when localData changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isUpdatingFromExternal.current) {
      return;
    }

    if (onUpdate) {
      onUpdate(localData);
    }
  }, [
    localData.content,
    localData.fontSize,
    localData.fontFamily,
    localData.textColor,
    localData.backgroundColor,
    localData.padding,
    localData.borderRadius,
    localData.marginBottom,
    localData.minHeight,
  ]);

  const handleSettingsChange = useCallback((field: string, value: any) => {
    if (isUpdatingFromExternal.current) {
      return;
    }

    setLocalData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  const handleStartEditing = useCallback(() => {
    if (isEditable && !isInlineEdit) {
      setIsEditing(true);
      if (hasTipTap && editor) {
        editor.setEditable(true);
        editor.commands.focus();
      } else {
        setEditingText(getPlainText(localData.content));
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
          }
        }, 0);
      }
    }
  }, [isEditable, isInlineEdit, editor, hasTipTap, localData.content]);

  const handleStopEditing = useCallback(() => {
    setIsEditing(false);
    if (hasTipTap && editor) {
      editor.setEditable(false);
    } else {
      // Update content with plain text converted to HTML
      setLocalData((prev) => ({ ...prev, content: textToHtml(editingText) }));
    }
  }, [editor, hasTipTap, editingText]);

  const handleTextChange = useCallback((newText: string) => {
    if (isUpdatingFromExternal.current) {
      return;
    }
    setEditingText(newText);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        handleStopEditing();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditingText(getPlainText(localData.content));
        setIsEditing(false);
      }
    },
    [handleStopEditing, localData.content]
  );

  const getContainerStyles = useCallback(
    () => ({
      backgroundColor: localData.backgroundColor === "transparent" ? undefined : localData.backgroundColor,
      padding: `${localData.padding}px`,
      borderRadius: `${localData.borderRadius}px`,
      marginBottom: `${localData.marginBottom}px`,
      minHeight: `${localData.minHeight}px`,
      fontSize: `${localData.fontSize}px`,
      fontFamily: localData.fontFamily,
      color: localData.textColor,
    }),
    [localData]
  );

  // TipTap Toolbar Actions (only if available) - removed color functions
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();

  const setTextAlign = (alignment: string) => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };

  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();

  const setHeading = (level: number) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run();
    } else {
      editor
        ?.chain()
        .focus()
        .toggleHeading({ level: level as any })
        .run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const renderToolbar = () => {
    if (!hasTipTap || !editor) return null;

    return (
      <div className="border-b p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
        {/* Format Buttons Row 1 */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant={editor?.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleBold();
            }}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleItalic();
            }}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant={editor?.isActive("underline") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleUnderline();
            }}
            className="h-8 w-8 p-0"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive("strike") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleStrike();
            }}
            className="h-8 w-8 p-0"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleCode();
            }}
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <Button
            variant={editor?.isActive({ textAlign: "left" }) ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setTextAlign("left");
            }}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive({ textAlign: "center" }) ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setTextAlign("center");
            }}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive({ textAlign: "right" }) ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setTextAlign("right");
            }}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setTextAlign("justify");
            }}
            className="h-8 w-8 p-0"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <Button
            variant={editor?.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleBulletList();
            }}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleOrderedList();
            }}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockquote();
            }}
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Format Buttons Row 2 */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Heading Selector */}
          <Select
            value={
              editor?.isActive("heading", { level: 1 })
                ? "1"
                : editor?.isActive("heading", { level: 2 })
                ? "2"
                : editor?.isActive("heading", { level: 3 })
                ? "3"
                : editor?.isActive("heading", { level: 4 })
                ? "4"
                : editor?.isActive("heading", { level: 5 })
                ? "5"
                : editor?.isActive("heading", { level: 6 })
                ? "6"
                : "0"
            }
            onValueChange={(value) => setHeading(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-24" onClick={(e) => e.stopPropagation()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
              <SelectItem value="0">Paragraph</SelectItem>
              <SelectItem value="1">Heading 1</SelectItem>
              <SelectItem value="2">Heading 2</SelectItem>
              <SelectItem value="3">Heading 3</SelectItem>
              <SelectItem value="4">Heading 4</SelectItem>
              <SelectItem value="5">Heading 5</SelectItem>
              <SelectItem value="6">Heading 6</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Insert Elements */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addLink();
            }}
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addImage();
            }}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              insertTable();
            }}
            className="h-8 w-8 p-0"
          >
            <TableIcon className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              editor?.chain().focus().undo().run();
            }}
            disabled={!editor?.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              editor?.chain().focus().redo().run();
            }}
            disabled={!editor?.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSettingsPanel = () => (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <Type className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{hasTipTap ? "Rich Text Settings" : "Text Settings"}</h3>
          <p className="text-xs text-muted-foreground">Configure editor appearance</p>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Type className="h-3 w-3" />
          Typography
        </div>

        <div className="space-y-2 pl-4">
          <div className="space-y-1">
            <Label className="text-xs">Font Size: {localData.fontSize}px</Label>
            <Slider
              value={[localData.fontSize]}
              onValueChange={([value]) => handleSettingsChange("fontSize", value)}
              min={8}
              max={72}
              step={1}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Font Family</Label>
            <Select value={localData.fontFamily} onValueChange={(value) => handleSettingsChange("fontFamily", value)}>
              <SelectTrigger className="h-8" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent onClick={(e) => e.stopPropagation()}>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                <SelectItem value="Georgia, serif">Georgia</SelectItem>
                <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Min Height: {localData.minHeight}px</Label>
            <Slider
              value={[localData.minHeight]}
              onValueChange={([value]) => handleSettingsChange("minHeight", value)}
              min={40}
              max={500}
              step={10}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Palette className="h-3 w-3" />
          Colors
        </div>

        <div className="space-y-2 pl-4" onClick={(e) => e.stopPropagation()}>
          <ColorPicker label="Text Color" value={localData.textColor} onChange={(color) => handleSettingsChange("textColor", color)} />

          <ColorPicker
            label="Background Color"
            value={localData.backgroundColor}
            onChange={(color) => handleSettingsChange("backgroundColor", color)}
          />
        </div>
      </div>

      <Separator />

      {/* Spacing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Settings2 className="h-3 w-3" />
          Spacing & Style
        </div>

        <div className="space-y-2 pl-4">
          <div className="space-y-1">
            <Label className="text-xs">Padding: {localData.padding}px</Label>
            <Slider
              value={[localData.padding]}
              onValueChange={([value]) => handleSettingsChange("padding", value)}
              min={0}
              max={50}
              step={2}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Border Radius: {localData.borderRadius}px</Label>
            <Slider
              value={[localData.borderRadius]}
              onValueChange={([value]) => handleSettingsChange("borderRadius", value)}
              min={0}
              max={25}
              step={1}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Bottom Margin: {localData.marginBottom}px</Label>
            <Slider
              value={[localData.marginBottom]}
              onValueChange={([value]) => handleSettingsChange("marginBottom", value)}
              min={0}
              max={50}
              step={2}
              className="py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalEditVersion = () => (
    <div className="space-y-4">
      {/* Text Info Header */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium text-sm">{hasTipTap ? "Rich Text Editor" : "Text Editor"}</div>
            <div className="text-xs text-muted-foreground">
              {localData.fontSize}px • {localData.fontFamily.split(",")[0]}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsSettingsOpen(true);
          }}
        >
          <Settings2 className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>

      {/* Editor */}
      <div className="rounded-lg bg-background overflow-hidden">
        <div className="text-xs text-muted-foreground p-2 bg-muted/20 border-b">{hasTipTap ? "Rich Text Editor:" : "Text Editor:"}</div>

        {/* Compact Toolbar - only for TipTap */}
        {hasTipTap && (
          <div className="border-b p-2">
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant={editor?.isActive("bold") ? "default" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBold();
                }}
                className="h-6 w-6 p-0"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={editor?.isActive("italic") ? "default" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItalic();
                }}
                className="h-6 w-6 p-0"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant={editor?.isActive("underline") ? "default" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUnderline();
                }}
                className="h-6 w-6 p-0"
              >
                <UnderlineIcon className="h-3 w-3" />
              </Button>
              <Button
                variant={editor?.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBulletList();
                }}
                className="h-6 w-6 p-0"
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  addLink();
                }}
                className="h-6 w-6 p-0"
              >
                <LinkIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div
          className="min-h-[120px]"
          style={getContainerStyles()}
          onClick={() => {
            setIsEditing(true);
            if (hasTipTap && editor) {
              editor.setEditable(true);
              editor.commands.focus();
            }
          }}
        >
          {hasTipTap ? (
            <EditorContent editor={editor} className="h-full" />
          ) : (
            <Textarea
              ref={textareaRef}
              value={editingText}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleStopEditing}
              onKeyDown={handleKeyDown}
              className="w-full h-full min-h-[120px] resize-none border-0 focus:ring-0"
              style={{ fontSize: `${localData.fontSize}px`, fontFamily: localData.fontFamily, color: localData.textColor }}
              placeholder="Enter your text here... (Ctrl+Enter to save, Esc to cancel)"
            />
          )}
        </div>
      </div>

      {/* Settings Panel Popover */}
      <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 p-0"
          side="left"
          align="start"
          onInteractOutside={(e) => {
            // Only close if clicking outside, not on interactive elements
            const target = e.target as Element;
            if (!target.closest("[data-radix-select-content]") && !target.closest("[data-radix-popover-content]")) {
              setIsSettingsOpen(false);
            } else {
              e.preventDefault();
            }
          }}
        >
          {renderSettingsPanel()}
        </PopoverContent>
      </Popover>
    </div>
  );

  // Update editor styles when settings change
  useEffect(() => {
    if (hasTipTap && editor) {
      const editorElement = editor.view.dom as HTMLElement;
      if (editorElement) {
        editorElement.style.fontSize = `${localData.fontSize}px`;
        editorElement.style.fontFamily = localData.fontFamily;
        editorElement.style.color = localData.textColor;
        editorElement.style.minHeight = `${localData.minHeight}px`;
      }
    }
  }, [editor, localData.fontSize, localData.fontFamily, localData.textColor, localData.minHeight, hasTipTap]);

  return (
    <div className="relative w-full">
      {/* If this is inline edit mode (sidebar), show minimal version */}
      {isInlineEdit ? (
        renderMinimalEditVersion()
      ) : (
        <motion.div
          className={cn("group relative w-full", isEditable ? "cursor-text hover:bg-muted/10 transition-colors rounded-lg" : "")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Settings Button */}
          {isEditable && (
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 p-0"
                side="left"
                align="start"
                onInteractOutside={(e) => {
                  // Only close if clicking outside, not on interactive elements
                  const target = e.target as Element;
                  if (!target.closest("[data-radix-select-content]") && !target.closest("[data-radix-popover-content]")) {
                    setIsSettingsOpen(false);
                  } else {
                    e.preventDefault();
                  }
                }}
              >
                {renderSettingsPanel()}
              </PopoverContent>
            </Popover>
          )}

          {/* Text Editor */}
          <div
            className={cn("rounded-lg overflow-hidden", isEditing ? "shadow-lg" : "", isEditable && "hover:shadow-sm transition-shadow")}
            style={getContainerStyles()}
            onClick={handleStartEditing}
          >
            {/* Toolbar - only show when editing and TipTap is available */}
            {isEditing && hasTipTap && renderToolbar()}

            {/* Editor Content */}
            <div className="relative">
              {hasTipTap ? (
                <EditorContent editor={editor} className="h-full" />
              ) : // Fallback: Simple text display/edit
              isEditing ? (
                <Textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onBlur={handleStopEditing}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[60px] resize-none border-0 focus:ring-0"
                  style={{ fontSize: `${localData.fontSize}px`, fontFamily: localData.fontFamily, color: localData.textColor }}
                  placeholder="Enter your text here... (Ctrl+Enter to save, Esc to cancel)"
                />
              ) : (
                <div
                  className="w-full min-h-[40px] break-words whitespace-pre-wrap p-3"
                  style={{ fontSize: `${localData.fontSize}px`, fontFamily: localData.fontFamily, color: localData.textColor }}
                  dangerouslySetInnerHTML={{ __html: localData.content }}
                />
              )}

              {/* Edit hint when not editing */}
              {!isEditing && isEditable && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded text-sm text-muted-foreground border">
                    Click to edit with {hasTipTap ? "rich text editor" : "text editor"}
                  </div>
                </div>
              )}
            </div>

            {/* Done button when editing */}
            {isEditing && (
              <div className="border-t p-2 bg-muted/20">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopEditing();
                  }}
                  className="ml-auto block"
                >
                  Done Editing
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
