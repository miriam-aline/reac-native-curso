import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/task';

const TASKS_KEY = '@nutrition_tasks';

export const taskService = {
  // Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  },

  // Obtener una tarea por ID
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.find(task => task.id === id) || null;
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      return null;
    }
  },

  // Crear una nueva tarea
  async createTask(title: string, description: string, dueDate: string): Promise<Task> {
    try {
      const tasks = await this.getAllTasks();
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  },

  // Actualizar una tarea
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) return null;
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw error;
    }
  },

  // Eliminar una tarea
  async deleteTask(id: string): Promise<boolean> {
    try {
      const tasks = await this.getAllTasks();
      const filteredTasks = tasks.filter(task => task.id !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
      return true;
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      throw error;
    }
  },

  // Marcar tarea como completada
  async toggleTask(id: string): Promise<Task | null> {
    try {
      const task = await this.getTaskById(id);
      if (!task) return null;
      return this.updateTask(id, { completed: !task.completed });
    } catch (error) {
      console.error('Error al alternar tarea:', error);
      throw error;
    }
  },
};
