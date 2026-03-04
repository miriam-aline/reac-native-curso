import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskCard = ({ task, onPress, onToggle, onDelete }: TaskCardProps) => {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggle}
          activeOpacity={0.6}
        >
          <MaterialIcons
            name={task.completed ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={task.completed ? '#10B981' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedText,
            ]}
          >
            {task.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
          <Text
            style={[
              styles.dueDate,
              isOverdue && styles.overdueText,
            ]}
          >
            {new Date(task.dueDate).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        activeOpacity={0.6}
      >
        <MaterialIcons name="delete" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    paddingTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 8,
  },
});
