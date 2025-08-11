const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Configuration
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    
    // System monitoring
    getSystemData: () => ipcRenderer.invoke('get-system-data'),
    getProcesses: () => ipcRenderer.invoke('get-processes'),
    startMonitoring: () => ipcRenderer.invoke('start-monitoring'),
    stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
    
    // File operations
    takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
    copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    startFileWatcher: () => ipcRenderer.invoke('start-file-watcher'),
    
    // Plugin system file operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
    executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
    
    // Window controls
    minimize: () => ipcRenderer.invoke('minimize-window'),
    maximize: () => ipcRenderer.invoke('maximize-window'),
    close: () => ipcRenderer.invoke('close-window'),
    
    // Event listeners
    on: (channel, callback) => {
        // Whitelist channels
        const validChannels = ['system-data-update', 'file-event'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
    
    removeListener: (channel, callback) => {
        const validChannels = ['system-data-update', 'file-event'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});

// Security: Remove Node.js APIs from renderer
window.process = undefined;
window.require = undefined;
window.module = undefined;