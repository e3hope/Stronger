import React from 'react';
import { View, TouchableOpacity, TextInput, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../types';
import { Colors } from '../../colors';

// styles 구조는 호출자 styles에 맞춤 — 두 스크린의 비주얼 차이를 유지하기 위해
// 스타일 정의는 호출자에 남기고 prop으로 주입한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Styles = Record<string, any>;

interface ExerciseEditorProps {
  item: Exercise;
  isActive?: boolean;
  /** 플랫폼별 drag handle 요소를 상위가 주입 (native: TouchableOpacity, web: div) */
  dragHandle: React.ReactNode;
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

export default function ExerciseEditor({
  item,
  isActive,
  dragHandle,
  styles,
  updateExercise,
  removeExercise,
  handleSetInputChange,
  updateSetCount,
  removeSet,
}: ExerciseEditorProps) {
  return (
    <View
      style={[
        styles.exerciseCard,
        isActive && {
          borderColor: Colors.primary,
          borderWidth: 1,
          elevation: 5,
          shadowOpacity: 0.3,
          zIndex: 100,
          ...(Platform.OS === 'web' ? { zIndex: 999 } : {}),
        },
        Platform.OS === 'web' && ({ touchAction: 'none' } as any),
      ]}
    >
      <View
        style={[
          styles.exerciseHeader,
          isActive && { backgroundColor: Colors.blueLight },
        ]}
      >
        <View style={styles.exerciseTitleRow}>
          {dragHandle}
          <View style={styles.exerciseInfo}>
            <TextInput
              style={styles.exerciseNameInput}
              value={item.name}
              onChangeText={(text) => updateExercise(item.id, { name: text })}
              editable={!isActive}
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
          <Text style={[styles.setHeaderText, styles.setHeaderTextFixed]}>SET</Text>
          <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>KG</Text>
          <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>REPS</Text>
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
                    onPress={() => updateSetCount(item.id, item.sets.length + 1)}
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
              {idx !== 0 && <Ionicons name="close" size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
