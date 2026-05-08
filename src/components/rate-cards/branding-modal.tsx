'use client';

/**
 * Branding Modal Component
 * Allows users to customize their rate card branding
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandingSettings } from '@/types/rate-card';
import { Upload, Palette, Building2, Phone, Globe, MapPin } from 'lucide-react';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingSettings;
  onSave: (branding: BrandingSettings) => void;
  isPaidUser?: boolean;
}

const PRESET_COLORS = [
  { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#10B981' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#5B21B6', accent: '#EC4899' },
  { name: 'Green', primary: '#10B981', secondary: '#047857', accent: '#F59E0B' },
  { name: 'Orange', primary: '#F97316', secondary: '#C2410C', accent: '#3B82F6' },
  { name: 'Red', primary: '#EF4444', secondary: '#B91C1C', accent: '#F59E0B' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#0F766E', accent: '#8B5CF6' },
  { name: 'Pink', primary: '#EC4899', secondary: '#BE185D', accent: '#8B5CF6' },
  { name: 'Slate', primary: '#64748B', secondary: '#334155', accent: '#3B82F6' },
];

export function BrandingModal({
  isOpen,
  onClose,
  branding: initialBranding,
  onSave,
  isPaidUser = false,
}: BrandingModalProps) {
  const [branding, setBranding] = useState<BrandingSettings>(initialBranding);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const handleChange = useCallback(
    (field: keyof BrandingSettings, value: string) => {
      setBranding((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleColorPreset = useCallback((preset: typeof PRESET_COLORS[0]) => {
    setBranding((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  }, []);

  const handleLogoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setIsUploading(true);

      try {
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setBranding((prev) => ({ ...prev, logoUrl: base64 }));
          setIsUploading(false);
        };
        reader.readAsDataURL(file);

        // TODO: Upload to Supabase storage and get permanent URL
        // const formData = new FormData();
        // formData.append('logo', file);
        // const response = await fetch('/api/upload-logo', { method: 'POST', body: formData });
        // const { url } = await response.json();
        // setBranding((prev) => ({ ...prev, logoUrl: url }));
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('Failed to upload logo. Please try again.');
        setIsUploading(false);
      }
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(branding);
    onClose();
  }, [branding, onSave, onClose]);

  const handleReset = useCallback(() => {
    setBranding(initialBranding);
  }, [initialBranding]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Customize Branding
          </DialogTitle>
          <DialogDescription>
            Personalize your rate card with your company branding and colors.
            {!isPaidUser && (
              <span className="block mt-1 text-amber-600">
                Upgrade to Pro to remove the RateWise watermark from your PDFs.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={branding.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={branding.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Your company tagline or slogan"
              />
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <div className="relative">
                    <img
                      src={branding.logoUrl}
                      alt="Company logo"
                      className="w-24 h-24 object-contain border rounded-lg"
                    />
                    <button
                      onClick={() => handleChange('logoUrl', '')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-2xl">Logo</span>
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: PNG or JPG, max 2MB, square aspect ratio
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Color Presets</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorPreset(preset)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={branding.primaryColor || '#3B82F6'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={branding.primaryColor || '#3B82F6'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={branding.secondaryColor || '#1E40AF'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={branding.secondaryColor || '#1E40AF'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={branding.accentColor || '#10B981'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={branding.accentColor || '#10B981'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4 p-4 border rounded-lg">
              <Label className="mb-2 block">Preview</Label>
              <div
                className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: branding.primaryColor || '#3B82F6' }}
              >
                Primary
              </div>
              <div className="flex gap-2 mt-2">
                <div
                  className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: branding.secondaryColor || '#1E40AF' }}
                >
                  Secondary
                </div>
                <div
                  className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: branding.accentColor || '#10B981' }}
                >
                  Accent
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <span className="text-lg">✉️</span> Email Address
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={branding.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="contact@yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="flex items-center gap-2">
                <span className="text-lg">📞</span> Phone Number
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                value={branding.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </Label>
              <Input
                id="website"
                type="url"
                value={branding.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </Label>
              <textarea
                id="address"
                value={branding.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Business St, City, State 12345"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BrandingModal;
