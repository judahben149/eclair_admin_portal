import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useConcept } from '@/hooks/useConcepts';
import { ArrowLeft, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export function ConceptViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: concept, isLoading } = useConcept(Number(id));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!concept) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Concept Not Found</h2>
          <p className="text-muted-foreground mb-4">The concept you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/concepts')}>Back to Concepts</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/concepts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Concepts
          </Button>
          <Button onClick={() => navigate(`/concepts/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Concept
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold">{concept.title}</h1>
            <Badge variant="outline">v{concept.version}</Badge>
          </div>
          {concept.description && (
            <p className="text-lg text-muted-foreground">{concept.description}</p>
          )}
        </div>

        {concept.sections && concept.sections.length > 0 ? (
          <div className="space-y-6">
            {concept.sections.map((section, index) => (
              <Card key={section.id || index}>
                <CardHeader>
                  <CardTitle>{section.heading}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {item.type === 'text' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {item.value}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={item.value}
                            alt="Content"
                            className="w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No sections yet. Edit this concept to add content.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
