import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';
import { useFocusEffect } from '@react-navigation/native';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar tareas cuando el componente se monta o se enfoca
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description: string, dueDate: string) => {
    try {
      const newTask = await taskService.createTask(title, description, dueDate);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await taskService.updateTask(id, updates);
      if (updated) {
        setTasks(tasks.map(t => t.id === id ? updated : t));
      }
      return updated;
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const updated = await taskService.toggleTask(id);
      if (updated) {
        setTasks(tasks.map(t => t.id === id ? updated : t));
      }
      return updated;
    } catch (error) {
      console.error('Error alternando tarea:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reloadTasks: loadTasks,
  };
};
