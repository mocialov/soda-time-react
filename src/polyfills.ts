// Polyfills for Node.js globals in browser environment
import { Buffer } from 'buffer'
import process from 'process'

// Make Buffer and process available globally
window.Buffer = Buffer
window.process = process

// Ensure global is defined
if (typeof global === 'undefined') {
  (window as any).global = window
}

export {}
