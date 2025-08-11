const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const systeminformation = require('systeminformation');
const psList = require('ps-list');
const screenshot = require('screenshot-desktop');
const clipboardy = require('clipboardy');
const chokidar = require('chokidar');
const cron = require('node-cron');

// Development mode check
const isDev = process.env.NODE_ENV === 'development';

// Global variables
let mainWindow;
let systemMonitorInterval;
let fileWatcher;

// Configuration management
const config = {
    monitoring: {
        enabled: true,
        interval: 5000,
        fileWatching: true
    },
    ui: {
        theme: 'cyberpunk',
        notifications: true,
        soundEffects: false
    },
    performance: {
        lowMode: false,
        reduceAnimations: false
    }
};

// Load configuration from file
async function loadConfig() {
    try {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        Object.assign(config, JSON.parse(configData));
    } catch (error) {
        console.log('No config file found, using defaults');
    }
}

// Save configuration to file
async function saveConfig() {
    try {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Failed to save config:', error);
    }
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
            webSecurity: true
        },
        titleBarStyle: 'hidden',
        frame: false,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        backgroundColor: '#0a0a0a',
        show: false,
        title: 'PlayNexus System Monitor'
    });

    // Load the app
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Security: Prevent new window creation
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
}

// System monitoring functions
function startSystemMonitoring() {
    if (systemMonitorInterval) {
        clearInterval(systemMonitorInterval);
    }
    
    systemMonitorInterval = setInterval(async () => {
        try {
            const data = await getSystemData();
            mainWindow.webContents.send('system-data-update', data);
        } catch (error) {
            console.error('System monitoring error:', error);
        }
    }, config.monitoring.interval);
}

function stopSystemMonitoring() {
    if (systemMonitorInterval) {
        clearInterval(systemMonitorInterval);
        systemMonitorInterval = null;
    }
}

async function getSystemData() {
    try {
        const [cpu, mem, disk, network] = await Promise.all([
            systeminformation.currentLoad(),
            systeminformation.mem(),
            systeminformation.fsSize(),
            systeminformation.networkStats()
        ]);

        return {
            cpu: {
                load: cpu.currentLoad,
                cores: cpu.cpus.length,
                temperature: cpu.cpus[0]?.temperature || 0
            },
            memory: {
                total: mem.total,
                used: mem.used,
                free: mem.free,
                active: mem.active,
                available: mem.available,
                percentage: ((mem.used / mem.total) * 100).toFixed(1)
            },
            disk: disk.map(d => ({
                fs: d.fs,
                size: d.size,
                used: d.used,
                available: d.available,
                percentage: d.use
            })),
            network: {
                rx_sec: network[0]?.rx_sec || 0,
                tx_sec: network[0]?.tx_sec || 0,
                connections: network[0]?.connections || 0
            },
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Error getting system data:', error);
        return null;
    }
}

// File watching functions
function startFileWatcher() {
    if (fileWatcher) {
        fileWatcher.close();
    }

    const watchPaths = config.fileWatchPaths || [];
    if (watchPaths.length === 0) return;

    fileWatcher = chokidar.watch(watchPaths, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    });

    fileWatcher
        .on('add', path => {
            mainWindow.webContents.send('file-event', {
                type: 'add',
                path: path,
                timestamp: Date.now()
            });
        })
        .on('change', path => {
            mainWindow.webContents.send('file-event', {
                type: 'change',
                path: path,
                timestamp: Date.now()
            });
        })
        .on('unlink', path => {
            mainWindow.webContents.send('file-event', {
                type: 'unlink',
                path: path,
                timestamp: Date.now()
            });
        });
}

// IPC Handlers
ipcMain.handle('get-config', async () => {
    return config;
});

ipcMain.handle('save-config', async (event, newConfig) => {
    Object.assign(config, newConfig);
    await saveConfig();
    return true;
});

ipcMain.handle('get-system-data', async () => {
    return await getSystemData();
});

ipcMain.handle('get-processes', async () => {
    try {
        const processes = await psList();
        return processes.map(p => ({
            name: p.name,
            pid: p.pid,
            cpu: p.cpu,
            memory: p.memory,
            command: p.cmd
        }));
    } catch (error) {
        console.error('Error getting processes:', error);
        return [];
    }
});

ipcMain.handle('take-screenshot', async () => {
    try {
        const img = await screenshot();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.png`;
        const filepath = path.join(app.getPath('pictures'), filename);
        
        await fs.writeFile(filepath, img);
        return { success: true, path: filepath };
    } catch (error) {
        console.error('Screenshot error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
    try {
        await clipboardy.write(text);
        return true;
    } catch (error) {
        console.error('Clipboard error:', error);
        return false;
    }
});

ipcMain.handle('select-directory', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Select Directory to Watch'
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    } catch (error) {
        console.error('Directory selection error:', error);
        return null;
    }
});

ipcMain.handle('open-external', async (event, url) => {
    try {
        await shell.openExternal(url);
        return true;
    } catch (error) {
        console.error('External link error:', error);
        return false;
    }
});

ipcMain.handle('start-monitoring', async () => {
    startSystemMonitoring();
    return true;
});

ipcMain.handle('stop-monitoring', async () => {
    stopSystemMonitoring();
    return true;
});

ipcMain.handle('start-file-watcher', async () => {
    startFileWatcher();
    return true;
});

// File operations for plugin system
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error('File read error:', error);
        return null;
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error('File write error:', error);
        return false;
    }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        return files;
    } catch (error) {
        console.error('Directory read error:', error);
        return [];
    }
});

ipcMain.handle('create-directory', async (event, dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return true;
    } catch (error) {
        console.error('Directory creation error:', error);
        return false;
    }
});

ipcMain.handle('execute-command', async (event, command) => {
    try {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        
        const { stdout, stderr } = await execAsync(command);
        return { success: true, output: stdout, error: stderr };
    } catch (error) {
        console.error('Command execution error:', error);
        return { success: false, error: error.message };
    }
});

// App lifecycle events
app.whenReady().then(async () => {
    await loadConfig();
    createWindow();
    
    // Start monitoring if enabled
    if (config.monitoring.enabled) {
        startSystemMonitoring();
    }
    
    // Start file watching if enabled
    if (config.monitoring.fileWatching) {
        startFileWatcher();
    }
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', async () => {
    stopSystemMonitoring();
    if (fileWatcher) {
        fileWatcher.close();
    }
    await saveConfig();
});

// Security: Prevent multiple instances
app.requestSingleInstanceLock();

// Handle second instance
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});