'use client';

/**
 * Rate Cards Management Page
 * Dashboard for creating, managing, and exporting rate cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSubscription } from '@/contexts/subscription-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RateCardTemplate } from '@/components/rate-cards/rate-card-template';
import { BrandingModal } from '@/components/rate-cards/branding-modal';
import { RateCard, RateCardItem, BrandingSettings } from '@/types/rate-card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Copy,
  Eye,
  Palette,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface RateCardWithItems extends RateCard {
  items: RateCardItem[];
}

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: '',
  tagline: '',
  logoUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#10B981',
  contactEmail: '',
  contactPhone: '',
  website: '',
  address: '',
};

export default function RateCardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, isPaidUser } = useSubscription();

  const [rateCards, setRateCards] = useState<RateCardWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRateCard, setSelectedRateCard] = useState<RateCardWithItems | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch rate cards
  useEffect(() => {
    fetchRateCards();
  }, []);

  // Load user's branding settings
  useEffect(() => {
    if (user) {
      fetchBrandingSettings();
    }
  }, [user]);

  const fetchRateCards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rate-cards');
      if (!response.ok) throw new Error('Failed to fetch rate cards');
      const data = await response.json();
      setRateCards(data.rateCards || []);
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      toast.error('Failed to load rate cards');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch('/api/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding({ ...DEFAULT_BRANDING, ...data.branding });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const handleCreateRateCard = () => {
    router.push('/dashboard/rate-cards/new');
  };

  const handleEditRateCard = (rateCard: RateCardWithItems) => {
    router.push(`/dashboard/rate-cards/${rateCard.id}/edit`);
  };

  const handlePreviewRateCard = (rateCard: RateCardWithItems) => {
    setSelectedRateCard(rateCard);
    setIsPreviewOpen(true);
  };

  const handleDeleteRateCard = async () => {
    if (!selectedRateCard) return;

    try {
      const response = await fetch(`/api/rate-cards/${selectedRateCard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rate card');

      setRateCards((prev) => prev.filter((rc) => rc.id !== selectedRateCard.id));
      toast.success('Rate card deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRateCard(null);
    } catch (error) {
      console.error('Error deleting rate card:', error);
      toast.error('Failed to delete rate card');
    }
  };

  const handleDuplicateRateCard = async (rateCard: RateCardWithItems) => {
    try {
      const response = await fetch(`/api/rate-cards/${rateCard.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate rate card');

      const data = await response.json();
      setRateCards((prev) => [data.rateCard, ...prev]);
      toast.success('Rate card duplicated successfully');
    } catch (error) {
      console.error('Error duplicating rate card:', error);
      toast.error('Failed to duplicate rate card');
    }
  };

  const handleGeneratePDF = async (rateCard: RateCardWithItems) => {
    if (!isPaidUser && rateCards.length >= 3) {
      toast.error('Free users can only generate up to 3 rate cards. Upgrade to Pro!');
      return;
    }

    setIsGeneratingPDF(true);
    setSelectedRateCard(rateCard);

    try {
      const response = await fetch(`/api/rate-cards/${rateCard.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${rateCard.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSaveBranding = async (newBranding: BrandingSettings) => {
    try {
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding: newBranding }),
      });

      if (!response.ok) throw new Error('Failed to save branding');

      setBranding(newBranding);
      toast.success('Branding settings saved');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings');
    }
  };

  const handleGenerateAIInsights = async (rateCard: RateCardWithItems) => {
    try {
      const response = await fetch(`/api/rate-cards/${rateCard.id}/insights`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate insights');

      const data = await response.json();
      
      // Update the rate card with new insights
      setRateCards((prev) =>
        prev.map((rc) =>
          rc.id === rateCard.id ? { ...rc, aiInsights: data.insights } : rc
        )
      );

      toast.success('AI insights generated!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
    }
  };

  const filteredRateCards = rateCards.filter(
    (rc) =>
      rc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (rateCard: RateCard) => {
    const now = new Date();
    const validUntil = rateCard.validUntil ? new Date(rateCard.validUntil) : null;

    if (validUntil && validUntil < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (rateCard.isPublic) {
      return <Badge variant="default">Public</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage professional pricing documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBrandingModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Branding
          </Button>
          <Button onClick={handleCreateRateCard} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Rate Card
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rate Cards</CardDescription>
            <CardTitle className="text-3xl">{rateCards.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Public</CardDescription>
            <CardTitle className="text-3xl">
              {rateCards.filter((rc) => rc.isPublic).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expired</CardDescription>
            <CardTitle className="text-3xl">
              {
                rateCards.filter(
                  (rc) => rc.validUntil && new Date(rc.validUntil) < new Date()
                ).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Services</CardDescription>
            <CardTitle className="text-3xl">
              {rateCards.reduce((sum, rc) => sum + (rc.items?.length || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rate cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rate Cards Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRateCards.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No rate cards found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first rate card to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateRateCard} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rate Card
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateCards.map((rateCard) => (
                  <TableRow key={rateCard.id}>
                    <TableCell>
                      <div className="font-medium">{rateCard.title}</div>
                      {rateCard.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {rateCard.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{rateCard.items?.length || 0}</TableCell>
                    <TableCell>{getStatusBadge(rateCard)}</TableCell>
                    <TableCell>{formatDate(rateCard.createdAt)}</TableCell>
                    <TableCell>
                      {rateCard.validUntil
                        ? formatDate(rateCard.validUntil)
                        : 'No expiration'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewRateCard(rateCard)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditRateCard(rateCard)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateRateCard(rateCard)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleGeneratePDF(rateCard)}
                            disabled={isGeneratingPDF}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isGeneratingPDF && selectedRateCard?.id === rateCard.id
                              ? 'Generating...'
                              : 'Export PDF'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleGenerateAIInsights(rateCard)}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Insights
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRateCard(rateCard);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Card Preview</DialogTitle>
            <DialogDescription>
              Preview how your rate card will look when exported
            </DialogDescription>
          </DialogHeader>
          {selectedRateCard && (
            <RateCardTemplate
              rateCard={selectedRateCard}
              items={selectedRateCard.items || []}
              branding={branding}
              isPaidUser={isPaidUser}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            {selectedRateCard && (
              <Button
                onClick={() => handleGeneratePDF(selectedRateCard)}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branding Modal */}
      <BrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSave={handleSaveBranding}
        isPaidUser={isPaidUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rate Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedRateCard?.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRateCard}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
