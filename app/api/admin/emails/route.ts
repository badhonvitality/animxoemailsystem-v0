import { type NextRequest, NextResponse } from "next/server"
import { CpanelAPI } from "@/lib/cpanel-api"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email accounts from cPanel
    const accounts = await CpanelAPI.listEmailAccounts()

    return NextResponse.json({
      success: true,
      accounts: accounts || [],
    })
  } catch (error) {
    console.error("Failed to get email accounts:", error)
    return NextResponse.json({ error: "Failed to retrieve email accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, storage } = await request.json()

    if (!email || !password || !storage) {
      return NextResponse.json({ error: "Email, password, and storage are required" }, { status: 400 })
    }

    // Verify email is for animxo.com domain
    if (!email.endsWith("@animxo.com")) {
      return NextResponse.json({ error: "Email must be for animxo.com domain" }, { status: 400 })
    }

    // Extract username from email
    const username = email.split("@")[0]

    // Create email account via cPanel API
    const result = await CpanelAPI.createEmailAccount(username, password, storage)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email account ${email} created successfully`,
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to create email account" }, { status: 500 })
    }
  } catch (error) {
    console.error("Failed to create email account:", error)
    return NextResponse.json({ error: "Failed to create email account" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Extract username from email
    const username = email.split("@")[0]

    // Delete email account via cPanel API
    const result = await CpanelAPI.deleteEmailAccount(username)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email account ${email} deleted successfully`,
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to delete email account" }, { status: 500 })
    }
  } catch (error) {
    console.error("Failed to delete email account:", error)
    return NextResponse.json({ error: "Failed to delete email account" }, { status: 500 })
  }
}
