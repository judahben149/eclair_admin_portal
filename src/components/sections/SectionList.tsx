import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionEditor } from './SectionEditor';
import { SortableList } from '@/components/drag-drop/SortableList';
import { Plus } from 'lucide-react';
import { SectionWithOrder } from '@/types';
import { generateTempId } from '@/lib/utils';

interface SectionListProps {
  sections: SectionWithOrder[];
  onChange: (sections: SectionWithOrder[]) => void;
  errors?: any[];
}

export function SectionList({ sections, onChange, errors }: SectionListProps) {
  const addSection = () => {
    const newSection: SectionWithOrder = {
      heading: '',
      content: [],
      tempId: generateTempId(),
      displayOrder: sections.length + 1,
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<SectionWithOrder>) => {
    const updated = sections.map((section, i) =>
      i === index ? { ...section, ...updates } : section
    );
    onChange(updated);
  };

  const removeSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    const reordered = updated.map((section, i) => ({
      ...section,
      displayOrder: i + 1,
    }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Sections</Label>
        <Button type="button" variant="outline" onClick={addSection}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p className="mb-4">No sections yet. Add your first section to get started.</p>
          <Button type="button" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </Card>
      ) : (
        <SortableList items={sections} onReorder={onChange} className="space-y-4">
          {(section, index) => (
            <SectionEditor
              key={section.tempId}
              section={section}
              index={index}
              onUpdate={(updates) => updateSection(index, updates)}
              onRemove={() => removeSection(index)}
              error={errors?.[index]}
            />
          )}
        </SortableList>
      )}
    </div>
  );
}
