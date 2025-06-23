import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://reactjs-a4hv.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Proxying growth levers request to:", `${API_BASE_URL}/growth-levers/generate`)
    console.log("Request payload:", body)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(`${API_BASE_URL}/growth-levers/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("Growth levers response status:", response.status)

    const responseText = await response.text()
    console.log("Growth levers raw response:", responseText)

    if (!response.ok) {
      console.error("Growth levers API Error Response:", responseText)

      let errorMessage = `API Error: ${response.status} - ${response.statusText}`
      try {
        const errorJson = JSON.parse(responseText)
        if (errorJson.detail) {
          errorMessage = errorJson.detail
        }
      } catch (e) {
        if (responseText) {
          errorMessage = responseText
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Parse the response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse growth levers response as JSON:", responseText)
      return NextResponse.json({ error: "Invalid JSON response from API" }, { status: 500 })
    }

    console.log("Parsed growth levers API Response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Growth levers route handler error:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout - API took too long to respond" }, { status: 408 })
      } else if (error.message.includes("fetch")) {
        return NextResponse.json({ error: "Network error - Unable to connect to API" }, { status: 503 })
      }
    }

    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}
