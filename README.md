# Soda Time React

A modern React + TypeScript movie discovery application.

## 🚀 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first CSS

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

Run the web version with hot reload:
```bash
npm run dev
```

## 🏗️ Build

Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
react/
├── public/              # Static assets
│   └── electron.js      # Electron main process
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx   # Custom window frame
│   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   ├── MovieBrowser.tsx
│   │   ├── TvShowBrowser.tsx
│   │   └── Settings.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔄 Migration Progress

### ✅ Completed
- [x] Modern React + TypeScript setup
- [x] Vite build configuration
- [x] Electron integration
- [x] Basic UI layout (Header, Sidebar, Content)
- [x] Custom window controls (frameless window)
- [x] Routing structure
- [x] **Database service (IndexedDB)**
- [x] **Settings management**
- [x] **WebTorrent streaming service**
- [x] **Movie, TV Show, and Anime providers**
- [x] **Subtitle service**
- [x] **React Context for state management**
- [x] **Video player component**
- [x] **Bookmarks and watched items**
- [x] **Fully functional movie browser**
- [x] **Fully functional TV show browser**
- [x] **Settings UI with persistence**

### 🚧 To Do
- [ ] Episode selection for TV shows
- [ ] Subtitle selection UI in player
- [ ] Search functionality
- [ ] Advanced filtering
- [ ] Casting support (Chromecast, DLNA)
- [ ] Keyboard shortcuts
- [ ] HTTP API (for remote control)
- [ ] Auto-update system
- [ ] Trakt.tv integration
- [ ] Multiple quality selection
- [ ] Download management
- [ ] Anime provider integration

## 🔌 Core Services

The app is built with a clean service layer architecture:

### Services (`src/services/`)
- **config.ts** - Application configuration and constants
- **settings.ts** - User settings management with localStorage persistence
- **database.ts** - IndexedDB wrapper for bookmarks, watched items, and cache
- **streamer.ts** - WebTorrent integration for torrent streaming
- **subtitles.ts** - Subtitle fetching from OpenSubtitles API
- **providers/** - Content providers for movies, TV shows, and anime

### Contexts (`src/contexts/`)
- **AppContext** - Global app state (settings, bookmarks, watched items)
- **StreamContext** - Streaming state management

### Components (`src/components/`)
- **Header** - Custom window frame with search
- **Sidebar** - Navigation menu
- **MovieBrowser** - Browse and play movies
- **TvShowBrowser** - Browse TV shows
- **VideoPlayer** - Custom video player with streaming controls
- **Settings** - Settings interface

## 🎯 Key Features Migrated

1. **Torrent Streaming**: Full WebTorrent integration with progress tracking
2. **Content APIs**: Real API integration with movies/TV show providers
3. **Database**: IndexedDB for offline storage of bookmarks and history
4. **Settings**: Complete settings system with persistence
5. **Video Player**: Custom player with seek, volume, fullscreen controls
6. **Bookmarks**: Add/remove favorites with visual indicators
7. **Watched Tracking**: Track watched movies and shows
8. **Quality Selection**: Automatic quality selection based on availability

## 📝 Notes

- This is a foundation for the React rewrite
- The original app's backend logic needs to be gradually migrated
- Consider using modern alternatives (e.g., WebTorrent instead of peerflix)
- API integrations need to respect the same content sources as the original

## 📝 License

GPL-3.0 (same as original Popcorn Time)
