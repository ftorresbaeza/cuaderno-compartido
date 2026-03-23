import { put } from '@vercel/blob'

export async function uploadImage(file: File): Promise<{ url: string }> {
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  
  const blob = await put(filename, file, {
    access: 'public',
  })

  return {
    url: blob.url,
  }
}

export async function compressImage(file: File, maxSize = 1600, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = URL.createObjectURL(file)
  })
}
