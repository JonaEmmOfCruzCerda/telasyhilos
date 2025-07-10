"use client"

import { useState, useEffect } from "react"
import { Search, Scissors, Info, ArrowLeft, ChevronRight, Download, BrushCleaning } from "lucide-react"
import Image from "next/image"
import { TELAS } from "../data/telas"
import { createCombinedImage } from "../utils/imageComposer"
import { useCallback } from "react"

// Obtener todos los nombres para el placeholder (incluyendo tipos)
const getAllFabricNames = () => {
  const names = []
  TELAS.forEach((tela) => {
    if (tela.tipos) {
      tela.tipos.forEach((tipo) => names.push(tipo.nombre))
    } else {
      names.push(tela.nombre)
    }
  })
  return names
}

const allFabricNames = getAllFabricNames()
const placeholderText = `Ej: ${allFabricNames
  .slice(0, 5)
  .map((name) => name.toLowerCase())
  .join(", ")}...`
const popularSuggestions = allFabricNames.slice(0, 6)

export default function FabricSearchApp() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFabric, setSelectedFabric] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [viewMode, setViewMode] = useState("brands")
  const [combinedImageUrl, setCombinedImageUrl] = useState(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Generar imagen combinada cuando se selecciona una tela
  useEffect(() => {
    if (selectedFabric && selectedFabric.imagenTela && selectedFabric.imagenCierre) {
      generateCombinedImage()
    }
  }, [selectedFabric])

  const generateCombinedImage = useCallback(async () => {
  if (!selectedFabric) return

  setIsGeneratingImage(true)
  try {
    const combinedUrl = await createCombinedImage(
      selectedFabric.imagenTela,
      selectedFabric.imagenCierre
    )
    setCombinedImageUrl(combinedUrl)
  } catch (error) {
    console.error("Error generating combined image:", error)
    setCombinedImageUrl(selectedFabric.imagenCombinada)
  } finally {
    setIsGeneratingImage(false)
  }
}, [selectedFabric])

useEffect(() => {
  if (
    selectedFabric &&
    selectedFabric.imagenTela &&
    selectedFabric.imagenCierre
  ) {
    generateCombinedImage()
  }
}, [selectedFabric, generateCombinedImage])

  const downloadCombinedImage = () => {
    if (combinedImageUrl) {
      const link = document.createElement("a")
      link.href = combinedImageUrl
      link.download = `${selectedFabric.nombre}_combinada.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSelectedFabric(null)
      setSelectedBrand(null)
      setViewMode("brands")
      setCombinedImageUrl(null)
      return
    }

    const results = []

    TELAS.forEach((tela) => {
      if (tela.tipos) {
        const matchingTypes = tela.tipos.filter(
          (tipo) =>
            tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tipo.tipoCierre.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        if (matchingTypes.length > 0) {
          results.push(...matchingTypes.map((tipo) => ({ ...tipo, marca: tela.nombre })))
        }
        if (tela.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ ...tela, esMarca: true })
        }
      } else {
        if (
          tela.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tela.tipoCierre.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push(tela)
        }
      }
    })

    setSearchResults(results)
    if (results.length === 1) {
      if (results[0].esMarca) {
        setSelectedBrand(results[0])
        setViewMode("types")
      } else {
        setSelectedFabric(results[0])
        setViewMode("detail")
      }
    } else {
      setViewMode("search")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand)
    setSelectedFabric(null)
    setCombinedImageUrl(null)
    setViewMode("types")
  }

  const handleFabricSelect = (fabric) => {
    setSelectedFabric(fabric)
    setCombinedImageUrl(null)
    setViewMode("detail")
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setSelectedFabric(null)
    setSelectedBrand(null)
    setCombinedImageUrl(null)
    setViewMode("brands")
  }

  const goBack = () => {
    if (viewMode === "detail") {
      if (selectedFabric?.marca) {
        setViewMode("types")
        setSelectedFabric(null)
        setCombinedImageUrl(null)
      } else {
        setViewMode("brands")
        setSelectedFabric(null)
        setCombinedImageUrl(null)
      }
    } else if (viewMode === "types") {
      setViewMode("brands")
      setSelectedBrand(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buscador de Telas</h1>
          <p className="text-lg text-gray-600">Encuentra información sobre telas, tipos de cierre y ejemplos de uso</p>
          <p className="text-sm text-gray-500 mt-2">Marcas disponibles: {TELAS.length} diferentes</p>
        </div>

        {/* Navigation Breadcrumb */}
        {(viewMode === "types" || viewMode === "detail") && (
          <div className="mb-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {viewMode === "types" ? "Volver a marcas" : "Volver"}
            </button>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>Inicio</span>
              {selectedBrand && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{selectedBrand.nombre}</span>
                </>
              )}
              {selectedFabric && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{selectedFabric.nombre}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Search className="w-5 h-5" />
              Buscar Tela
            </h2>
            <p className="text-sm text-gray-600">Ingresa el nombre de la tela o marca que deseas consultar</p>
          </div>
          <div className="p-8">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
              </button>
              {(searchTerm || viewMode !== "brands") && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 border border-red-600 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <BrushCleaning className="w-4 h-4"/>
                </button>
              )}
            </div>

            {/* Quick suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Sugerencias populares:</p>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((suggestion, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion)
                      handleSearch()
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
        {viewMode === "search" && searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resultados de búsqueda</h2>
              <p className="text-sm text-gray-600">
                Se encontraron {searchResults.length} resultados. Haz clic en uno para ver los detalles.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (result.esMarca) {
                        handleBrandSelect(result)
                      } else {
                        handleFabricSelect(result)
                      }
                    }}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <Image
                      src={result.imagenTela || "/placeholder.svg"}
                      alt={result.nombre}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {result.nombre}
                      {result.marca && <span className="text-sm text-gray-500 ml-2">({result.marca})</span>}
                      {result.esMarca && <span className="text-sm text-blue-500 ml-2">(Marca)</span>}
                    </h3>
                    {!result.esMarca && (
                      <p className="text-sm text-gray-600 mb-2">Tipo de cierre: {result.tipoCierre}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brand Types View */}
        {viewMode === "types" && selectedBrand && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tipos de {selectedBrand.nombre}</h2>
              <p className="text-sm text-gray-600">{selectedBrand.tipos?.length || 0} tipos disponibles</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBrand.tipos?.map((tipo, index) => (
                  <div
                    key={index}
                    onClick={() => handleFabricSelect({ ...tipo, marca: selectedBrand.nombre })}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <Image
                      src={tipo.imagenTela || "/placeholder.svg"}
                      alt={tipo.nombre}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{tipo.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-2">Tipo de cierre: {tipo.tipoCierre}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Fabric Information */}
        {viewMode === "detail" && selectedFabric && (
          <div className="space-y-6">
            {/* Fabric Details */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5" />
                  {selectedFabric.nombre}
                  {selectedFabric.marca && <span className="text-sm text-gray-500">({selectedFabric.marca})</span>}
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

            {/* Auto-Generated Combined Example Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">Combinación Automática</h2>
                  </div>
                  {combinedImageUrl && (
                    <button
                      onClick={downloadCombinedImage}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600">Imagen generada automáticamente</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Generando imagen combinada...</p>
                    </div>
                  ) : combinedImageUrl ? (
                    <>
                      <Image
                        src={combinedImageUrl || "/placeholder.svg"}
                        alt={`Combinación automática de ${selectedFabric.nombre} con ${selectedFabric.tipoCierre}`}
                        width={400}
                        height={300}
                        className="mx-auto rounded-lg shadow-md mb-4"
                      />
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">
                          Imagen generada automáticamente: {selectedFabric.nombre} + {selectedFabric.tipoCierre}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-2">No se pudo generar la imagen automática</p>
                      <button
                        onClick={generateCombinedImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {viewMode === "search" && searchTerm && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 mb-4 text-lg">No se encontraron resultados para "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mb-4">Intenta con alguna de estas opciones:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {allFabricNames.slice(0, 6).map((name, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      setSearchTerm(name)
                      handleSearch()
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Brands Preview */}
        {viewMode === "brands" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Todas las Marcas Disponibles</h2>
              <p className="text-sm text-gray-600">Explora nuestra colección completa de {TELAS.length} marcas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TELAS.map((fabric, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (fabric.tipos) {
                        handleBrandSelect(fabric)
                      } else {
                        handleFabricSelect(fabric)
                      }
                    }}
                    className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    {/*
                    <Image
                      src={fabric.imagenTela || "/placeholder.svg"}
                      alt={fabric.nombre}
                      width={120}
                      height={90}
                      className="w-full h-20 object-cover rounded-md mb-3"
                    />
                    */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{fabric.nombre}</h1>
                    {fabric.tipos && <p className="text-xs text-gray-500">{fabric.tipos.length} tipos</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Buscador de Telas - Encuentra la información que necesitas sobre diferentes tipos de telas</p>
          <p className="mt-1">Base de datos local con {TELAS.length} marcas</p>
        </div>
      </div>
    </div>
  )
}
