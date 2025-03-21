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
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    contraseña: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
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

    try {
      // Buscar usuario por nombre y contraseña
      const { data: usuarios, error } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("Nombre", formData.nombre)
        .eq("Contraseña", formData.contraseña)
        .limit(1)

      if (error) throw error

      if (!usuarios || usuarios.length === 0) {
        throw new Error("Nombre de usuario o contraseña incorrectos")
      }

      // Guardar información del usuario en localStorage si "recordar sesión" está activado
      if (rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(usuarios[0]))
      } else {
        // Usar sessionStorage si no quiere recordar la sesión
        sessionStorage.setItem("currentUser", JSON.stringify(usuarios[0]))
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo",
      })

      // Redirect to game page after successful login
      setTimeout(() => {
        router.push("/game")
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
      </div>

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
              placeholder="Ingresa tu contraseña"
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Recordar mi sesión
          </Label>
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="text-primary font-medium">
            Registrarse
          </Link>
        </div>
      </form>
    </div>
  )
}

