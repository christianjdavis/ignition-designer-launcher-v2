import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'custom-folders.json')

    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), 'utf8')
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading custom-folders.json:', error)
    return NextResponse.json({ error: 'Failed to load custom folders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const filePath = path.join(process.cwd(), 'custom-folders.json')

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error writing custom-folders.json:', error)
    return NextResponse.json({ error: 'Failed to save custom folders' }, { status: 500 })
  }
}
