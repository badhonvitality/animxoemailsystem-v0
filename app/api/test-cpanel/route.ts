import { type NextRequest, NextResponse } from "next/server"
import { CpanelAPI } from "@/lib/cpanel-api"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Testing cPanel API connection...")

    const result = await CpanelAPI.testConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "cPanel API connection successful",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Test cPanel API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
