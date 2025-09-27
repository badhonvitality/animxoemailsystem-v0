// Client-side environment variables (accessible in browser)
export const CLIENT_ENV = {
  // Firebase Config
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCZIxhNtvOXWhATcshtAGwo59TkKWzS5yQ",
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "animxomail.firebaseapp.com",
  FIREBASE_DATABASE_URL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://animxomail-default-rtdb.asia-southeast1.firebasedatabase.app",
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "animxomail",
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "animxomail.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "254296252137",
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:254296252137:web:33f723d5f3462dbc34da78",
  FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HHGK61N216",

  // Client-accessible configuration
  CPANEL_URL: process.env.NEXT_PUBLIC_CPANEL_URL || "https://power.mywhiteserver.com:2083",
  WEBMAIL_URL: process.env.NEXT_PUBLIC_WEBMAIL_URL || "https://webmail.animxo.com",
  MAIL_SERVER: process.env.NEXT_PUBLIC_MAIL_SERVER || "power.mywhiteserver.com",
  ADMIN_UID: process.env.NEXT_PUBLIC_ADMIN_UID || "WyfuYUlgxxRIs9vvNY6YrHr117l2",
  DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || "animxo.com",
} as const

// Server-side environment variables (only accessible in API routes and server components)
export const SERVER_ENV = {
  CPANEL_API_TOKEN:
    typeof window === "undefined" ? process.env.CPANEL_API_TOKEN || "GNVY8H1RCNYF9YSIXWNA6COJSUAA77GI" : undefined,
  CPANEL_USER: typeof window === "undefined" ? process.env.CPANEL_USER || "animxoco" : undefined,
} as const

// Legacy export for backward compatibility (client-side only)
export const ENV = CLIENT_ENV

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("Server environment variables cannot be accessed on the client side")
  }
  return {
    CPANEL_API_TOKEN: process.env.CPANEL_API_TOKEN || "GNVY8H1RCNYF9YSIXWNA6COJSUAA77GI",
    CPANEL_USER: process.env.CPANEL_USER || "animxoco",
  }
}
