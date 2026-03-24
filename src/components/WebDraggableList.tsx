import React, { useRef } from 'react';
import { View, Platform, TouchableOpacity, TextInput, Text } from 'react-native';
import { Exercise } from '../types';
import { styles } from '../screens/DailyDetailScreen.styles';
import { Colors } from '../colors';
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

interface WebSortableItemProps {
  id: string;
  item: Exercise;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  handleSetInputChange: (exId: string, setId: string, field: 'weight' | 'reps', text: string) => void;
  updateSetCount: (exId: string, count: number) => void;
  removeSet: (exId: string, setId: string) => void;
}

function WebSortableItem({
  id,
  item,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <View
        style={[
          styles.exerciseCard,
          isDragging && {
            borderColor: Colors.primary,
            borderWidth: 1,
            elevation: 5,
            shadowOpacity: 0.3,
            zIndex: 999,
          },
        ]}
      >
        <View
          style={styles.exerciseHeader}
        >
          <View style={styles.exerciseTitleRow}>
            {/* Drag Handle */}
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

            <View style={styles.exerciseInfo}>
              <TextInput
                style={styles.exerciseNameInput}
                value={item.name}
                onChangeText={(text) => updateExercise(item.id, { name: text })}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => removeExercise(item.id)}
            style={styles.exerciseDeleteButton}
          >
            <Ionicons name="close" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.setsContainer}>
          <View style={styles.setHeaderRow}>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFixed]}>
              SET
            </Text>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>
              KG
            </Text>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>
              REPS
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          {item.sets.map((set, idx) => (
            <View key={set.id} style={styles.setRow}>
              <View style={styles.setIndexContainer}>
                {idx === 0 ? (
                  <View style={styles.setControlContainer}>
                    <TouchableOpacity
                      style={styles.setControlButton}
                      onPress={() =>
                        updateSetCount(item.id, Math.max(1, item.sets.length - 1))
                      }
                    >
                      <Ionicons name="remove" size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.setCountText}>1</Text>
                    <TouchableOpacity
                      style={styles.setControlButton}
                      onPress={() =>
                        updateSetCount(item.id, item.sets.length + 1)
                      }
                    >
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.setNumber}>{idx + 1}</Text>
                )}
              </View>
              <TextInput
                style={[styles.setInput, styles.setInputLayout]}
                keyboardType="numeric"
                value={set.weight === 0 ? '' : set.weight.toString()}
                placeholder="0"
                placeholderTextColor="#666"
                onChangeText={(text) =>
                  handleSetInputChange(item.id, set.id, 'weight', text)
                }
              />
              <TextInput
                style={[styles.setInput, styles.setInputLayout]}
                keyboardType="numeric"
                value={set.reps === 0 ? '' : set.reps.toString()}
                placeholder="0"
                placeholderTextColor="#666"
                onChangeText={(text) =>
                  handleSetInputChange(item.id, set.id, 'reps', text)
                }
              />
              <TouchableOpacity
                style={styles.removeSetButton}
                onPress={() => removeSet(item.id, set.id)}
              >
                {idx !== 0 && (
                  <Ionicons name="close" size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </div>
  );
}

interface WebDraggableListProps {
  data: Exercise[];
  onDragEnd: (data: Exercise[]) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  handleSetInputChange: (exId: string, setId: string, field: 'weight' | 'reps', text: string) => void;
  updateSetCount: (exId: string, count: number) => void;
  removeSet: (exId: string, setId: string) => void;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
}

export default function WebDraggableList({
  data,
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
    useSensor(MouseSensor)
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
    <div style={{ padding: 16, paddingBottom: 100, overflowY: 'auto', height: '100%' }}>
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
