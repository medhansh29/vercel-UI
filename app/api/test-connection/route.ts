import { NextResponse } from "next/server"

const API_BASE_URL = "https://reactjs-a4hv.onrender.com"

export async function GET() {
  try {
    console.log("Testing connection to:", API_BASE_URL)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("Connection test response status:", response.status)

    if (!response.ok) {
      console.error("Connection test failed with status:", response.status)
      return NextResponse.json(
        {
          error: `API connection failed: ${response.status}`,
          success: false,
        },
        { status: response.status },
      )
    }

    // Try to parse response, but don't fail if it's not JSON
    let data = null
    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const textData = await response.text()
        data = { message: "API responded with non-JSON", preview: textData.substring(0, 100) }
      }
    } catch (parseError) {
      console.log("Could not parse response as JSON, but connection succeeded")
      data = { message: "Connection successful but response not parseable" }
    }

    return NextResponse.json({
      success: true,
      data,
      status: response.status,
    })
  } catch (error) {
    console.error("Connection test error:", error)

    let errorMessage = "Connection failed"
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Connection timeout"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    )
  }
}
