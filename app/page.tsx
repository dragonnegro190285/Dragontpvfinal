import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">TPV Online</h1>
        <p className="text-gray-600 mb-8">
          Sistema de Punto de Venta
        </p>
        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Ir al Dashboard
          </Link>
          <br />
          <Link 
            href="/empresa"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Configuración de Empresa
          </Link>
          <br />
          <Link 
            href="/permisos"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            Gestión de Permisos
          </Link>
        </div>
      </div>
    </main>
  )
}
