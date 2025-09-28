import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Verify email credentials via IMAP connection
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/email/imap/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        server: process.env.NEXT_PUBLIC_MAIL_SERVER || "power.mywhiteserver.com",
        port: 993,
        ssl: true,
      }),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email credentials verified successfully",
        settings: {
          imap: {
            server: process.env.NEXT_PUBLIC_MAIL_SERVER || "power.mywhiteserver.com",
            port: 993,
            ssl: true,
          },
          smtp: {
            server: process.env.NEXT_PUBLIC_MAIL_SERVER || "power.mywhiteserver.com",
            port: 465,
            ssl: true,
          },
        },
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid email credentials" }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json({ success: false, error: "Failed to verify email credentials" }, { status: 500 })
  }
}