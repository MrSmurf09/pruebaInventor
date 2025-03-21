"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCardIcon as CardIcon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    contraseña: "",
  })
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showRLSError, setShowRLSError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setDebugInfo(null)
    setShowRLSError(false)

    try {
      // Log connection info
      console.log("Conectando a Supabase...")
      setDebugInfo("Conectando a Supabase...")

      // Verificar si el nombre de usuario ya existe
      const { data: existingUsers, error: checkError } = await supabase
        .from("Usuarios")
        .select("Nombre")
        .eq("Nombre", formData.nombre)
        .limit(1)

      if (checkError) {
        console.error("Error al verificar usuario existente:", checkError)
        setDebugInfo(`Error al verificar usuario: ${checkError.message}`)

        // Verificar si es un error de RLS
        if (checkError.message.includes("row-level security") || checkError.message.includes("policy")) {
          setShowRLSError(true)
        }

        throw checkError
      }

      console.log("Verificación de usuario existente completada")
      setDebugInfo((prev) => `${prev}\nVerificación de usuario completada`)

      if (existingUsers && existingUsers.length > 0) {
        setDebugInfo((prev) => `${prev}\nUsuario ya existe`)
        throw new Error("Este nombre de usuario ya está en uso")
      }

      // Insertar nuevo usuario en la tabla Usuarios
      console.log("Intentando insertar usuario...")
      setDebugInfo((prev) => `${prev}\nIntentando insertar usuario...`)

      const { data: insertData, error: insertError } = await supabase
        .from("Usuarios")
        .insert([
          {
            Nombre: formData.nombre,
            Contraseña: formData.contraseña,
          },
        ])
        .select()

      if (insertError) {
        console.error("Error al insertar usuario:", insertError)
        setDebugInfo((prev) => `${prev}\nError al insertar: ${insertError.message}`)

        // Verificar si es un error de RLS
        if (insertError.message.includes("row-level security") || insertError.message.includes("policy")) {
          setShowRLSError(true)
        }

        throw insertError
      }

      console.log("Usuario insertado correctamente:", insertData)
      setDebugInfo((prev) => `${prev}\nUsuario insertado correctamente`)

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Error completo:", error)
      toast({
        title: "Error al registrarse",
        description: error.message || "Ha ocurrido un error al crear tu cuenta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para probar la conexión a Supabase
  const testConnection = async () => {
    try {
      setDebugInfo("Probando conexión a Supabase...")
      const { data, error } = await supabase.from("Usuarios").select("*").limit(1)

      if (error) {
        setDebugInfo(`Error de conexión: ${error.message}`)

        // Verificar si es un error de RLS
        if (error.message.includes("row-level security") || error.message.includes("policy")) {
          setShowRLSError(true)
        }

        return
      }

      setDebugInfo(`Conexión exitosa. Datos recibidos: ${JSON.stringify(data)}`)
    } catch (error: any) {
      setDebugInfo(`Error de conexión: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
      </div>

      {showRLSError && (
        <Alert variant="destructive" className="mb-6 max-w-md mx-auto w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de seguridad en Supabase</AlertTitle>
          <AlertDescription>
            <p>Se ha detectado un error de Row Level Security (RLS) en tu tabla "Usuarios".</p>
            <p className="mt-2">Para solucionarlo, debes crear una política de seguridad en Supabase:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Inicia sesión en tu panel de Supabase</li>
              <li>Ve a "Table Editor" y selecciona la tabla "Usuarios"</li>
              <li>Haz clic en la pestaña "Policies"</li>
              <li>Haz clic en "New Policy"</li>
              <li>Selecciona "INSERT" como tipo de política</li>
              <li>Usa la expresión "true" para permitir todas las inserciones</li>
              <li>Guarda la política</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary p-2 rounded-full">
          <CardIcon className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto w-full">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de usuario</Label>
          <Input
            id="nombre"
            placeholder="Ingresa tu nombre de usuario"
            required
            className="h-12"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contraseña">Contraseña</Label>
          <div className="relative">
            <Input
              id="contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Crea una contraseña segura"
              required
              className="h-12 pr-10"
              value={formData.contraseña}
              onChange={handleChange}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </Button>

        <div className="text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary font-medium">
            Iniciar sesión
          </Link>
        </div>
      </form>

      {/* Botón para probar la conexión */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <Button type="button" variant="outline" className="w-full" onClick={testConnection}>
          Probar conexión a Supabase
        </Button>
      </div>

      {/* Área de depuración */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md max-w-md mx-auto w-full">
          <h3 className="font-semibold mb-2">Información de depuración:</h3>
          <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}

