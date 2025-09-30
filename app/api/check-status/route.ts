import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual', // Don't follow redirects, just check if server responds
      })
      clearTimeout(timeoutId)

      // Consider 2xx and 3xx responses as online (redirects are normal for Ignition)
      return NextResponse.json({ online: response.status >= 200 && response.status < 400 })
    } catch (error) {
      clearTimeout(timeoutId)
      return NextResponse.json({ online: false })
    }
  } catch (error) {
    return NextResponse.json({ online: false })
  }
}
