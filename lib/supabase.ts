import { createClient } from "@supabase/supabase-js"

// Obtener las variables de entorno
const supabaseUrl = "https://ertoehddvhkyryzpjqrv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydG9laGRkdmhreXJ5enBqcXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjAyMTUsImV4cCI6MjA1ODA5NjIxNX0.vrdmzvnPd-mdu_udcCEqu_B5KEABAa8bdFiM_fkxUUM"

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Variables de entorno de Supabase no definidas")
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")

// Tipo para la tabla Usuarios
export type Usuario = {
  id: number
  Nombre: string
  Contraseña: string
}

// Función para verificar la conexión
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("Usuarios").select("*").limit(1)
    if (error) {
      return {
        success: false,
        message: error.message,
        details: error,
      }
    }
    return {
      success: true,
      message: "Conexión exitosa",
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      details: error,
    }
  }
}

