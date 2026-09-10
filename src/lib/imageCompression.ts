/**
 * Comprime una imagen en el navegador usando Canvas.
 * Reduce el tamaño manteniendo buena calidad visual.
 *
 * - Redimensiona proporcionalmente si supera maxWidth/maxHeight
 * - Convierte a JPEG con la calidad indicada
 * - Preserva la orientación del sensor (EXIF)
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    maxSizeMB?: number
  } = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    maxSizeMB = 0.6,
  } = options

  // Si no es imagen, devolver el archivo original
  if (!file.type.startsWith('image/')) return file

  // Si ya pesa poco, no comprimir
  if (file.size <= maxSizeMB * 1024 * 1024) return file

  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  // Calcular dimensiones nuevas manteniendo aspect ratio
  let { width, height } = img
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
  width = Math.round(width * ratio)
  height = Math.round(height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  // Comprimir iterativamente si sigue muy grande
  let currentQuality = quality
  let blob = await canvasToBlob(canvas, 'image/jpeg', currentQuality)

  while (blob && blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.4) {
    currentQuality -= 0.1
    blob = await canvasToBlob(canvas, 'image/jpeg', currentQuality)
  }

  if (!blob) return file

  const compressedName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], compressedName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}
