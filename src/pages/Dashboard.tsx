import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConcepts } from '@/hooks/useConcepts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export function Dashboard() {
  const { data: concepts, isLoading } = useConcepts();
  const navigate = useNavigate();

  const publishedCount = concepts?.filter(c => c.published).length || 0;
  const draftCount = concepts?.filter(c => !c.published).length || 0;
  const totalCount = concepts?.length || 0;

  const recentConcepts = concepts
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Manage educational stage lighting content
            </p>
          </div>
          <Button onClick={() => navigate('/concepts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Concept
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">
                All concepts in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
              <p className="text-xs text-muted-foreground">
                Available to mobile app
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
              <p className="text-xs text-muted-foreground">
                Not yet published
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Concepts</CardTitle>
            <CardDescription>
              Recently updated concepts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : recentConcepts.length > 0 ? (
              <div className="space-y-3">
                {recentConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent"
                    onClick={() => navigate(`/concepts/${concept.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{concept.title}</h3>
                        {concept.published ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {concept.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {formatRelativeTime(concept.updatedAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">No concepts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first concept
                </p>
                <Button onClick={() => navigate('/concepts/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Concept
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
