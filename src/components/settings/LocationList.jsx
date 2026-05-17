import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function DragHandle(props) {
  return (
    <div
      className="text-[var(--color-text-3)] cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      {...props}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect y="3" width="16" height="1.5" rx="1"/>
        <rect y="7.25" width="16" height="1.5" rx="1"/>
        <rect y="11.5" width="16" height="1.5" rx="1"/>
      </svg>
    </div>
  );
}

function SortableRow({ item, onRemove, isOnly }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] last:border-0"
    >
      <DragHandle {...attributes} {...listeners} />

      <span className="flex-1 text-sm font-medium text-[var(--color-text)] truncate">
        {item.name}
        {item.label && item.label !== item.name && (
          <span className="block text-xs text-[var(--color-text-3)] font-normal truncate">
            {item.label}
          </span>
        )}
      </span>

      <button
        onClick={() => onRemove(item.id)}
        disabled={isOnly}
        className="w-6 h-6 rounded-full bg-[#D94F4F] flex items-center justify-center disabled:opacity-30 flex-shrink-0"
        aria-label="Supprimer"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="2" y1="2" x2="8" y2="8"/>
          <line x1="8" y1="2" x2="2" y2="8"/>
        </svg>
      </button>
    </div>
  );
}

export default function LocationList({ items, onRemove, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              onRemove={onRemove}
              isOnly={items.length <= 1}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
