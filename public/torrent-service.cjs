// Torrent service running in Electron main process
// This runs in Node.js environment with full BitTorrent support
const http = require('http');
const path = require('path');
const os = require('os');

class TorrentService {
  constructor() {
    this.WebTorrent = null;
    this.client = null;
    this.currentTorrent = null;
    this.server = null;
    this.serverPort = 8888;
    this.streamInfo = {
      state: 'stopped',
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      numPeers: 0,
      downloaded: 0,
      uploaded: 0,
      streamUrl: null
    };
  }

  async init() {
    if (this.client) return;

    console.log('[Main] Loading WebTorrent...');
    
    // Dynamic import for ES module
    if (!this.WebTorrent) {
      const module = await import('webtorrent');
      this.WebTorrent = module.default;
    }

    console.log('[Main] Initializing WebTorrent client...');
    
    this.client = new this.WebTorrent({
      maxConns: 100,
      dht: true,  // Full DHT support in Node.js
      tracker: true
    });

    this.client.on('error', (err) => {
      console.error('[Main] WebTorrent error:', err);
      this.streamInfo.state = 'stopped';
    });

    // Create HTTP server for streaming
    this.createServer();
  }

  createServer() {
    if (this.server) return;

    console.log('[Main] Creating HTTP server for streaming...');

    this.server = http.createServer((req, res) => {
      if (!this.currentTorrent) {
        res.statusCode = 404;
        res.end('No torrent loaded');
        return;
      }

      // Find video file
      const videoFile = this.findVideoFile(this.currentTorrent);
      if (!videoFile) {
        res.statusCode = 404;
        res.end('No video file found');
        return;
      }

      const range = req.headers.range;
      
      if (range) {
        // Handle range requests for seeking
        const positions = range.replace(/bytes=/, '').split('-');
        const start = parseInt(positions[0], 10);
        const fileSize = videoFile.length;
        const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
        });

        const stream = videoFile.createReadStream({ start, end });
        stream.pipe(res);
      } else {
        // Full file
        res.writeHead(200, {
          'Content-Length': videoFile.length,
          'Content-Type': 'video/mp4'
        });

        const stream = videoFile.createReadStream();
        stream.pipe(res);
      }
    });

    this.server.listen(this.serverPort, () => {
      console.log(`[Main] HTTP server listening on port ${this.serverPort}`);
    });
  }

  async startTorrent(magnetUrl, title) {
    return new Promise(async (resolve, reject) => {
      console.log('[Main] Starting torrent:', title);
      
      await this.init();

      // Clean up existing torrent
      if (this.currentTorrent) {
        console.log('[Main] Destroying existing torrent...');
        this.currentTorrent.destroy();
        this.currentTorrent = null;
      }

      this.streamInfo.state = 'connecting';

      const torrent = this.client.add(magnetUrl, {
        path: path.join(os.tmpdir(), 'soda-time')
      });

      this.currentTorrent = torrent;

      torrent.on('error', (err) => {
        console.error('[Main] Torrent error:', err);
        reject(err);
      });

      torrent.on('warning', (err) => {
        console.warn('[Main] Torrent warning:', err);
      });

      torrent.on('metadata', () => {
        console.log('[Main] Metadata received:', torrent.name);
        console.log('[Main] Files:', torrent.files.map(f => f.name));

        const videoFile = this.findVideoFile(torrent);
        
        if (!videoFile) {
          reject(new Error('No video file found in torrent'));
          return;
        }

        console.log('[Main] Selected video file:', videoFile.name);

        this.streamInfo.state = 'downloading';
        this.streamInfo.streamUrl = `http://localhost:${this.serverPort}`;

        // Select the video file for priority download
        videoFile.select();

        // Resolve when we have enough data to start playing
        const checkReady = () => {
          if (torrent.progress > 0.01) { // 1% buffered
            console.log('[Main] Torrent ready to play');
            this.streamInfo.state = 'ready';
            resolve({
              streamUrl: this.streamInfo.streamUrl,
              torrentName: torrent.name,
              fileName: videoFile.name
            });
          } else {
            setTimeout(checkReady, 500);
          }
        };

        checkReady();
      });

      torrent.on('done', () => {
        console.log('[Main] Torrent download complete');
      });
    });
  }

  findVideoFile(torrent) {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
    
    const videoFiles = torrent.files.filter(file => 
      videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (videoFiles.length === 0) return null;

    // Return the largest video file
    return videoFiles.reduce((largest, file) => 
      file.length > largest.length ? file : largest
    );
  }

  getStreamInfo() {
    if (this.currentTorrent) {
      this.streamInfo.progress = this.currentTorrent.progress * 100;
      this.streamInfo.downloadSpeed = this.currentTorrent.downloadSpeed;
      this.streamInfo.uploadSpeed = this.currentTorrent.uploadSpeed;
      this.streamInfo.numPeers = this.currentTorrent.numPeers;
      this.streamInfo.downloaded = this.currentTorrent.downloaded;
      this.streamInfo.uploaded = this.currentTorrent.uploaded;
    }
    return this.streamInfo;
  }

  stopTorrent() {
    console.log('[Main] Stopping torrent...');
    
    if (this.currentTorrent) {
      this.currentTorrent.destroy();
      this.currentTorrent = null;
    }

    this.streamInfo = {
      state: 'stopped',
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      numPeers: 0,
      downloaded: 0,
      uploaded: 0,
      streamUrl: null
    };
  }

  cleanup() {
    console.log('[Main] Cleaning up torrent service...');
    
    if (this.currentTorrent) {
      this.currentTorrent.destroy();
    }

    if (this.client) {
      this.client.destroy();
    }

    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = TorrentService;
