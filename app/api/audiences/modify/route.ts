import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://reactjs-a4hv.onrender.com"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Proxying modify request to:", `${API_BASE_URL}/audiences/modify`)
    console.log("Request payload:", body)

    const response = await fetch(`${API_BASE_URL}/audiences/modify`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log("Modify response:", responseText)

    if (!response.ok) {
      console.error("Modify API Error:", responseText)
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

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON response from API" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Route handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
