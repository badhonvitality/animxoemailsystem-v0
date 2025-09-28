import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const folder = searchParams.get("folder") || "INBOX"
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Mock email messages - In production, fetch from IMAP
    const mockMessages = [
      {
        id: "1",
        from: "sender@example.com",
        to: email,
        subject: "Welcome to AnimXO Mail",
        body: "Welcome to your new email system!",
        isRead: false,
        receivedAt: new Date().toISOString(),
        folder: "INBOX",
        size: 1024,
        uid: 1,
      },
      {
        id: "2",
        from: "noreply@animxo.com",
        to: email,
        subject: "Account Setup Complete",
        body: "Your email account has been successfully configured.",
        isRead: true,
        receivedAt: new Date(Date.now() - 86400000).toISOString(),
        folder: "INBOX",
        size: 2048,
        uid: 2,
      },
    ]

    return NextResponse.json({
      success: true,
      messages: mockMessages,
      total: mockMessages.length,
    })
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}