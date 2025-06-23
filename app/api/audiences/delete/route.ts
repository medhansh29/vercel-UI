import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://reactjs-a4hv.onrender.com"

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/audiences/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `API Error: ${response.status} - ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Route handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
