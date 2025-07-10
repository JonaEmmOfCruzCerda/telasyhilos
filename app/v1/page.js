"use client"

import { useState } from "react"
import { Search, Scissors, Info } from "lucide-react"
import Image from "next/image"
import { TELAS } from "../data/telas"

// Generar placeholder dinámico desde las telas
const placeholderText = `Ej: ${TELAS.slice(0, 5)
  .map((tela) => tela.nombre.toLowerCase())
  .join(", ")}...`

// Generar sugerencias dinámicas desde las telas (primeras 6)
const popularSuggestions = TELAS.slice(0, 6).map((tela) => tela.nombre)

export default function FabricSearchApp() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFabric, setSelectedFabric] = useState(null)
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSelectedFabric(null)
      return
    }

    const results = TELAS.filter(
      (fabric) =>
        fabric.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.tipoCierre.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setSearchResults(results)
    if (results.length === 1) {
      setSelectedFabric(results[0])
    } else {
      setSelectedFabric(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleFabricSelect = (fabric) => {
    setSelectedFabric(fabric)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setSelectedFabric(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buscador de Telas</h1>
          <p className="text-lg text-gray-600">Encuentra información sobre telas, tipos de cierre y ejemplos de uso</p>
          <p className="text-sm text-gray-500 mt-2">Telas disponibles: {TELAS.length} tipos diferentes</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Search className="w-5 h-5" />
              Buscar Tela
            </h2>
            <p className="text-sm text-gray-600">Ingresa el nombre de la tela que deseas consultar</p>
          </div>
          <div className="p-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={placeholderText}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
              {(searchTerm || searchResults.length > 0) && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 border border-red-300 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Quick suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Sugerencias populares:</p>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((suggestion) => (
                  <span
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion)
                      const results = TELAS.filter((fabric) =>
                        fabric.nombre.toLowerCase().includes(suggestion.toLowerCase()),
                      )
                      setSearchResults(results)
                      if (results.length === 1) {
                        setSelectedFabric(results[0])
                      }
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 1 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resultados de búsqueda</h2>
              <p className="text-sm text-gray-600">
                Se encontraron {searchResults.length} telas. Haz clic en una para ver los detalles.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((fabric, index) => (
                  <div
                    key={index}
                    onClick={() => handleFabricSelect(fabric)}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <Image
                      src={fabric.imagenTela || "/placeholder.svg"}
                      alt={fabric.nombre}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{fabric.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-2">Tipo de cierre: {fabric.tipoCierre}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Fabric Information */}
        {selectedFabric && (
          <div className="space-y-6">
            {/* Fabric Details */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5" />
                  {selectedFabric.nombre}
                </h2>
                <p className="text-sm text-gray-600">Información detallada sobre la tela</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-3 text-gray-900">Imagen de la Tela</h3>
                  <Image
                    src={selectedFabric.imagenTela || "/placeholder.svg"}
                    alt={selectedFabric.nombre}
                    width={400}
                    height={300}
                    className="mx-auto h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Closure Information */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Scissors className="w-5 h-5" />
                  Tipo de Cierre Recomendado
                </h2>
                <p className="text-sm text-gray-600">Cierre ideal para esta tela</p>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h3 className="font-semibold text-blue-900 mb-3">{selectedFabric.tipoCierre}</h3>

                  <div className="text-center">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Imagen del Cierre:</h4>
                    <Image
                      src={selectedFabric.imagenCierre || "/placeholder.svg"}
                      alt={`Tipo de cierre: ${selectedFabric.tipoCierre}`}
                      width={300}
                      height={200}
                      className="mx-auto rounded-md shadow-sm border border-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Example Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 2 0 002 2z"
                    />
                  </svg>
                  Ejemplo de Combinación
                </h2>
                <p className="text-sm text-gray-600">Cómo se ve la tela con el tipo de cierre recomendado</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <Image
                    src={selectedFabric.imagenCombinada || "/placeholder.svg"}
                    alt={`Ejemplo de ${selectedFabric.nombre} con ${selectedFabric.tipoCierre}`}
                    width={400}
                    height={500}
                    className="mx-auto rounded-lg shadow-md mb-4"
                  />
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">
                      {selectedFabric.nombre} combinada con {selectedFabric.tipoCierre}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {searchTerm && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 mb-4 text-lg">No se encontraron resultados para "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mb-4">Intenta con alguna de estas telas disponibles:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {TELAS.slice(0, 6).map((tela, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      setSearchTerm(tela.nombre)
                      setSearchResults([tela])
                      setSelectedFabric(tela)
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {tela.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Fabrics Preview */}
        {!searchTerm && searchResults.length === 0 && !selectedFabric && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Todas las Telas Disponibles</h2>
              <p className="text-sm text-gray-600">
                Explora nuestra colección completa de {TELAS.length} tipos de telas
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {TELAS.map((fabric, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchTerm(fabric.nombre)
                      setSearchResults([fabric])
                      setSelectedFabric(fabric)
                    }}
                    className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <Image
                      src={fabric.imagenTela || "/placeholder.svg"}
                      alt={fabric.nombre}
                      width={100}
                      height={80}
                      className="w-full h-16 object-cover rounded-md mb-2"
                    />
                    <p className="text-sm font-medium text-gray-900">{fabric.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Buscador de Telas - Encuentra la información que necesitas sobre diferentes tipos de telas</p>
          <p className="mt-1">Base de datos local con {TELAS.length} tipos de telas</p>
        </div>
      </div>
    </div>
  )
}
