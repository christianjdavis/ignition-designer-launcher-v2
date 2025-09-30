import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'gateways.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading gateways.json:', error)
    return NextResponse.json({ error: 'Failed to load gateways' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const filePath = path.join(process.cwd(), 'gateways.json')

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error writing gateways.json:', error)
    return NextResponse.json({ error: 'Failed to save gateways' }, { status: 500 })
  }
}
