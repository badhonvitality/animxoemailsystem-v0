import { type NextRequest, NextResponse } from "next/server"
import { CpanelAPI } from "@/lib/cpanel-api"

export async function POST(request: NextRequest) {
  try {
    const { email, password, quota } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const [username] = email.split("@")
    if (!username) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    console.log("[v0] Creating email account:", { email, username, quota })

    const result = await CpanelAPI.createEmailAccount(username, password, quota)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Email creation API error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
