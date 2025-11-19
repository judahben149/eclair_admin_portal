import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from './MarkdownEditor';
import { ImageUrlInput } from './ImageUrlInput';
import { DraggableItem } from '@/components/drag-drop/DraggableItem';
import { SortableList } from '@/components/drag-drop/SortableList';
import { Trash2, Plus, Image, Type, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentItemWithOrder, ContentType } from '@/types';
import { generateTempId } from '@/lib/utils';
import { useState } from 'react';

interface ContentItemListProps {
  items: ContentItemWithOrder[];
  onChange: (items: ContentItemWithOrder[]) => void;
  errors?: any[];
}

export function ContentItemList({ items, onChange, errors }: ContentItemListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.map((item) => item.tempId))
  );

  const addContentItem = (type: ContentType) => {
    const newItem: ContentItemWithOrder = {
      type,
      value: '',
      tempId: generateTempId(),
      displayOrder: items.length + 1,
    };
    onChange([...items, newItem]);
    setExpandedItems(new Set([...expandedItems, newItem.tempId]));
  };

  const updateContentItem = (index: number, updates: Partial<ContentItemWithOrder>) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange(updated);
  };

  const removeContentItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({
      ...item,
      displayOrder: i + 1,
    }));
    onChange(reordered);
  };

  const toggleExpanded = (tempId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(tempId)) {
      newExpanded.delete(tempId);
    } else {
      newExpanded.add(tempId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Content Items</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addContentItem('text')}
          >
            <Type className="mr-2 h-4 w-4" />
            Add Text
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addContentItem('image')}
          >
            <Image className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No content items yet. Add text or images to get started.</p>
        </Card>
      ) : (
        <SortableList items={items} onReorder={onChange}>
          {(item, index) => {
            const isExpanded = expandedItems.has(item.tempId);
            const error = errors?.[index];

            return (
              <DraggableItem key={item.tempId} id={item.tempId}>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === 'text' ? 'default' : 'secondary'}>
                          {item.type === 'text' ? (
                            <>
                              <Type className="mr-1 h-3 w-3" />
                              Text
                            </>
                          ) : (
                            <>
                              <Image className="mr-1 h-3 w-3" />
                              Image
                            </>
                          )}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Order: {item.displayOrder}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(item.tempId)}
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
                          onClick={() => removeContentItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2">
                        {item.type === 'text' ? (
                          <div>
                            <Label>Markdown Content</Label>
                            <MarkdownEditor
                              value={item.value}
                              onChange={(value) =>
                                updateContentItem(index, { value })
                              }
                              placeholder="Write your content using markdown..."
                            />
                            {error?.value && (
                              <p className="text-sm text-destructive mt-1">
                                {error.value}
                              </p>
                            )}
                          </div>
                        ) : (
                          <ImageUrlInput
                            value={item.value}
                            onChange={(value) =>
                              updateContentItem(index, { value })
                            }
                            label="Image URL"
                            error={error?.value}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </DraggableItem>
            );
          }}
        </SortableList>
      )}
    </div>
  );
}
