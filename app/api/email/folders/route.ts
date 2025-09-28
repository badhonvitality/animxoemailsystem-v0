import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Mock folders - In production, fetch from IMAP
    const folders = [
      {
        name: "INBOX",
        displayName: "Inbox",
        messageCount: 25,
        unreadCount: 3,
      },
      {
        name: "SENT",
        displayName: "Sent",
        messageCount: 12,
        unreadCount: 0,
      },
      {
        name: "DRAFTS",
        displayName: "Drafts",
        messageCount: 2,
        unreadCount: 0,
      },
      {
        name: "TRASH",
        displayName: "Trash",
        messageCount: 5,
        unreadCount: 0,
      },
    ]

    return NextResponse.json({
      success: true,
      folders,
    })
  } catch (error: any) {
    console.error("Error fetching folders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch folders" }, { status: 500 })
  }
}