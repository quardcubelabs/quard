import fs from 'fs'
import path from 'path'
import { createCanvas, registerFont } from 'canvas'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products')

// Create the directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// Function to save base64 image
function saveBase64Image(filename: string, base64Data: string) {
  const imagePath = path.join(IMAGES_DIR, filename)
  const imageBuffer = Buffer.from(base64Data, 'base64')
  fs.writeFileSync(imagePath, imageBuffer)
  console.log(`Created ${filename}`)
}

// Generate and save product images
async function generateProductImages() {
  try {
    // Create canvas
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext('2d')

    // Helper function to create product image
    const createProductImage = (title: string, color: string) => {
      // Clear canvas with base color
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, 'rgba(0,0,0,0.1)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Wrap text if needed
      const words = title.split(' ')
      let lines = []
      let currentLine = words[0]
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width < canvas.width - 100) {
          currentLine = testLine
        } else {
          lines.push(currentLine)
          currentLine = words[i]
        }
      }
      lines.push(currentLine)

      // Draw text lines
      lines.forEach((line, index) => {
        const y = canvas.height / 2 - ((lines.length - 1) * 60 / 2) + index * 60
        ctx.fillText(line, canvas.width / 2, y)
      })

      // Add subtle pattern overlay
      for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
          if ((i + j) % 40 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)'
            ctx.fillRect(i, j, 10, 10)
          }
        }
      }

      return canvas.toBuffer('image/jpeg', { quality: 0.9 }).toString('base64')
    }

    // Generate images for each product
    const products = [
      { name: 'Enterprise ERP Solution', color: '#2563eb', filename: 'erp-solution.jpg' },
      { name: 'Mobile App Development Kit', color: '#7c3aed', filename: 'mobile-dev-kit.jpg' },
      { name: 'Advanced Firewall System', color: '#dc2626', filename: 'firewall-system.jpg' },
      { name: 'Biometric Access Control', color: '#0891b2', filename: 'biometric-access.jpg' },
      { name: 'Server Rack Bundle', color: '#0f766e', filename: 'server-rack.jpg' },
      { name: 'Workstation Setup Package', color: '#4f46e5', filename: 'workstation-package.jpg' }
    ]

    products.forEach(product => {
      const imageData = createProductImage(product.name, product.color)
      saveBase64Image(product.filename, imageData)
    })

    console.log('All product images generated successfully!')
  } catch (error) {
    console.error('Error generating product images:', error)
  }
}

// Run the script
generateProductImages() 