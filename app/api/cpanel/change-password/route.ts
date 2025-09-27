import { type NextRequest, NextResponse } from "next/server"
import { CpanelAPI } from "@/lib/cpanel-api"

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: "Email and new password are required" }, { status: 400 })
    }

    const result = await CpanelAPI.changeEmailPassword(email, newPassword)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
