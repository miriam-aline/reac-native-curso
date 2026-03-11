# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración de Supabase](#configuración-de-supabase)
- [Ejecutar la App](#ejecutar-la-app)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Recursos](#recursos)

## 🚀 Instalación

1. **Instalar dependencias**

   ```bash
   npm install
   ```

## 🗄️ Configuración de Supabase

Esta app está configurada para usar **Supabase** como base de datos. Sigue estos pasos:

### Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu **URL del proyecto** y **anon key**

### Paso 2: Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:

   ```bash
   copy .env.example .env
   ```

2. Edita `.env` y reemplaza con tus credenciales:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_publica
   ```

### Paso 3: Crear tablas en Supabase

1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `database.sql` de este proyecto
4. Copia todo el contenido
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** para ejecutar el script

El script creará automáticamente:

- ✅ Tabla `tasks` (Tareas)
- ✅ Tabla `weekly_menus` (Menús semanales)
- ✅ Tabla `user_profiles` (Perfiles de usuario)
- ✅ Políticas RLS (Row Level Security)
- ✅ Índices para búsquedas rápidas

### Paso 4: Verificar la configuración

La app está configurada con **fallback automático** a AsyncStorage si Supabase falla.

Para cambiar entre Supabase y AsyncStorage:

- Abre `services/taskService.ts` y `services/menuService.ts`
- Cambia `const USE_SUPABASE = true` a `false` para usar solo AsyncStorage

## 📱 Ejecutar la App

Inicia el servidor de desarrollo:

```bash
npx expo start
```

En la salida, encontrarás opciones para abrir la app en:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - sandbox limitado para probar desarrollo con Expo

Puedes empezar a desarrollar editando archivos dentro del directorio **app**. Este proyecto usa [file-based routing](https://docs.expo.dev/ryouter/introduction).

## 📂 Estructura del Proyecto

```
planificador/
├── app/                    # Pantallas y navegación (Expo Router)
│   ├── (tabs)/            # Tabs de navegación
│   │   ├── calories.tsx   # Calculadora de calorías
│   │   ├── create.tsx     # Crear tareas
│   │   ├── explore.tsx    # Explorar
│   │   ├── index.tsx      # Inicio
│   │   └── weekly-menu.tsx # Menús semanales
│   ├── menu/[id].tsx      # Detalle de menú
│   └── task/[id].tsx      # Detalle de tarea
├── components/            # Componentes reutilizables
├── services/              # Servicios de datos
│   ├── supabase.ts       # 🆕 Cliente de Supabase
│   ├── taskService.ts    # ✅ Migrado a Supabase
│   ├── menuService.ts    # ✅ Migrado a Supabase
│   ├── userService.ts    # Servicio de usuario
│   └── ...
├── types/                 # Tipos TypeScript
├── .env                   # 🆕 Variables de entorno (no subir a Git)
├── .env.example          # 🆕 Plantilla de variables
└── database.sql          # 🆕 Schema SQL para Supabase
```

## 🔧 Características

- ✅ **Gestión de Tareas**: Crear, editar, eliminar tareas
- ✅ **Menús Semanales**: Planificar comidas por día
- ✅ **Calculadora de Calorías**: Calcular necesidades calóricas
- ✅ **Perfil de Usuario**: Guardar datos personales
- ✅ **Base de Datos**: Supabase con fallback a AsyncStorage
- ✅ **Sincronización**: Datos en la nube compartidos entre dispositivos

## 🔒 Seguridad y Producción

⚠️ **IMPORTANTE**: El proyecto actual tiene políticas RLS configuradas para **acceso público** (ideal para desarrollo y pruebas).

### Para producción:

1. **Habilitar Autenticación de Supabase**:

   ```bash
   npm install @supabase/auth-helpers-react-native
   ```

2. **Actualizar políticas RLS** en Supabase para restricción por usuario:

   ```sql
   -- Ejemplo: Solo el usuario autenticado ve sus tareas
   DROP POLICY IF EXISTS "tasks_public_select" ON tasks;
   CREATE POLICY "tasks_auth_select" ON tasks
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Agregar columna `user_id`** a todas las tablas
4. **Implementar login/registro** en la app

## 🛠️ Comandos Útiles

### Desarrollo

```bash
npm start              # Iniciar Expo
npm run android       # Abrir en Android
npm run ios           # Abrir en iOS
npm run web           # Abrir en navegador
```

### Base de Datos

Ver logs de Supabase:

- Dashboard > Logs > Real-time logs

Explorar datos:

- Dashboard > Table Editor

## 🐛 Solución de Problemas

### Error: "Faltan las credenciales de Supabase"

- Verifica que `.env` existe y tiene las variables correctas
- Reinicia el servidor Expo: presiona `r` en la terminal

### Los datos no se guardan en Supabase

1. Revisa que las tablas existan en Supabase (Table Editor)
2. Verifica las políticas RLS (Authentication > Policies)
3. Revisa la consola del navegador/app para errores
4. Si es necesario, cambia `USE_SUPABASE = false` para usar AsyncStorage

### Cambiar entre Supabase y AsyncStorage

Edita estas líneas en los servicios:

```typescript
// services/taskService.ts
const USE_SUPABASE = true; // Cambiar a false

// services/menuService.ts
const USE_SUPABASE = true; // Cambiar a false
```

## 📚 Recursos

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)
- [Supabase documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🤝 Comunidad

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
- [Supabase Discord](https://discord.supabase.com)

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#-solución-de-problemas) o abre un issue en el repositorio.
