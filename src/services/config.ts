// Configuration constants for the application
export const Config = {
  title: 'Soda Time',
  platform: typeof process !== 'undefined' ? process.platform : 'web',
  
  genres: [
    'All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir',
    'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance',
    'Sci-Fi', 'Short', 'Sport', 'Thriller', 'War', 'Western'
  ],

  sorters: [
    'trending', 'popularity', 'last added', 'year', 'title', 'rating'
  ],

  sorters_tv: [
    'trending', 'popularity', 'updated', 'year', 'name', 'rating'
  ],

  sorters_anime: [
    'popularity', 'name', 'year'
  ],

  types_anime: [
    'All', 'Movies', 'TV', 'OVA', 'ONA'
  ],

  genres_anime: [
    'All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
    'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Historical', 'Horror',
    'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military',
    'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance',
    'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai',
    'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports',
    'Super Power', 'Supernatural', 'Thriller', 'Vampire'
  ],

  // API endpoints
  apiEndpoints: {
    movies: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? '/api/yts/v2' 
      : 'https://yts.bz/api/v2',
    shows: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? '/api/tvmaze' 
      : 'https://api.tvmaze.com',
    anime: 'https://api.jikan.moe/v4',
    omdb: 'https://www.omdbapi.com'
  },

  // OMDb API Key (easier to get than TMDB - just requires email)
  // Get your FREE key instantly at: http://www.omdbapi.com/apikey.aspx
  // Just enter your email and click the activation link - takes 1 minute!
  // Provides 1,000 free requests per day
  omdbApiKey: '134fa8fb', // Add your OMDb API key here

  // Torrent trackers
  trackers: {
    blacklisted: ['demonii'],
    forced: [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://glotorrents.pw:6969/announce',
      'udp://exodus.desync.com:6969/announce',
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://tracker.openbittorrent.com:80/announce',
      'udp://tracker.internetwarriors.net:1337/announce'
    ]
  }
}

export default Config
