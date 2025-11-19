import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConcepts, useDeleteConcept } from '@/hooks/useConcepts';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function ConceptsPage() {
  const { data: concepts, isLoading } = useConcepts();
  const deleteMutation = useDeleteConcept();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredConcepts = concepts?.filter((concept) => {
    const matchesSearch =
      concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && concept.published) ||
      (filter === 'draft' && !concept.published);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Concepts</h2>
            <p className="text-muted-foreground">
              Manage all educational concepts
            </p>
          </div>
          <Button onClick={() => navigate('/concepts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Concept
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('published')}
            >
              Published
            </Button>
            <Button
              variant={filter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('draft')}
            >
              Drafts
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredConcepts && filteredConcepts.length > 0 ? (
          <div className="grid gap-4">
            {filteredConcepts.map((concept) => (
              <Card key={concept.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{concept.title}</h3>
                      <Badge variant={concept.published ? 'success' : 'warning'}>
                        {concept.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {concept.description
                        ? truncateText(concept.description, 200)
                        : 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Updated {formatRelativeTime(concept.updatedAt)}</span>
                      {concept.displayOrder && (
                        <span>Order: {concept.displayOrder}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/concepts/${concept.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/concepts/${concept.id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(concept.id, concept.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No concepts found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first concept'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Button onClick={() => navigate('/concepts/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Concept
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
