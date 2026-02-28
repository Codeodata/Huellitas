# 🐾 FurMap - Pet Community Platform

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js">
  <img src="https://img.shields.io/badge/Supabase-database-blue" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind CSS-neo--brutalism-purple" alt="Tailwind">
</p>

FurMap is a community platform for pet owners to connect, help find lost pets, report found animals, and find trusted pet sitters in their neighborhood. Built with **Next.js 14**, **Supabase**, and **Leaflet/OpenStreetMap**.

## ✨ Features

### 🗺️ Interactive Map
- See all posts on a map with color-coded pins
- 🔴 Red = Lost Pets
- 🟢 Green = Found Pets
- 🔵 Blue = Pet Sitters
- Click on map to view post details

### 🔔 Real-time Notifications
- Get instant notifications when someone comments on your posts
- Notification bell with unread count badge
- Mark as read / Mark all as read

### 💬 Community Comments
- Discuss and help each other
- Comment on posts to coordinate searches
- Share information and tips

### 📞 Direct Contact
- Post owners can share contact info
- Connect via email or WhatsApp

### 🐾 My Pets
- Create profiles for your furry friends
- Link pets to your posts

### 📍 GPS Location
- One-click location detection
- Click on map to set exact position
- IP-based fallback for desktop users

### 📱 Mobile Responsive
- Fully responsive design
- Works on desktop, tablet, and mobile
- Neo-brutalism UI style

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Neo-brutalism |
| Backend | Supabase |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Maps | Leaflet + OpenStreetMap |
| Deployment | Netlify |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/depapp/furmap.git
   cd furmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the migrations in order:
     - `supabase/schema.sql` - Main database schema
     - `supabase/migration_comments_and_contact.sql` - Comments & contact fields
     - `supabase/migration_notifications.sql` - Notifications system

4. **Configure environment variables**

   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
furmap/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── dashboard/      # Dashboard with map & posts
│   │   ├── create-post/    # Create new post
│   │   ├── post/[id]/      # Post detail page
│   │   ├── my-pets/        # Pet management
│   │   ├── notifications/  # Notifications page
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── components/         # React components
│   │   ├── Navbar.tsx
│   │   ├── MapView.tsx
│   │   ├── MapPicker.tsx
│   │   ├── PostCard.tsx
│   │   └── Comments.tsx
│   ├── lib/                # Utilities
│   │   ├── supabase.ts    # Supabase client
│   │   └── utils.ts       # Helper functions
│   └── types/              # TypeScript types
├── supabase/
│   ├── schema.sql          # Main database schema
│   └── migrations/        # Additional migrations
├── public/                # Static assets
├── LICENSE                # MIT License
└── README.md
```

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |

## 🌐 Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify dashboard
4. Deploy!

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `.next`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Supabase](https://supabase.com) - The open source Firebase alternative
- [Leaflet](https://leafletjs.com) - The open-source JavaScript library for mobile-friendly interactive maps
- [OpenStreetMap](https://www.openstreetmap.org) - Free wiki world map

---

<p align="center">
  Made with ❤️ for pet owners everywhere 🐕🐱🐰
</p>
