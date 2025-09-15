import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Star,
  StarOff,
  Copy,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Tag,
  Folder,
  TrendingUp,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Import,
  Settings,
  History,
  GitFork,
  Users,
  Lock,
  Globe,
  BookOpen,
  Zap,
  Target,
  Briefcase,
  Lightbulb,
  Code
} from "lucide-react";
import type {
  PlaygroundPrompt,
  SavePlaygroundPromptRequest,
  UpdatePlaygroundPromptRequest
} from "@shared/schema";

interface PromptLibraryProps {
  onSelectPrompt?: (prompt: PlaygroundPrompt) => void;
  selectedPromptId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'embedded' | 'modal' | 'page';
}

interface PromptFilters {
  search: string;
  category: string;
  tags: string[];
  isPublic?: boolean;
  sortBy: 'recent' | 'title' | 'popular' | 'rating';
  sortOrder: 'asc' | 'desc';
  dateRange?: 'week' | 'month' | 'year' | 'all';
  viewMode: 'grid' | 'list';
}

interface ExtendedPlaygroundPrompt extends PlaygroundPrompt {
  usageCount?: number;
  avgRating?: number;
  isFavorite?: boolean;
  isOwner?: boolean;
  authorName?: string;
  forkCount?: number;
  parentTitle?: string;
}

const CATEGORIES = [
  { id: 'business', label: 'promptLibrary.categories.business', icon: Briefcase },
  { id: 'creative', label: 'promptLibrary.categories.creative', icon: Lightbulb },
  { id: 'technical', label: 'promptLibrary.categories.technical', icon: Code },
  { id: 'research', label: 'promptLibrary.categories.research', icon: BookOpen },
  { id: 'productivity', label: 'promptLibrary.categories.productivity', icon: Target },
  { id: 'education', label: 'promptLibrary.categories.education', icon: BookOpen },
  { id: 'marketing', label: 'promptLibrary.categories.marketing', icon: TrendingUp },
  { id: 'analysis', label: 'promptLibrary.categories.analysis', icon: Zap }
];

const SUGGESTED_TAGS = [
  'automation', 'content-writing', 'data-analysis', 'email-template', 
  'meeting-notes', 'brainstorming', 'planning', 'research', 'coding',
  'documentation', 'marketing-copy', 'social-media', 'strategy',
  'customer-support', 'training', 'creative-writing', 'summarization',
  'translation', 'qa-testing', 'troubleshooting'
];

export default function PromptLibrary({ 
  onSelectPrompt, 
  selectedPromptId, 
  isOpen, 
  onOpenChange, 
  mode = 'modal' 
}: PromptLibraryProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [filters, setFilters] = useState<PromptFilters>({
    search: '',
    category: 'all',
    tags: [],
    sortBy: 'recent',
    sortOrder: 'desc',
    dateRange: 'all',
    viewMode: 'grid'
  });
  
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ExtendedPlaygroundPrompt | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('my-prompts');

  // Form state for creating/editing prompts
  const [promptForm, setPromptForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    isPublic: false
  });

  // Fetch prompts based on current filters and tab
  const { 
    data: prompts = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<ExtendedPlaygroundPrompt[]>({
    queryKey: ['/api/playground/prompts', activeTab, filters],
    enabled: isAuthenticated && (isOpen || mode === 'page'),
    retry: 1
  });

  // Fetch popular tags for suggestions
  const { data: popularTags = [] } = useQuery<string[]>({
    queryKey: ['/api/playground/prompts/tags/popular'],
    enabled: isAuthenticated && (isOpen || mode === 'page'),
    retry: 1
  });

  // Create/Update prompt mutations
  const createPromptMutation = useMutation({
    mutationFn: async (request: SavePlaygroundPromptRequest) => {
      const response = await apiRequest('POST', '/api/playground/prompts', request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playground/prompts'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: t('promptLibrary.promptCreated'),
        description: t('promptLibrary.promptCreatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('promptLibrary.createFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: async (request: UpdatePlaygroundPromptRequest) => {
      const response = await apiRequest('PUT', `/api/playground/prompts/${request.id}`, request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playground/prompts'] });
      setEditingPrompt(null);
      resetForm();
      toast({
        title: t('promptLibrary.promptUpdated'),
        description: t('promptLibrary.promptUpdatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('promptLibrary.updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      await apiRequest('DELETE', `/api/playground/prompts/${promptId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playground/prompts'] });
      toast({
        title: t('promptLibrary.promptDeleted'),
        description: t('promptLibrary.promptDeletedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('promptLibrary.deleteFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (promptIds: string[]) => {
      await Promise.all(promptIds.map(id => 
        apiRequest('DELETE', `/api/playground/prompts/${id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playground/prompts'] });
      setSelectedPrompts([]);
      toast({
        title: t('promptLibrary.bulkDeleteSuccess'),
        description: t('promptLibrary.bulkDeleteSuccessDesc', { count: selectedPrompts.length }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('promptLibrary.bulkDeleteFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fork prompt mutation
  const forkPromptMutation = useMutation({
    mutationFn: async (originalPrompt: ExtendedPlaygroundPrompt) => {
      const request: SavePlaygroundPromptRequest = {
        title: `${originalPrompt.title} (Fork)`,
        content: originalPrompt.content,
        category: originalPrompt.category ?? undefined,
        tags: originalPrompt.tags ?? undefined,
        isPublic: false,
        parentId: originalPrompt.id
      };
      const response = await apiRequest('POST', '/api/playground/prompts', request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playground/prompts'] });
      toast({
        title: t('promptLibrary.promptForked'),
        description: t('promptLibrary.promptForkedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('promptLibrary.forkFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    
    let filtered = prompts.filter(prompt => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!prompt.title.toLowerCase().includes(searchLower) &&
            !prompt.content.toLowerCase().includes(searchLower) &&
            !(prompt.tags?.some(tag => tag.toLowerCase().includes(searchLower)))) {
          return false;
        }
      }
      
      // Category filter
      if (filters.category !== 'all' && prompt.category !== filters.category) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0) {
        if (!filters.tags.every(tag => prompt.tags?.includes(tag))) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const promptDate = new Date(prompt.createdAt || now);
        const daysDiff = (now.getTime() - promptDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }
      
      return true;
    });
    
    // Sort prompts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popular':
          comparison = (b.usageCount || 0) - (a.usageCount || 0);
          break;
        case 'rating':
          comparison = (b.avgRating || 0) - (a.avgRating || 0);
          break;
        case 'recent':
        default:
          comparison = new Date(b.updatedAt || b.createdAt || 0).getTime() - 
                      new Date(a.updatedAt || a.createdAt || 0).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [prompts, filters]);

  // Helper functions
  const resetForm = () => {
    setPromptForm({
      title: '',
      content: '',
      category: '',
      tags: [],
      isPublic: false
    });
  };

  const handleCreatePrompt = () => {
    if (!promptForm.title.trim()) {
      toast({
        title: t('promptLibrary.missingTitle'),
        description: t('promptLibrary.missingTitleDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    if (!promptForm.content.trim()) {
      toast({
        title: t('promptLibrary.missingContent'),
        description: t('promptLibrary.missingContentDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    createPromptMutation.mutate({
      title: promptForm.title,
      content: promptForm.content,
      category: promptForm.category || undefined,
      tags: promptForm.tags.length > 0 ? promptForm.tags : undefined,
      isPublic: promptForm.isPublic
    });
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt) return;
    
    updatePromptMutation.mutate({
      id: editingPrompt.id,
      title: promptForm.title,
      content: promptForm.content,
      category: promptForm.category || undefined,
      tags: promptForm.tags.length > 0 ? promptForm.tags : undefined,
      isPublic: promptForm.isPublic
    });
  };

  const handleEditPrompt = (prompt: ExtendedPlaygroundPrompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category || '',
      tags: prompt.tags || [],
      isPublic: prompt.isPublic || false
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPrompts(filteredPrompts.map(p => p.id));
    } else {
      setSelectedPrompts([]);
    }
  };

  const handlePromptSelect = (promptId: string, checked: boolean) => {
    if (checked) {
      setSelectedPrompts(prev => [...prev, promptId]);
    } else {
      setSelectedPrompts(prev => prev.filter(id => id !== promptId));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !promptForm.tags.includes(tag)) {
      setPromptForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPromptForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleExportSelected = () => {
    const selectedPromptData = filteredPrompts.filter(p => selectedPrompts.includes(p.id));
    const exportData = {
      exportDate: new Date().toISOString(),
      prompts: selectedPromptData.map(p => ({
        title: p.title,
        content: p.content,
        category: p.category,
        tags: p.tags,
        createdAt: p.createdAt
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-library-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('promptLibrary.exportSuccess'),
      description: t('promptLibrary.exportSuccessDesc', { count: selectedPrompts.length }),
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import format
      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        throw new Error('Invalid file format. Expected format: { prompts: [...] }');
      }

      let successCount = 0;
      let errorCount = 0;

      // Import each prompt
      for (const promptData of importData.prompts) {
        try {
          if (!promptData.title || !promptData.content) {
            errorCount++;
            continue;
          }

          await createPromptMutation.mutateAsync({
            title: promptData.title,
            content: promptData.content,
            category: promptData.category || undefined,
            tags: Array.isArray(promptData.tags) ? promptData.tags : undefined,
            isPublic: false // Import as private by default
          });
          
          successCount++;
        } catch (error) {
          console.error('Error importing prompt:', error);
          errorCount++;
        }
      }

      setShowImportDialog(false);
      
      if (successCount > 0) {
        toast({
          title: t('promptLibrary.importSuccess'),
          description: t('promptLibrary.importSuccessDesc', { 
            imported: successCount, 
            failed: errorCount 
          }),
        });
      } else {
        toast({
          title: t('promptLibrary.importFailed'),
          description: t('promptLibrary.importFailedDesc'),
          variant: 'destructive',
        });
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: t('promptLibrary.importError'),
        description: error instanceof Error ? error.message : t('promptLibrary.importErrorGeneric'),
        variant: 'destructive',
      });
      
      // Reset file input
      event.target.value = '';
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const IconComponent = category?.icon || Folder;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? t(category.label) : categoryId;
  };

  // Component content
  const libraryContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('promptLibrary.title')}</h2>
          <p className="text-muted-foreground">
            {t('promptLibrary.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            data-testid="button-import-prompts"
          >
            <Import className="w-4 h-4 mr-2" />
            {t('promptLibrary.import')}
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            data-testid="button-create-prompt"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('promptLibrary.createPrompt')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-prompts" data-testid="tab-my-prompts">
            {t('promptLibrary.myPrompts')}
          </TabsTrigger>
          <TabsTrigger value="shared" data-testid="tab-shared-prompts">
            {t('promptLibrary.sharedPrompts')}
          </TabsTrigger>
          <TabsTrigger value="community" data-testid="tab-community">
            {t('promptLibrary.community')}
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('promptLibrary.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
                data-testid="input-search-prompts"
              />
            </div>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder={t('promptLibrary.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('promptLibrary.allCategories')}</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.id)}
                      {t(category.label)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              data-testid="button-advanced-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('promptLibrary.filters')}
            </Button>
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                data-testid="button-grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{t('promptLibrary.sortBy')}</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger data-testid="select-sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">{t('promptLibrary.sortOptions.recent')}</SelectItem>
                      <SelectItem value="title">{t('promptLibrary.sortOptions.title')}</SelectItem>
                      <SelectItem value="popular">{t('promptLibrary.sortOptions.popular')}</SelectItem>
                      <SelectItem value="rating">{t('promptLibrary.sortOptions.rating')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('promptLibrary.dateRange')}</Label>
                  <Select 
                    value={filters.dateRange} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger data-testid="select-date-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('promptLibrary.dateRangeOptions.all')}</SelectItem>
                      <SelectItem value="week">{t('promptLibrary.dateRangeOptions.week')}</SelectItem>
                      <SelectItem value="month">{t('promptLibrary.dateRangeOptions.month')}</SelectItem>
                      <SelectItem value="year">{t('promptLibrary.dateRangeOptions.year')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('promptLibrary.tags')}</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            tags: prev.tags.filter(t => t !== tag)
                          }))}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularTags
                      .filter(tag => !filters.tags.includes(tag))
                      .slice(0, 5)
                      .map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }))}
                        >
                          {tag}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Bulk Actions */}
          {selectedPrompts.length > 0 && (
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedPrompts.length === filteredPrompts.length}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
                <span className="text-sm font-medium">
                  {t('promptLibrary.selectedCount', { count: selectedPrompts.length })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  data-testid="button-export-selected"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('promptLibrary.export')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(t('promptLibrary.confirmBulkDelete', { count: selectedPrompts.length }))) {
                      bulkDeleteMutation.mutate(selectedPrompts);
                    }
                  }}
                  data-testid="button-delete-selected"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('promptLibrary.deleteSelected')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content for each tab */}
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{t('promptLibrary.loading')}</p>
              </div>
            </div>
          ) : isError ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('promptLibrary.loadError')}
              </AlertDescription>
            </Alert>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('promptLibrary.noPrompts')}</h3>
              <p className="text-muted-foreground mb-4">{t('promptLibrary.noPromptsDesc')}</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('promptLibrary.createFirstPrompt')}
              </Button>
            </div>
          ) : (
            <div className={filters.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredPrompts.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  viewMode={filters.viewMode}
                  isSelected={selectedPrompts.includes(prompt.id)}
                  onSelect={(checked) => handlePromptSelect(prompt.id, checked)}
                  onEdit={() => handleEditPrompt(prompt)}
                  onDelete={() => {
                    if (confirm(t('promptLibrary.confirmDelete'))) {
                      deletePromptMutation.mutate(prompt.id);
                    }
                  }}
                  onFork={() => forkPromptMutation.mutate(prompt)}
                  onUse={() => onSelectPrompt?.(prompt)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryLabel={getCategoryLabel}
                  selectedPromptId={selectedPromptId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Prompt Dialog */}
      <Dialog open={showCreateDialog || !!editingPrompt} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingPrompt(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? t('promptLibrary.editPrompt') : t('promptLibrary.createPrompt')}
            </DialogTitle>
            <DialogDescription>
              {editingPrompt ? t('promptLibrary.editPromptDesc') : t('promptLibrary.createPromptDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-title">{t('promptLibrary.promptTitle')}</Label>
              <Input
                id="prompt-title"
                value={promptForm.title}
                onChange={(e) => setPromptForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('promptLibrary.promptTitlePlaceholder')}
                data-testid="input-prompt-title"
              />
            </div>
            
            <div>
              <Label htmlFor="prompt-content">{t('promptLibrary.promptContent')}</Label>
              <Textarea
                id="prompt-content"
                value={promptForm.content}
                onChange={(e) => setPromptForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('promptLibrary.promptContentPlaceholder')}
                className="min-h-[200px]"
                data-testid="textarea-prompt-content"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('promptLibrary.category')}</Label>
                <Select 
                  value={promptForm.category} 
                  onValueChange={(value) => setPromptForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-prompt-category">
                    <SelectValue placeholder={t('promptLibrary.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category.id)}
                          {t(category.label)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="is-public"
                  checked={promptForm.isPublic}
                  onCheckedChange={(checked) => setPromptForm(prev => ({ ...prev, isPublic: !!checked }))}
                  data-testid="checkbox-is-public"
                />
                <Label htmlFor="is-public" className="flex items-center gap-2">
                  {promptForm.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {t('promptLibrary.makePublic')}
                </Label>
              </div>
            </div>
            
            <div>
              <Label>{t('promptLibrary.tags')}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {promptForm.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS
                  .filter(tag => !promptForm.tags.includes(tag))
                  .map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateDialog(false);
                setEditingPrompt(null);
                resetForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
              disabled={createPromptMutation.isPending || updatePromptMutation.isPending}
              data-testid="button-save-prompt"
            >
              {(createPromptMutation.isPending || updatePromptMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingPrompt ? t('common.save') : t('promptLibrary.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Prompts Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('promptLibrary.importPrompts')}</DialogTitle>
            <DialogDescription>
              {t('promptLibrary.importPromptsDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">{t('promptLibrary.selectFile')}</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportFile}
                data-testid="input-import-file"
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('promptLibrary.importFormatNote')}
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={() => setShowImportDialog(false)}
              disabled={createPromptMutation.isPending}
            >
              {createPromptMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t('promptLibrary.import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (mode === 'page') {
    return <div className="container mx-auto px-4 py-8">{libraryContent}</div>;
  }

  if (mode === 'embedded') {
    return <div className="space-y-4">{libraryContent}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('promptLibrary.title')}</DialogTitle>
        </DialogHeader>
        {libraryContent}
      </DialogContent>
    </Dialog>
  );
}

// PromptCard component for displaying individual prompts
interface PromptCardProps {
  prompt: ExtendedPlaygroundPrompt;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onFork: () => void;
  onUse: () => void;
  getCategoryIcon: (categoryId: string) => JSX.Element;
  getCategoryLabel: (categoryId: string) => string;
  selectedPromptId?: string;
}

function PromptCard({ 
  prompt, 
  viewMode, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onFork, 
  onUse,
  getCategoryIcon,
  getCategoryLabel,
  selectedPromptId
}: PromptCardProps) {
  const { t } = useTranslation();
  const isActive = selectedPromptId === prompt.id;

  if (viewMode === 'list') {
    return (
      <Card className={`p-4 ${isActive ? 'ring-2 ring-primary' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              data-testid={`checkbox-select-${prompt.id}`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{prompt.title}</h3>
                {prompt.isPublic && <Globe className="w-4 h-4 text-muted-foreground" />}
                {prompt.parentId && <GitFork className="w-4 h-4 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {prompt.content.substring(0, 100)}...
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {prompt.category && (
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(prompt.category)}
                    {getCategoryLabel(prompt.category)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(prompt.updatedAt || prompt.createdAt || '').toLocaleDateString()}
                </div>
                {prompt.usageCount && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {prompt.usageCount}
                  </div>
                )}
              </div>
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prompt.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prompt.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUse}
              data-testid={`button-use-${prompt.id}`}
            >
              {t('promptLibrary.use')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFork}
              data-testid={`button-fork-${prompt.id}`}
            >
              <GitFork className="w-4 h-4" />
            </Button>
            {prompt.isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  data-testid={`button-edit-${prompt.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  data-testid={`button-delete-${prompt.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 h-full flex flex-col ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            data-testid={`checkbox-select-${prompt.id}`}
          />
          <div className="flex items-center gap-1 text-muted-foreground">
            {prompt.isPublic && <Globe className="w-4 h-4" />}
            {prompt.parentId && <GitFork className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {prompt.avgRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              <span className="text-xs">{prompt.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold mb-2 line-clamp-2">{prompt.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {prompt.content.substring(0, 150)}...
        </p>
        
        {prompt.category && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getCategoryIcon(prompt.category)}
              {getCategoryLabel(prompt.category)}
            </Badge>
          </div>
        )}
        
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(prompt.updatedAt || prompt.createdAt || '').toLocaleDateString()}
        </div>
        {prompt.usageCount && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {prompt.usageCount} {t('promptLibrary.uses')}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onUse}
          className="flex-1"
          data-testid={`button-use-${prompt.id}`}
        >
          {t('promptLibrary.use')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFork}
          data-testid={`button-fork-${prompt.id}`}
        >
          <GitFork className="w-4 h-4" />
        </Button>
        {prompt.isOwner && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              data-testid={`button-edit-${prompt.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              data-testid={`button-delete-${prompt.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}