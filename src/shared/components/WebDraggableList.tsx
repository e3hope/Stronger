import React from 'react';
import { Exercise } from '../../types';
import { Colors } from '../../colors';
import { Ionicons } from '@expo/vector-icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ExerciseEditor from './ExerciseEditor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Styles = Record<string, any>;

interface WebSortableItemProps {
  id: string;
  item: Exercise;
  styles: Styles;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  handleSetInputChange: (
    exId: string,
    setId: string,
    field: 'weight' | 'reps',
    text: string,
  ) => void;
  updateSetCount: (exId: string, count: number) => void;
  removeSet: (exId: string, setId: string) => void;
}

function WebSortableItem({
  id,
  item,
  styles,
  updateExercise,
  removeExercise,
  handleSetInputChange,
  updateSetCount,
  removeSet,
}: WebSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const wrapperStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    touchAction: 'none',
  };

  const dragHandle = (
    <div
      {...attributes}
      {...listeners}
      style={{
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        touchAction: 'none',
      }}
    >
      <Ionicons
        name="reorder-three"
        size={22}
        color={isDragging ? Colors.primary : '#888'}
      />
    </div>
  );

  return (
    <div ref={setNodeRef} style={wrapperStyle}>
      <ExerciseEditor
        item={item}
        isActive={isDragging}
        dragHandle={dragHandle}
        styles={styles}
        updateExercise={updateExercise}
        removeExercise={removeExercise}
        handleSetInputChange={handleSetInputChange}
        updateSetCount={updateSetCount}
        removeSet={removeSet}
      />
    </div>
  );
}

interface WebDraggableListProps {
  data: Exercise[];
  styles: Styles;
  onDragEnd: (data: Exercise[]) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  handleSetInputChange: (
    exId: string,
    setId: string,
    field: 'weight' | 'reps',
    text: string,
  ) => void;
  updateSetCount: (exId: string, count: number) => void;
  removeSet: (exId: string, setId: string) => void;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
}

export default function WebDraggableList({
  data,
  styles,
  onDragEnd,
  updateExercise,
  removeExercise,
  handleSetInputChange,
  updateSetCount,
  removeSet,
  ListHeaderComponent,
  ListEmptyComponent,
}: WebDraggableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor),
    useSensor(MouseSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      onDragEnd(arrayMove(data, oldIndex, newIndex));
    }
  };

  return (
    <div
      style={{ padding: 16, paddingBottom: 100, overflowY: 'auto', height: '100%' }}
    >
      {ListHeaderComponent}

      {data.length === 0 ? (
        ListEmptyComponent
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map((ex) => ex.id)}
            strategy={verticalListSortingStrategy}
          >
            {data.map((item) => (
              <WebSortableItem
                key={item.id}
                id={item.id}
                item={item}
                styles={styles}
                updateExercise={updateExercise}
                removeExercise={removeExercise}
                handleSetInputChange={handleSetInputChange}
                updateSetCount={updateSetCount}
                removeSet={removeSet}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
