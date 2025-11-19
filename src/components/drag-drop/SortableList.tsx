import { DndContext, closestCenter, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface SortableListProps<T extends { tempId: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function SortableList<T extends { tempId: string }>({
  items,
  onReorder,
  children,
  className,
}: SortableListProps<T>) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.tempId === active.id);
    const newIndex = items.findIndex((item) => item.tempId === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);

    // Update displayOrder
    const reordered = newItems.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));

    onReorder(reordered as T[]);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.tempId)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => children(item, index))}
        </div>
      </SortableContext>
      <DragOverlay />
    </DndContext>
  );
}
