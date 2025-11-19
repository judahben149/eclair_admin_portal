import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SectionList } from '@/components/sections/SectionList';
import { useCreateConcept, useUpdateConcept } from '@/hooks/useConcepts';
import { conceptSchema } from '@/lib/validations';
import { Concept, ConceptRequest, SectionWithOrder, ContentItemWithOrder } from '@/types';
import { generateTempId } from '@/lib/utils';
import { Save, Eye, AlertCircle, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ConceptFormProps {
  concept?: Concept;
  isEdit?: boolean;
}

export function ConceptForm({ concept, isEdit = false }: ConceptFormProps) {
  const navigate = useNavigate();
  const createMutation = useCreateConcept();
  const updateMutation = useUpdateConcept(concept?.id || 0);
  const [sections, setSections] = useState<SectionWithOrder[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      title: concept?.title || '',
      description: concept?.description || '',
      displayOrder: undefined,
      published: false,
    },
  });

  const watchedValues = watch();

  // Initialize sections from existing concept
  useEffect(() => {
    if (concept?.sections) {
      const sectionsWithOrder: SectionWithOrder[] = concept.sections.map((section, index) => ({
        ...section,
        tempId: section.id?.toString() || generateTempId(),
        displayOrder: index + 1,
        content: section.content.map((item, itemIndex): ContentItemWithOrder => ({
          ...item,
          tempId: generateTempId(),
          displayOrder: itemIndex + 1,
        })),
      }));
      setSections(sectionsWithOrder);
    }
  }, [concept]);

  // Autosave to localStorage
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        const draft = {
          ...watchedValues,
          sections,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('concept-draft', JSON.stringify(draft));
        setLastSaved(new Date());
        toast.success('Draft saved automatically', { duration: 1000 });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autosaveInterval);
  }, [watchedValues, sections, hasUnsavedChanges]);

  // Detect changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [watchedValues, sections]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('concept-draft');
    if (savedDraft && !isEdit) {
      const shouldRecover = window.confirm(
        'A draft was found. Would you like to recover it?'
      );
      if (shouldRecover) {
        try {
          const draft = JSON.parse(savedDraft);
          setValue('title', draft.title);
          setValue('description', draft.description);
          setValue('displayOrder', draft.displayOrder);
          setValue('published', draft.published);
          if (draft.sections) {
            setSections(draft.sections);
          }
          toast.success('Draft recovered successfully');
        } catch (error) {
          console.error('Failed to recover draft:', error);
          toast.error('Failed to recover draft');
        }
      }
    }
  }, [isEdit, setValue]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (data: any) => {
    try {
      // Convert sections to API format
      const sectionsRequest = sections.map((section, index) => ({
        heading: section.heading,
        displayOrder: section.displayOrder || index + 1,
        content: section.content.map((item, itemIndex) => ({
          type: item.type,
          value: item.value,
          displayOrder: item.displayOrder || itemIndex + 1,
        })),
      }));

      const conceptData: ConceptRequest = {
        title: data.title,
        description: data.description || undefined,
        displayOrder: data.displayOrder || undefined,
        published: data.published || false,
        sections: sectionsRequest.length > 0 ? sectionsRequest : undefined,
      };

      if (isEdit && concept) {
        await updateMutation.mutateAsync(conceptData);
        localStorage.removeItem('concept-draft');
        setHasUnsavedChanges(false);
        navigate(`/concepts/${concept.id}`);
      } else {
        const newConcept = await createMutation.mutateAsync(conceptData);
        localStorage.removeItem('concept-draft');
        setHasUnsavedChanges(false);
        navigate(`/concepts/${newConcept.id}`);
      }
    } catch (error) {
      console.error('Failed to save concept:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!shouldLeave) return;
    }
    navigate('/concepts');
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEdit ? 'Edit Concept' : 'Create New Concept'}</CardTitle>
              <CardDescription>
                {isEdit
                  ? 'Update the concept details and content'
                  : 'Fill in the details to create a new educational concept'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <Badge variant="outline" className="text-xs">
                  <Check className="mr-1 h-3 w-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Color Theory in Stage Lighting"
                maxLength={200}
                disabled={isPending}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message as string}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedValues.title?.length || 0}/200 characters
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this concept..."
                rows={3}
                maxLength={1000}
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message as string}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedValues.description?.length || 0}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order (Optional)</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                {...register('displayOrder', { valueAsNumber: true })}
                placeholder="Leave empty for auto-assignment"
                disabled={isPending}
              />
              {errors.displayOrder && (
                <p className="text-sm text-destructive">{errors.displayOrder.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="published" className="flex items-center gap-2">
                Published Status
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="published"
                  type="checkbox"
                  {...register('published')}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isPending}
                />
                <Label htmlFor="published" className="font-normal cursor-pointer">
                  Publish this concept (make it available to mobile app)
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? 'Saving...' : isEdit ? 'Update Concept' : 'Create Concept'}
            </Button>
            {isEdit && concept && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/concepts/${concept.id}`)}
                disabled={isPending}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Content Sections</CardTitle>
          <CardDescription>
            Organize your content into sections with text and images. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionList
            sections={sections}
            onChange={setSections}
            errors={errors.sections as any}
          />
        </CardContent>
      </Card>

      {/* Help */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tips:</strong>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Your work is automatically saved every 30 seconds</li>
            <li>Use markdown for rich text formatting in content items</li>
            <li>Drag sections and content items to reorder them</li>
            <li>Images should be publicly accessible URLs</li>
            <li>Click "Preview" to see how your concept will look</li>
          </ul>
        </AlertDescription>
      </Alert>
    </form>
  );
}
