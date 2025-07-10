// ======= Filtros para fondo y bordes =======

const removeBackground = (canvas, ctx, tolerance = 30) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const getPixelColor = (x, y) => {
    const index = (y * canvas.width + x) * 4
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3],
    }
  }

  const corners = [
    getPixelColor(0, 0),
    getPixelColor(canvas.width - 1, 0),
    getPixelColor(0, canvas.height - 1),
    getPixelColor(canvas.width - 1, canvas.height - 1),
  ]

  const avgColor = {
    r: Math.round(corners.reduce((sum, c) => sum + c.r, 0) / corners.length),
    g: Math.round(corners.reduce((sum, c) => sum + c.g, 0) / corners.length),
    b: Math.round(corners.reduce((sum, c) => sum + c.b, 0) / corners.length),
  }

  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    )
  }

  for (let i = 0; i < data.length; i += 4) {
    const pixelColor = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    }

    if (colorDistance(pixelColor, avgColor) < tolerance) {
      data[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const removeWhiteBackground = (canvas, ctx, tolerance = 40) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
      data[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const smoothEdges = (canvas, ctx) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const newData = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4
      if (data[index + 3] === 0) continue

      let transparentCount = 0
      const neighbors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1],
      ]

      neighbors.forEach(([dx, dy]) => {
        const ni = ((y + dy) * width + (x + dx)) * 4
        if (data[ni + 3] === 0) transparentCount++
      })

      if (transparentCount > 3) {
        newData[index + 3] = Math.round(data[index + 3] * 0.7)
      }
    }
  }

  const smoothed = new ImageData(newData, width, height)
  ctx.putImageData(smoothed, 0, 0)
}

const processImageWithBackgroundRemoval = (img, width, height, removeWhite = true) => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  if (removeWhite) {
    removeWhiteBackground(canvas, ctx, 45)
  } else {
    removeBackground(canvas, ctx, 35)
  }

  smoothEdges(canvas, ctx)

  return canvas
}

// ======= Composición final =======

export const createCombinedImage = async (fabricImageSrc, closureImageSrc) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const canvasWidth = 400
    const canvasHeight = 300
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const fabricSectionHeight = 80
    const closureSectionHeight = canvasHeight - fabricSectionHeight * 2

    let loaded = 0
    const fabricImg = new Image()
    const closureImg = new Image()

    fabricImg.crossOrigin = "anonymous"
    closureImg.crossOrigin = "anonymous"

    const checkLoaded = () => {
      loaded++
      if (loaded === 2) {
        try {
          // Fondo
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
          gradient.addColorStop(0, "#f8fafc")
          gradient.addColorStop(0.5, "#f1f5f9")
          gradient.addColorStop(1, "#e2e8f0")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)

          // Procesar imágenes
          const processedFabricCanvas = processImageWithBackgroundRemoval(
            fabricImg,
            canvasWidth,
            fabricSectionHeight,
            true,
          )
          const processedClosureCanvas = processImageWithBackgroundRemoval(
            closureImg,
            canvasWidth,
            closureSectionHeight,
            true,
          )

          // Dibujar tela en toda el área (fondo)
          // Dibujar tela en todo el canvas de una sola vez (estirada verticalmente)
          const stretchedFabricCanvas = document.createElement("canvas")
          stretchedFabricCanvas.width = canvasWidth
          stretchedFabricCanvas.height = canvasHeight
          const stretchedCtx = stretchedFabricCanvas.getContext("2d")
          stretchedCtx.drawImage(fabricImg, 0, 0, canvasWidth, canvasHeight)

          // Procesar tela estirada
          const processedStretchedFabric = processImageWithBackgroundRemoval(
          stretchedFabricCanvas,
          canvasWidth,
          canvasHeight,
          true
          )

            // Dibujar tela continua como fondo
            ctx.drawImage(processedStretchedFabric, 0, 0)

          // Dibujar cierre encima (respetando transparencia)
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
          ctx.shadowBlur = 5
          ctx.shadowOffsetY = 3
          ctx.drawImage(processedClosureCanvas, 0, fabricSectionHeight)

          // Limpiar sombra
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0

          // Costuras
          ctx.strokeStyle = "rgba(100, 116, 139, 0.3)"
          ctx.lineWidth = 1
          ctx.setLineDash([5, 3])
          ctx.beginPath()
          ctx.moveTo(10, fabricSectionHeight)
          ctx.lineTo(canvasWidth - 10, fabricSectionHeight)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(10, fabricSectionHeight + closureSectionHeight)
          ctx.lineTo(canvasWidth - 10, fabricSectionHeight + closureSectionHeight)
          ctx.stroke()

          ctx.setLineDash([])
          ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"
          ctx.lineWidth = 1
          ctx.strokeRect(0, 0, canvasWidth, canvasHeight)

          // Exportar como blob
          canvas.toBlob(
            (blob) => {
              const url = URL.createObjectURL(blob)
              resolve(url)
            },
            "image/png",
            0.95,
          )
        } catch (e) {
          reject(e)
        }
      }
    }

    fabricImg.onload = checkLoaded
    closureImg.onload = checkLoaded
    fabricImg.onerror = () => reject(new Error("Error cargando tela"))
    closureImg.onerror = () => reject(new Error("Error cargando cierre"))

    fabricImg.src = fabricImageSrc
    closureImg.src = closureImageSrc
  })
}

export const cleanupBlobUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}