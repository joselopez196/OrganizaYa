-- ==========================================================
-- OrganizaYa (TaskFlow Hub) - Esquema de Base de Datos
-- Compatible con PostgreSQL y Supabase
-- ==========================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Estado Global / Sincronización Multidispositivo
CREATE TABLE IF NOT EXISTS public.ms_state (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(40) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  color VARCHAR(16) NOT NULL DEFAULT '#5b3df5',
  due DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'activo', -- activo, pausado, terminado
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(40) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id VARCHAR(40) REFERENCES public.projects(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  due DATE,
  due_time VARCHAR(8),
  priority INT NOT NULL DEFAULT 0, -- 0: baja, 1: media, 2: alta
  note TEXT,
  recurrence VARCHAR(10), -- dia, sem, mes
  done BOOLEAN NOT NULL DEFAULT FALSE,
  done_at DATE,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Metadatos de Archivos
CREATE TABLE IF NOT EXISTS public.files (
  id VARCHAR(40) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id VARCHAR(40) REFERENCES public.projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  mime_type VARCHAR(100),
  kind VARCHAR(20) NOT NULL DEFAULT 'otro', -- img, vid, pres, otro
  ext VARCHAR(10),
  cloud_asset_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.tasks(due);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);

-- Función de actualización automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de actualización
DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_projects ON public.projects;
CREATE TRIGGER set_updated_at_projects
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tasks ON public.tasks;
CREATE TRIGGER set_updated_at_tasks
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
