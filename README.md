# AnimXO Email Management System

A comprehensive, professional email management system built with Next.js, Firebase, and cPanel integration. This system allows you to create, manage, and monitor unlimited email accounts for your domain with real-time synchronization and advanced admin controls.

## 🚀 Features

### Core Functionality
- **Unlimited Email Account Creation** - Create and manage unlimited email accounts for your domain
- **Flexible Storage Quotas** - Choose from predefined quotas (25MB to 10GB) or set custom storage limits up to 50GB
- **Real-time Synchronization** - Firebase Firestore and Realtime Database integration
- **cPanel Integration** - Direct integration with cPanel hosting for seamless email management
- **Webmail Access** - Direct webmail integration for easy email access
- **Password Management** - Secure password generation, display, and copy functionality

### Authentication & Security
- **Firebase Authentication** - Secure user authentication with email/password
- **Admin Controls** - Comprehensive admin dashboard with user management
- **Protected Routes** - Role-based access control for admin and user areas
- **Password Reset** - Built-in password reset functionality
- **Remember Me** - 30-day session persistence option
- **Secure Password Display** - Toggle visibility and copy passwords securely

### User Interface
- **Modern Design** - Clean, responsive design with dark mode support
- **Smooth Animations** - Enhanced user experience with CSS animations and transitions
- **Real-time Updates** - Live data updates and activity monitoring
- **Mobile Responsive** - Fully responsive design for all devices
- **Success Notifications** - Clear feedback for all user actions

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Next.js API routes, Firebase Functions
- **Database**: Firebase Firestore, Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Email Management**: cPanel API integration
- **Deployment**: Vercel (recommended)

## 📦 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- cPanel hosting with API access
- Domain configured for email hosting

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/badhonvitality/animxo-email-system.git
   cd animxo-email-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Setup**
   
   Copy the `.env.example` to `.env.local` and configure your environment variables:
   
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Update the following variables in `.env.local`:
   
   \`\`\`env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Admin Configuration
   NEXT_PUBLIC_ADMIN_UID=your_admin_user_uid
   
   # Server Configuration
   NEXT_PUBLIC_MAIL_SERVER=your_mail_server.com
   NEXT_PUBLIC_WEBMAIL_URL=https://webmail.yourdomain.com
   NEXT_PUBLIC_CPANEL_URL=https://your_cpanel_url:2083
   NEXT_PUBLIC_DOMAIN=yourdomain.com
   
   # Server-side Variables (Add these in your deployment platform)
   CPANEL_API_TOKEN=your_cpanel_api_token_here
   CPANEL_USER=your_cpanel_username_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create Firestore database
4. Enable Realtime Database
5. Copy your Firebase configuration to the environment variables

### cPanel API Setup

1. Generate an API token in your cPanel
2. Add the API token and username to your environment variables
3. Ensure your cPanel account has email management permissions

### Admin User Setup

1. Create a user account through the application
2. Get the user's UID from Firebase Auth
3. Set the `NEXT_PUBLIC_ADMIN_UID` environment variable to this UID
4. The user will now have admin privileges

## 📱 Usage

### For Regular Users

1. **Sign Up/Login** - Create an account or sign in with existing credentials
2. **Dashboard** - View your email accounts and storage usage
3. **Create Email** - Create new email accounts with flexible storage options
4. **Manage Accounts** - View, copy passwords, and manage your existing email accounts
5. **Webmail Access** - Direct access to webmail interface

### For Administrators

1. **Admin Dashboard** - Access comprehensive system statistics
2. **User Management** - Create, monitor, and manage user accounts
3. **Email Management** - Create and delete email accounts for any user
4. **System Monitoring** - Real-time activity monitoring and analytics
5. **Storage Management** - Set and modify storage quotas

## 💾 Storage Quota Options

The system supports flexible storage quota management:

- **Small Options**: 25MB, 50MB, 100MB, 250MB
- **Standard Options**: 500MB, 1GB, 2GB, 5GB, 10GB
- **Custom Quotas**: Set any custom storage amount up to 50GB
- **Real-time Monitoring**: Track storage usage with visual progress bars
- **Automatic Enforcement**: Quota limits are enforced at the cPanel level

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out
- `POST /api/auth/reset-password` - Password reset

### Email Management
- `GET /api/emails` - List user's email accounts
- `POST /api/emails` - Create new email account
- `DELETE /api/emails` - Delete email account
- `PUT /api/emails/quota` - Update email quota

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/emails` - List all email accounts
- `POST /api/admin/emails` - Create email account (admin)
- `DELETE /api/admin/emails` - Delete email account (admin)
- `GET /api/admin/stats` - System statistics

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Set Environment Variables**
   
   In your Vercel dashboard, add all the environment variables from your `.env.local` file.

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🏗 Development

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── admin/             # Admin-only pages
│   ├── dashboard/         # User dashboard
│   ├── login/             # Authentication pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Authentication components
│   ├── email/             # Email management components
│   └── admin/             # Admin components
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── auth.ts            # Authentication service
│   ├── cpanel-api.ts      # cPanel API integration
│   └── env.ts             # Environment configuration
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
\`\`\`

### Key Components

- **AuthProvider** - Global authentication state management
- **ProtectedRoute** - Route protection for authenticated users
- **CreateEmailDialog** - Email account creation interface with success feedback
- **EmailAccountCard** - Enhanced email account display with password management
- **AdminDashboard** - Comprehensive admin interface
- **DeveloperCredits** - Developer attribution component

### Custom Hooks

- **useAuth** - Authentication state and methods
- **useToast** - Toast notification system
- **useRealTimeData** - Real-time data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the developer: **Badhon Vitality**
  - GitHub: https://github.com/badhonvitality
  - Discord: https://discord.com/users/1121859070488498196
  - Facebook: https://facebook.com/Badhon.Vitality
  - Bio: https://guns.lol/badhon

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Firebase](https://firebase.google.com/)

---

**Developed by [Badhon Vitality](https://github.com/badhonvitality)** - AnimXO Email System v1.0

## 🔄 Recent Updates

### Version 1.0 Features
- ✅ Complete email account management system
- ✅ Secure password display and copy functionality
- ✅ Enhanced success notifications for email creation
- ✅ Fixed date formatting issues with Firestore timestamps
- ✅ Improved authentication state management
- ✅ Production-ready cPanel API integration
- ✅ Comprehensive admin dashboard
- ✅ Mobile-responsive design with dark mode
- ✅ Real-time data synchronization
- ✅ Professional developer credits and attribution

### Technical Improvements
- Fixed "Invalid time value" error in date-fns formatting
- Enhanced password visibility and copy functionality
- Improved authentication persistence and session management
- Optimized cPanel API requests with proper error handling
- Added comprehensive success feedback for user actions
- Enhanced mobile responsiveness and accessibility
