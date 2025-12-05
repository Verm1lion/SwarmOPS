const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the APIs without exposing the entire Node.js API
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any Electron APIs you need here
  platform: process.platform,
});

