// Empty stub for bittorrent-dht module in browser
// WebTorrent will use alternative methods for peer discovery
import { EventEmitter } from 'events'

export class Client extends EventEmitter {
  constructor() {
    super()
  }
  listen() {}
  destroy() {}
}

export default { Client };
