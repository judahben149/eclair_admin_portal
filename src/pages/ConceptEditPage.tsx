import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConceptForm } from '@/components/concepts/ConceptForm';
import { useConcept } from '@/hooks/useConcepts';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ConceptEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: concept, isLoading, error } = useConcept(Number(id));

  if (isEdit && isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (isEdit && error) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load concept. Please try again or go back to the concepts list.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (isEdit && !concept) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Concept not found. It may have been deleted.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConceptForm concept={concept} isEdit={isEdit} />
    </AppLayout>
  );
}
