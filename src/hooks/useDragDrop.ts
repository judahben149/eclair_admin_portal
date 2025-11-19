import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface DraggableItem {
  tempId: string;
  displayOrder: number;
}

export function useDragDrop<T extends DraggableItem>() {
  const handleDragEnd = (
    event: DragEndEvent,
    items: T[],
    onReorder: (reorderedItems: T[]) => void
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.tempId === active.id);
    const newIndex = items.findIndex((item) => item.tempId === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(items, oldIndex, newIndex);

    // Update displayOrder based on new positions
    const updated = reordered.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));

    onReorder(updated as T[]);
  };

  return { handleDragEnd };
}
