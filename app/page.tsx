import Link from "next/link"
import { CreditCardIcon as CardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-full">
              <CardIcon className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Memory Match</h1>
          <p className="text-muted-foreground">Encuentra las parejas y mejora tu memoria</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

