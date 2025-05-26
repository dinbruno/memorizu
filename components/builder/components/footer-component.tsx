"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings2, Plus, Trash2, Instagram, Facebook, Twitter } from "lucide-react"

interface SocialLink {
  platform: string
  url: string
}

interface FooterComponentProps {
  data: {
    text: string
    showSocialLinks: boolean
    socialLinks: SocialLink[]
  }
  onUpdate?: (data: any) => void
  isEditable?: boolean
}

export function FooterComponent({ data, onUpdate, isEditable = false }: FooterComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localData, setLocalData] = useState({ ...data })
  const textRef = useRef<HTMLParagraphElement>(null)

  const handleTextEdit = () => {
    if (textRef.current && onUpdate) {
      onUpdate({ ...data, text: textRef.current.textContent || "" })
    }
  }

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
  }

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const updatedLinks = [...localData.socialLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    handleSettingsChange("socialLinks", updatedLinks)
  }

  const handleAddSocialLink = () => {
    const newLink = {
      platform: "instagram",
      url: "#",
    }
    handleSettingsChange("socialLinks", [...localData.socialLinks, newLink])
  }

  const handleRemoveSocialLink = (index: number) => {
    const updatedLinks = [...localData.socialLinks]
    updatedLinks.splice(index, 1)
    handleSettingsChange("socialLinks", updatedLinks)
  }

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData)
    }
    setIsSettingsOpen(false)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Footer settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showSocialLinks"
                  checked={localData.showSocialLinks}
                  onCheckedChange={(checked) => handleSettingsChange("showSocialLinks", checked)}
                />
                <Label htmlFor="showSocialLinks">Show social links</Label>
              </div>

              {localData.showSocialLinks && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Social Links</h4>
                  {localData.socialLinks.map((link, index) => (
                    <div key={index} className="border rounded-md p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Link {index + 1}</h5>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveSocialLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`link-${index}-platform`}>Platform</Label>
                        <select
                          id={`link-${index}-platform`}
                          value={link.platform}
                          onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                        </select>
                      </div>
                      <div className="space-y-2 mt-2">
                        <Label htmlFor={`link-${index}-url`}>URL</Label>
                        <Input
                          id={`link-${index}-url`}
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleAddSocialLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
              )}

              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <footer className="text-center w-full">
        <p
          ref={textRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={handleTextEdit}
          className={cn(
            "text-muted-foreground",
            isEditable ? "outline-none focus:outline-none hover:bg-muted/20 transition-colors" : "",
          )}
        >
          {data.text}
        </p>

        {data.showSocialLinks && data.socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            {data.socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        )}
      </footer>
    </div>
  )
}
