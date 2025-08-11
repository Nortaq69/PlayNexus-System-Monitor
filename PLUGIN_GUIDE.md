# PlayNexus Plugin System Guide

## Overview

The PlayNexus System Monitor features a powerful plugin system that allows you to extend the application's functionality with custom modules. Plugins can add new tabs, tools, monitoring capabilities, and integrations.

## Plugin Architecture

### Core Components

- **Plugin System Manager**: Handles plugin loading, unloading, and lifecycle management
- **Plugin API**: Provides safe access to application features and system resources
- **Plugin Storage**: Isolated storage for plugin data and configuration
- **Plugin UI Framework**: Tools for creating custom user interfaces

### Security Model

- **Sandboxed Execution**: Plugins run in isolated contexts
- **API Whitelisting**: Only approved functions are accessible
- **Resource Limits**: Memory and CPU usage are monitored
- **Validation**: All plugin code is validated before execution

## Creating a Plugin

### Basic Plugin Structure

```javascript
/* @plugin {
    "name": "My Plugin",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "A brief description of what this plugin does",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
} */

exports.init = async function(api) {
    // Plugin initialization code
    console.log('My plugin is loading...');
    
    // Create a new tab
    const tab = api.createTab('my-plugin', 'My Plugin', 'fas fa-star');
    const body = document.getElementById('plugin-my-plugin-body');
    
    // Add content to the tab
    body.innerHTML = `
        <div class="my-plugin-content">
            <h3>Welcome to My Plugin!</h3>
            <p>This is a custom plugin for PlayNexus.</p>
            <button class="btn btn-primary" onclick="myPluginFunction()">
                Click Me!
            </button>
        </div>
    `;
};

function myPluginFunction() {
    // Your plugin logic here
    window.uiUtils?.showNotification('Plugin function executed!', 'success');
}
```

### Plugin Metadata

Every plugin must include metadata in a special comment block:

```javascript
/* @plugin {
    "name": "Plugin Name",
    "version": "1.0.0",
    "author": "Author Name",
    "description": "Plugin description",
    "features": ["Feature 1", "Feature 2"],
    "dependencies": ["chart.js"],
    "permissions": ["file-read", "system-info"]
} */
```

### Required Fields

- **name**: Display name of the plugin
- **version**: Semantic version (e.g., "1.0.0")
- **author**: Plugin creator's name
- **description**: Brief description of functionality

### Optional Fields

- **features**: Array of feature descriptions
- **dependencies**: Required external libraries
- **permissions**: Required system permissions
- **icon**: Custom icon class (FontAwesome)
- **category**: Plugin category (monitoring, utility, etc.)

## Plugin API Reference

### UI Management

#### `api.createTab(id, title, icon)`
Creates a new tab in the application.

```javascript
const tab = api.createTab('my-plugin', 'My Plugin', 'fas fa-star');
```

#### `api.removeTab(id)`
Removes a plugin tab.

```javascript
api.removeTab('my-plugin');
```

#### `api.showNotification(message, type)`
Shows a notification to the user.

```javascript
api.showNotification('Operation completed!', 'success');
// Types: 'success', 'error', 'warning', 'info'
```

### Data Access

#### `api.getSystemData()`
Gets current system information.

```javascript
const systemData = api.getSystemData();
console.log('CPU Usage:', systemData.cpu.load);
console.log('Memory Usage:', systemData.memory.percentage);
```

#### `api.getProcesses()`
Gets list of running processes.

```javascript
const processes = api.getProcesses();
processes.forEach(process => {
    console.log(`${process.name}: ${process.pid}`);
});
```

#### `api.getConfig()`
Gets application configuration.

```javascript
const config = api.getConfig();
console.log('Current theme:', config.ui.theme);
```

### Storage

#### `api.getStorage(key)`
Retrieves data from plugin storage.

```javascript
const savedData = api.getStorage('my-settings');
if (savedData) {
    console.log('Loaded settings:', savedData);
}
```

#### `api.setStorage(key, value)`
Saves data to plugin storage.

```javascript
api.setStorage('my-settings', {
    enabled: true,
    interval: 5000
});
```

### Utilities

#### `api.formatBytes(bytes)`
Formats bytes into human-readable format.

```javascript
const formatted = api.formatBytes(1024 * 1024); // "1 MB"
```

#### `api.formatPercentage(value)`
Formats number as percentage.

```javascript
const percentage = api.formatPercentage(0.75); // "75%"
```

### Events

#### `api.on(event, callback)`
Registers an event listener.

```javascript
api.on('system-data-update', (data) => {
    console.log('System data updated:', data);
});
```

#### `api.emit(event, data)`
Emits a custom event.

```javascript
api.emit('my-custom-event', { message: 'Hello!' });
```

### UI Components

#### `api.createCard(title, content, className)`
Creates a styled card component.

```javascript
const card = api.createCard('My Card', 'Card content here', 'my-custom-class');
```

#### `api.createButton(text, onClick, className)`
Creates a button element.

```javascript
const button = api.createButton('Click Me', () => {
    console.log('Button clicked!');
}, 'btn-primary');
```

#### `api.createChart(canvasId, config)`
Creates a Chart.js chart.

```javascript
const chart = api.createChart('my-chart', {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Data',
            data: [1, 2, 3]
        }]
    }
});
```

### System Integration

#### `api.executeCommand(command)`
Executes a system command.

```javascript
const result = await api.executeCommand('dir');
if (result.success) {
    console.log('Command output:', result.output);
}
```

#### `api.readFile(path)`
Reads a file from the filesystem.

```javascript
const content = await api.readFile('C:\\path\\to\\file.txt');
if (content) {
    console.log('File content:', content);
}
```

#### `api.writeFile(path, content)`
Writes content to a file.

```javascript
const success = await api.writeFile('C:\\path\\to\\file.txt', 'Hello World!');
if (success) {
    console.log('File written successfully');
}
```

## Plugin Examples

### Network Monitor Plugin

```javascript
/* @plugin {
    "name": "Network Monitor",
    "version": "1.0.0",
    "author": "PlayNexus",
    "description": "Advanced network monitoring and analysis",
    "features": ["Real-time network stats", "Connection monitoring", "Bandwidth analysis"]
} */

let networkChart;
let networkData = [];

exports.init = async function(api) {
    // Create plugin tab
    const tab = api.createTab('network-monitor', 'Network Monitor', 'fas fa-network-wired');
    const body = document.getElementById('plugin-network-monitor-body');
    
    body.innerHTML = `
        <div class="network-monitor">
            <div class="network-stats">
                <div class="stat-card">
                    <h4>Download Speed</h4>
                    <div class="stat-value" id="download-speed">0 Mbps</div>
                </div>
                <div class="stat-card">
                    <h4>Upload Speed</h4>
                    <div class="stat-value" id="upload-speed">0 Mbps</div>
                </div>
                <div class="stat-card">
                    <h4>Active Connections</h4>
                    <div class="stat-value" id="active-connections">0</div>
                </div>
            </div>
            <div class="network-chart">
                <canvas id="network-chart" width="800" height="300"></canvas>
            </div>
            <div class="network-controls">
                <button class="btn btn-primary" onclick="startNetworkMonitoring()">Start Monitoring</button>
                <button class="btn btn-secondary" onclick="exportNetworkData()">Export Data</button>
            </div>
        </div>
    `;
    
    // Initialize chart
    const canvas = document.getElementById('network-chart');
    if (canvas && window.Chart) {
        networkChart = new window.Chart(canvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Download (Mbps)',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Upload (Mbps)',
                    data: [],
                    borderColor: '#ff0088',
                    backgroundColor: 'rgba(255, 0, 136, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Network Activity'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Start monitoring
    startNetworkMonitoring();
};

function startNetworkMonitoring() {
    setInterval(() => {
        const systemData = window.app?.systemData;
        if (systemData?.network) {
            updateNetworkStats(systemData.network);
        }
    }, 1000);
}

function updateNetworkStats(networkData) {
    const downloadSpeed = document.getElementById('download-speed');
    const uploadSpeed = document.getElementById('upload-speed');
    const activeConnections = document.getElementById('active-connections');
    
    if (downloadSpeed) downloadSpeed.textContent = `${networkData.rx_sec || 0} Mbps`;
    if (uploadSpeed) uploadSpeed.textContent = `${networkData.tx_sec || 0} Mbps`;
    if (activeConnections) activeConnections.textContent = networkData.connections || 0;
    
    // Update chart
    if (networkChart) {
        const now = new Date().toLocaleTimeString();
        networkChart.data.labels.push(now);
        networkChart.data.datasets[0].data.push(networkData.rx_sec || 0);
        networkChart.data.datasets[1].data.push(networkData.tx_sec || 0);
        
        if (networkChart.data.labels.length > 20) {
            networkChart.data.labels.shift();
            networkChart.data.datasets[0].data.shift();
            networkChart.data.datasets[1].data.shift();
        }
        
        networkChart.update();
    }
}

function exportNetworkData() {
    const data = {
        timestamp: new Date().toISOString(),
        networkStats: networkData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-data.json';
    a.click();
    URL.revokeObjectURL(url);
}
```

### Game Launcher Plugin

```javascript
/* @plugin {
    "name": "Game Launcher",
    "version": "1.0.0",
    "author": "PlayNexus",
    "description": "Custom game launcher with performance monitoring",
    "features": ["Game library management", "Performance tracking", "Launch optimization"]
} */

let games = [];

exports.init = async function(api) {
    // Create plugin tab
    const tab = api.createTab('game-launcher', 'Game Launcher', 'fas fa-gamepad');
    const body = document.getElementById('plugin-game-launcher-body');
    
    // Load saved games
    games = api.getStorage('games') || [
        { name: 'Sample Game', path: 'C:\\Games\\SampleGame\\game.exe', enabled: true }
    ];
    
    body.innerHTML = `
        <div class="game-launcher">
            <div class="game-controls">
                <button class="btn btn-primary" onclick="addGame()">Add Game</button>
                <button class="btn btn-secondary" onclick="scanForGames()">Scan for Games</button>
            </div>
            <div class="games-grid" id="games-grid"></div>
        </div>
    `;
    
    renderGames();
};

function renderGames() {
    const container = document.getElementById('games-grid');
    if (!container) return;
    
    container.innerHTML = games.map((game, index) => `
        <div class="game-card">
            <div class="game-info">
                <h4>${game.name}</h4>
                <p>${game.path}</p>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" onclick="launchGame(${index})">
                    <i class="fas fa-play"></i> Launch
                </button>
                <button class="btn btn-secondary" onclick="editGame(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="removeGame(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addGame() {
    const name = prompt('Game name:');
    const path = prompt('Game executable path:');
    
    if (name && path) {
        games.push({ name, path, enabled: true });
        window.pluginSystem.setPluginStorage('games', games);
        renderGames();
    }
}

function launchGame(index) {
    const game = games[index];
    if (game) {
        window.electronAPI.executeCommand(`start "" "${game.path}"`);
        window.uiUtils?.showNotification(`Launching ${game.name}...`, 'info');
    }
}

function editGame(index) {
    const game = games[index];
    if (game) {
        const name = prompt('Game name:', game.name);
        const path = prompt('Game executable path:', game.path);
        
        if (name && path) {
            games[index] = { ...game, name, path };
            window.pluginSystem.setPluginStorage('games', games);
            renderGames();
        }
    }
}

function removeGame(index) {
    if (confirm('Remove this game?')) {
        games.splice(index, 1);
        window.pluginSystem.setPluginStorage('games', games);
        renderGames();
    }
}

function scanForGames() {
    window.uiUtils?.showNotification('Scanning for games...', 'info');
    // Implementation would scan common game directories
}
```

## Installing Plugins

### Method 1: Plugin Manager

1. Open the PlayNexus System Monitor
2. Navigate to the "Plugins" tab
3. Click "Install Plugin"
4. Select your plugin file (.js)
5. The plugin will be automatically installed and enabled

### Method 2: Manual Installation

1. Copy your plugin file to the `plugins` directory
2. Restart the application
3. Go to the "Plugins" tab
4. Enable your plugin using the toggle switch

### Plugin Directory Structure

```
plugins/
├── plugin-config.json          # Plugin configurations
├── network-monitor.js          # Network monitor plugin
├── game-launcher.js           # Game launcher plugin
└── system-optimizer.js        # System optimizer plugin
```

## Managing Plugins

### Plugin Manager Interface

The Plugin Manager provides a comprehensive interface for managing your plugins:

- **Plugin List**: View all available plugins
- **Enable/Disable**: Toggle plugins on and off
- **Plugin Details**: View metadata and features
- **Reload**: Restart a plugin without restarting the app
- **Delete**: Remove plugins permanently

### Plugin Configuration

Each plugin can have its own configuration stored in `plugin-config.json`:

```json
{
    "network-monitor.js": {
        "enabled": true,
        "settings": {
            "updateInterval": 1000,
            "maxDataPoints": 20
        }
    },
    "game-launcher.js": {
        "enabled": true,
        "settings": {
            "autoScan": false,
            "scanPaths": ["C:\\Games"]
        }
    }
}
```

## Best Practices

### Security

- **Validate Input**: Always validate user input before processing
- **Sanitize Output**: Clean data before displaying to users
- **Error Handling**: Implement proper error handling for all operations
- **Resource Limits**: Be mindful of memory and CPU usage

### Performance

- **Efficient Updates**: Use throttling for frequent updates
- **Memory Management**: Clean up resources when plugins are unloaded
- **Async Operations**: Use async/await for file and network operations
- **Event Cleanup**: Remove event listeners when plugins are disabled

### User Experience

- **Loading States**: Show loading indicators for long operations
- **Error Messages**: Provide clear, helpful error messages
- **Responsive Design**: Ensure your UI works on different screen sizes
- **Accessibility**: Follow accessibility guidelines for UI components

### Code Quality

- **Documentation**: Include clear comments and documentation
- **Modular Design**: Break complex functionality into smaller functions
- **Consistent Naming**: Use clear, consistent naming conventions
- **Version Control**: Use semantic versioning for your plugins

## Troubleshooting

### Common Issues

#### Plugin Not Loading

1. Check the plugin metadata format
2. Verify all required fields are present
3. Check the browser console for error messages
4. Ensure the plugin file is in the correct directory

#### Plugin Crashes

1. Check for syntax errors in your code
2. Verify API usage is correct
3. Test with minimal functionality first
4. Check the application logs for detailed error information

#### Performance Issues

1. Monitor memory usage in Task Manager
2. Check for memory leaks in event listeners
3. Optimize update intervals
4. Use efficient data structures

### Debugging

#### Console Logging

```javascript
console.log('Plugin loading...');
console.error('Error occurred:', error);
console.warn('Warning message');
```

#### Error Handling

```javascript
try {
    // Your plugin code
} catch (error) {
    console.error('Plugin error:', error);
    api.showNotification('Plugin error: ' + error.message, 'error');
}
```

#### Development Mode

Enable development mode to see detailed error messages:

1. Open the application
2. Press F12 to open DevTools
3. Check the Console tab for error messages
4. Use the Sources tab to debug your code

## Plugin Distribution

### Sharing Plugins

1. **Package Your Plugin**: Include all necessary files
2. **Documentation**: Provide clear installation and usage instructions
3. **Version Information**: Include version and compatibility information
4. **Testing**: Test thoroughly before distribution

### Plugin Repository

Consider creating a plugin repository for sharing:

- **GitHub**: Host your plugins on GitHub
- **Documentation**: Include README files with usage examples
- **Issues**: Provide a way for users to report bugs
- **Updates**: Maintain and update your plugins regularly

## Advanced Features

### Custom Themes

Plugins can define custom CSS for styling:

```javascript
// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .my-plugin-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 2rem;
    }
`;
document.head.appendChild(style);
```

### Persistent Storage

Use the storage API for saving plugin data:

```javascript
// Save settings
api.setStorage('settings', {
    theme: 'dark',
    autoStart: true,
    notifications: false
});

// Load settings
const settings = api.getStorage('settings') || {
    theme: 'light',
    autoStart: false,
    notifications: true
};
```

### Real-time Updates

Subscribe to system events for real-time updates:

```javascript
// Listen for system data updates
api.on('system-data-update', (data) => {
    updateMyPlugin(data);
});

// Emit custom events
api.emit('my-plugin-event', { data: 'custom data' });
```

## Conclusion

The PlayNexus Plugin System provides a powerful and flexible way to extend the application's functionality. By following this guide and best practices, you can create robust, secure, and user-friendly plugins that enhance the PlayNexus experience.

For more information and examples, visit the PlayNexus documentation or join the community forums.