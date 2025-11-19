import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentItemList } from '@/components/content/ContentItemList';
import { DraggableItem } from '@/components/drag-drop/DraggableItem';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionWithOrder } from '@/types';
import { useState } from 'react';

interface SectionEditorProps {
  section: SectionWithOrder;
  index: number;
  onUpdate: (updates: Partial<SectionWithOrder>) => void;
  onRemove: () => void;
  error?: any;
}

export function SectionEditor({
  section,
  index,
  onUpdate,
  onRemove,
  error,
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <DraggableItem id={section.tempId}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Badge variant="outline">Section {section.displayOrder}</Badge>
              {!isExpanded && section.heading && (
                <span className="text-sm font-medium truncate">{section.heading}</span>
              )}
              {!isExpanded && section.content.length > 0 && (
                <Badge variant="secondary">{section.content.length} items</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`section-heading-${index}`}>Section Heading *</Label>
              <Input
                id={`section-heading-${index}`}
                value={section.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                placeholder="e.g., Introduction to Color Theory"
                maxLength={200}
              />
              {error?.heading && (
                <p className="text-sm text-destructive">{error.heading}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {section.heading.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`section-order-${index}`}>Display Order (Optional)</Label>
              <Input
                id={`section-order-${index}`}
                type="number"
                min="1"
                value={section.displayOrder}
                onChange={(e) =>
                  onUpdate({ displayOrder: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="pt-4 border-t">
              <ContentItemList
                items={section.content}
                onChange={(content) => onUpdate({ content })}
                errors={error?.content}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </DraggableItem>
  );
}
