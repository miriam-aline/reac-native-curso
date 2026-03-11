import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, loading, deleteTask, toggleTask } = useTasks();

  const handleDeleteTask = (id: string, title: string) => {
    Alert.alert(
      'Eliminar tarea',
      `¿Estás seguro de que deseas eliminar "${title}"?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteTask(id);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="task-alt" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tienes tareas aún</Text>
          <Text style={styles.emptySubtext}>
            Crea una nueva tarea para comenzar a planificar tu nutrición
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.filter(t => t.completed).length}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.filter(t => !t.completed).length}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => router.push(`/task/${item.id}`)}
                onToggle={() => toggleTask(item.id)}
                onDelete={() => handleDeleteTask(item.id, item.title)}
              />
            )}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<Text style={styles.listTitle}>Mis Tareas</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
});
