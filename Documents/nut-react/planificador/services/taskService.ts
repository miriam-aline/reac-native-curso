import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/task';
import { supabase } from './supabase';

const TASKS_KEY = '@nutrition_tasks';
const USE_SUPABASE = true; // Cambia a false para usar AsyncStorage
const SUPABASE_RETRY_DELAY_MS = 60_000;

let supabaseDisabledUntil = 0;
let lastNetworkWarningAt = 0;

type TaskRow = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  due_date?: string;
  createdAt?: string;
  created_at?: string;
};

type SupabaseConnectionResult = {
  ok: boolean;
  message: string;
  count?: number;
};

const isMissingColumnError = (error: any): boolean =>
  error?.code === '42703' || /column .* does not exist/i.test(error?.message || '');

const mapTaskRow = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.dueDate ?? row.due_date ?? '',
  completed: row.completed,
  createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
});

const logSupabaseError = (context: string, error: any) => {
  if (isNetworkError(error)) return;

  const payload = {
    code: error?.code,
    message: error?.message || String(error),
    details: error?.details,
    hint: error?.hint,
    status: error?.status,
  };

  // Es warning porque existe fallback local y no debe romper la experiencia en desarrollo.
  console.warn(`${context}: ${JSON.stringify(payload)}`);
};

const isNetworkError = (error: any): boolean => {
  const message = String(error?.message || error || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  return message.includes('network request failed') || details.includes('network request failed');
};

const maybeLogSupabaseError = (context: string, error: any) => {
  // Cuando hay problema de red y ya usamos fallback local, evitamos spam de logs.
  if (isNetworkError(error)) return;
  logSupabaseError(context, error);
};

const canUseSupabase = (): boolean => Date.now() >= supabaseDisabledUntil;

const disableSupabaseTemporarily = () => {
  const now = Date.now();
  supabaseDisabledUntil = now + SUPABASE_RETRY_DELAY_MS;

  // Evita ruido en logs cuando la pantalla gana foco varias veces.
  if (now - lastNetworkWarningAt > 10_000) {
    console.warn(
      `Supabase temporalmente deshabilitado por error de red. Reintento en ${Math.ceil(
        SUPABASE_RETRY_DELAY_MS / 1000
      )}s.`
    );
    lastNetworkWarningAt = now;
  }
};

export const taskService = {
  async checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
    if (!USE_SUPABASE) {
      return {
        ok: false,
        message: 'Supabase está desactivado en la configuración actual.',
      };
    }

    try {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
          return {
            ok: false,
            message: 'Sin conexión entre la app y Supabase. Revisa internet o la red del dispositivo.',
          };
        }

        return {
          ok: false,
          message: error.message || 'No se pudo consultar la tabla tasks en Supabase.',
        };
      }

      return {
        ok: true,
        message: `Conexión correcta con Supabase. Registros detectados: ${count ?? 0}.`,
        count: count ?? 0,
      };
    } catch (error) {
      if (isNetworkError(error)) {
        disableSupabaseTemporarily();
        return {
          ok: false,
          message: 'Sin conexión entre la app y Supabase. Revisa internet o la red del dispositivo.',
        };
      }

      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Error inesperado al probar Supabase.',
      };
    }
  },

  // Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    if (USE_SUPABASE && canUseSupabase()) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) {
          if (isMissingColumnError(error)) {
            // Compatibilidad con esquemas en snake_case
            const { data: snakeData, error: snakeError } = await supabase
              .from('tasks')
              .select('*')
              .order('created_at', { ascending: false });

            if (snakeError) throw snakeError;
            return (snakeData || []).map((task: TaskRow) => mapTaskRow(task));
          }
          throw error;
        }

        return (data || []).map((task: TaskRow) => mapTaskRow(task));
      } catch (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
        }
        maybeLogSupabaseError('Error al obtener tareas de Supabase', error);
        // Fallback a AsyncStorage
        return this.getAllTasksLocal();
      }
    }
    return this.getAllTasksLocal();
  },

  // Método auxiliar para AsyncStorage
  async getAllTasksLocal(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener tareas locales:', error);
      return [];
    }
  },

  // Obtener una tarea por ID
  async getTaskById(id: string): Promise<Task | null> {
    if (USE_SUPABASE && canUseSupabase()) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        return data ? mapTaskRow(data as TaskRow) : null;
      } catch (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
        }
        maybeLogSupabaseError('Error al obtener tarea de Supabase', error);
        return this.getTaskByIdLocal(id);
      }
    }
    return this.getTaskByIdLocal(id);
  },

  async getTaskByIdLocal(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasksLocal();
      return tasks.find(task => task.id === id) || null;
    } catch (error) {
      console.error('Error al obtener tarea local:', error);
      return null;
    }
  },

  // Crear una nueva tarea
  async createTask(title: string, description: string, dueDate: string): Promise<Task> {
    if (USE_SUPABASE && canUseSupabase()) {
      try {
        const newTask = {
          title,
          description,
          dueDate,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        let { data, error } = await supabase
          .from('tasks')
          .insert(newTask)
          .select()
          .single();

        if (error && isMissingColumnError(error)) {
          const snakeTask = {
            title,
            description,
            due_date: dueDate,
            completed: false,
            created_at: new Date().toISOString(),
          };

          const retry = await supabase
            .from('tasks')
            .insert(snakeTask)
            .select()
            .single();

          data = retry.data;
          error = retry.error;
        }

        if (error) throw error;

        return mapTaskRow(data as TaskRow);
      } catch (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
        }
        maybeLogSupabaseError('Error al crear tarea en Supabase', error);
        return this.createTaskLocal(title, description, dueDate);
      }
    }
    return this.createTaskLocal(title, description, dueDate);
  },

  async createTaskLocal(title: string, description: string, dueDate: string): Promise<Task> {
    try {
      const tasks = await this.getAllTasksLocal();
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
      console.error('Error al crear tarea local:', error);
      throw error;
    }
  },

  // Actualizar una tarea
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (USE_SUPABASE && canUseSupabase()) {
      try {
        let { data, error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error && isMissingColumnError(error)) {
          const snakeUpdates: Record<string, any> = { ...updates };
          if (snakeUpdates.dueDate !== undefined) {
            snakeUpdates.due_date = snakeUpdates.dueDate;
            delete snakeUpdates.dueDate;
          }
          if (snakeUpdates.createdAt !== undefined) {
            snakeUpdates.created_at = snakeUpdates.createdAt;
            delete snakeUpdates.createdAt;
          }

          const retry = await supabase
            .from('tasks')
            .update(snakeUpdates)
            .eq('id', id)
            .select()
            .single();

          data = retry.data;
          error = retry.error;
        }

        if (error) throw error;

        return data ? mapTaskRow(data as TaskRow) : null;
      } catch (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
        }
        maybeLogSupabaseError('Error al actualizar tarea en Supabase', error);
        return this.updateTaskLocal(id, updates);
      }
    }
    return this.updateTaskLocal(id, updates);
  },

  async updateTaskLocal(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasksLocal();
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) return null;
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error al actualizar tarea local:', error);
      throw error;
    }
  },

  // Eliminar una tarea
  async deleteTask(id: string): Promise<boolean> {
    if (USE_SUPABASE && canUseSupabase()) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (error) {
        if (isNetworkError(error)) {
          disableSupabaseTemporarily();
        }
        maybeLogSupabaseError('Error al eliminar tarea en Supabase', error);
        return this.deleteTaskLocal(id);
      }
    }
    return this.deleteTaskLocal(id);
  },

  async deleteTaskLocal(id: string): Promise<boolean> {
    try {
      const tasks = await this.getAllTasksLocal();
      const filteredTasks = tasks.filter(task => task.id !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
      return true;
    } catch (error) {
      console.error('Error al eliminar tarea local:', error);
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
