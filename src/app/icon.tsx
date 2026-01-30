import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Route segment config
export const runtime = 'nodejs'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/svg+xml'

// Image generation
export default async function Icon(request: NextRequest) {
  try {
    // Read the favicon.svg file from the public directory
    const faviconPath = join(process.cwd(), 'public', 'images', 'logos', 'favicon.svg')
    const faviconBuffer = await readFile(faviconPath)
    
    return new Response(new Uint8Array(faviconBuffer), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving favicon:', error)
    return new Response('Favicon not found', { status: 404 })
  }
}