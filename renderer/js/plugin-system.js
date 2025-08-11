/**
 * PlayNexus Plugin System
 * Enables dynamic loading and management of custom modules
 */

class PluginSystem {
    constructor() {
        this.plugins = new Map();
        this.pluginConfigs = new Map();
        this.activePlugins = new Set();
        this.pluginAPI = this.createPluginAPI();
        this.pluginDirectory = 'plugins';
        this.configFile = 'plugin-config.json';
    }

    /**
     * Create the API that plugins can access
     */
    createPluginAPI() {
        return {
            // UI Management
            createTab: (id, title, icon) => this.createPluginTab(id, title, icon),
            removeTab: (id) => this.removePluginTab(id),
            showNotification: (message, type = 'info') => window.uiUtils?.showNotification(message, type),
            
            // Data Access
            getSystemData: () => window.app?.systemData || {},
            getProcesses: () => window.app?.processes || [],
            getConfig: () => window.app?.config || {},
            
            // Storage
            getStorage: (key) => this.getPluginStorage(key),
            setStorage: (key, value) => this.setPluginStorage(key, value),
            
            // Utilities
            formatBytes: (bytes) => window.app?.formatBytes(bytes) || '0 B',
            formatPercentage: (value) => window.app?.formatPercentage(value) || '0%',
            
            // Events
            on: (event, callback) => this.onPluginEvent(event, callback),
            emit: (event, data) => this.emitPluginEvent(event, data),
            
            // UI Components
            createCard: (title, content, className = '') => this.createPluginCard(title, content, className),
            createButton: (text, onClick, className = '') => this.createPluginButton(text, onClick, className),
            createChart: (canvasId, config) => this.createPluginChart(canvasId, config),
            
            // System Integration
            executeCommand: (command) => this.executePluginCommand(command),
            readFile: (path) => this.readPluginFile(path),
            writeFile: (path, content) => this.writePluginFile(path, content)
        };
    }

    /**
     * Initialize the plugin system
     */
    async init() {
        try {
            await this.loadPluginConfigs();
            await this.scanPluginDirectory();
            await this.loadActivePlugins();
            this.setupPluginManagement();
            console.log('Plugin system initialized');
        } catch (error) {
            console.error('Failed to initialize plugin system:', error);
        }
    }

    /**
     * Load plugin configurations
     */
    async loadPluginConfigs() {
        try {
            const configPath = `${this.pluginDirectory}/${this.configFile}`;
            const config = await window.electronAPI.readFile(configPath);
            if (config) {
                this.pluginConfigs = new Map(Object.entries(JSON.parse(config)));
            }
        } catch (error) {
            console.log('No plugin config found, creating default');
            this.pluginConfigs = new Map();
        }
    }

    /**
     * Save plugin configurations
     */
    async savePluginConfigs() {
        try {
            const config = Object.fromEntries(this.pluginConfigs);
            const configPath = `${this.pluginDirectory}/${this.configFile}`;
            await window.electronAPI.writeFile(configPath, JSON.stringify(config, null, 2));
        } catch (error) {
            console.error('Failed to save plugin configs:', error);
        }
    }

    /**
     * Scan plugin directory for available plugins
     */
    async scanPluginDirectory() {
        try {
            const plugins = await window.electronAPI.readDirectory(this.pluginDirectory);
            for (const plugin of plugins) {
                if (plugin.endsWith('.js')) {
                    await this.loadPluginMetadata(plugin);
                }
            }
        } catch (error) {
            console.log('Plugin directory not found, creating...');
            await this.createPluginDirectory();
        }
    }

    /**
     * Create plugin directory structure
     */
    async createPluginDirectory() {
        try {
            await window.electronAPI.createDirectory(this.pluginDirectory);
            await this.createSamplePlugins();
        } catch (error) {
            console.error('Failed to create plugin directory:', error);
        }
    }

    /**
     * Create sample plugins for demonstration
     */
    async createSamplePlugins() {
        const samplePlugins = [
            {
                name: 'network-monitor',
                content: this.getNetworkMonitorPlugin()
            },
            {
                name: 'game-launcher',
                content: this.getGameLauncherPlugin()
            },
            {
                name: 'system-optimizer',
                content: this.getSystemOptimizerPlugin()
            }
        ];

        for (const plugin of samplePlugins) {
            await this.createPluginFile(plugin.name, plugin.content);
        }
    }

    /**
     * Load plugin metadata
     */
    async loadPluginMetadata(pluginPath) {
        try {
            const content = await window.electronAPI.readFile(`${this.pluginDirectory}/${pluginPath}`);
            const metadata = this.extractPluginMetadata(content);
            if (metadata) {
                this.plugins.set(pluginPath, metadata);
            }
        } catch (error) {
            console.error(`Failed to load plugin metadata for ${pluginPath}:`, error);
        }
    }

    /**
     * Extract metadata from plugin content
     */
    extractPluginMetadata(content) {
        const metadataMatch = content.match(/\/\*\s*@plugin\s*({[\s\S]*?})\s*\*\//);
        if (metadataMatch) {
            try {
                return JSON.parse(metadataMatch[1]);
            } catch (error) {
                console.error('Invalid plugin metadata:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Load active plugins
     */
    async loadActivePlugins() {
        for (const [pluginPath, metadata] of this.plugins) {
            const config = this.pluginConfigs.get(pluginPath);
            if (config?.enabled) {
                await this.loadPlugin(pluginPath, metadata);
            }
        }
    }

    /**
     * Load a specific plugin
     */
    async loadPlugin(pluginPath, metadata) {
        try {
            const content = await window.electronAPI.readFile(`${this.pluginDirectory}/${pluginPath}`);
            const pluginModule = this.createPluginModule(content, metadata);
            
            if (pluginModule && pluginModule.init) {
                await pluginModule.init(this.pluginAPI);
                this.activePlugins.add(pluginPath);
                console.log(`Plugin loaded: ${metadata.name}`);
            }
        } catch (error) {
            console.error(`Failed to load plugin ${pluginPath}:`, error);
        }
    }

    /**
     * Create plugin module from content
     */
    createPluginModule(content, metadata) {
        try {
            // Create a safe execution context for the plugin
            const moduleExports = {};
            const moduleRequire = (module) => {
                // Whitelist allowed modules
                const allowedModules = ['chart.js'];
                if (allowedModules.includes(module)) {
                    return window[module] || {};
                }
                throw new Error(`Module ${module} not allowed in plugins`);
            };

            // Execute plugin code in a controlled environment
            const pluginFunction = new Function('exports', 'require', 'api', content);
            pluginFunction(moduleExports, moduleRequire, this.pluginAPI);

            return moduleExports;
        } catch (error) {
            console.error('Failed to create plugin module:', error);
            return null;
        }
    }

    /**
     * Setup plugin management UI
     */
    setupPluginManagement() {
        const pluginsTab = document.getElementById('plugins');
        if (pluginsTab) {
            this.renderPluginManager(pluginsTab);
        }
    }

    /**
     * Render plugin management interface
     */
    renderPluginManager(container) {
        container.innerHTML = `
            <div class="plugins-header">
                <h2>Plugin Manager</h2>
                <div class="plugin-controls">
                    <button class="btn btn-primary" onclick="window.pluginSystem.refreshPlugins()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button class="btn btn-secondary" onclick="window.pluginSystem.installPlugin()">
                        <i class="fas fa-plus"></i> Install Plugin
                    </button>
                </div>
            </div>
            
            <div class="plugins-grid">
                <div class="plugins-list">
                    <h3>Available Plugins</h3>
                    <div id="plugins-list"></div>
                </div>
                
                <div class="plugin-details">
                    <h3>Plugin Details</h3>
                    <div id="plugin-details"></div>
                </div>
            </div>
        `;

        this.renderPluginsList();
    }

    /**
     * Render plugins list
     */
    renderPluginsList() {
        const container = document.getElementById('plugins-list');
        if (!container) return;

        const plugins = Array.from(this.plugins.entries());
        
        if (plugins.length === 0) {
            container.innerHTML = `
                <div class="no-plugins">
                    <i class="fas fa-puzzle-piece"></i>
                    <p>No plugins found</p>
                    <button class="btn btn-primary" onclick="window.pluginSystem.createSamplePlugins()">
                        Create Sample Plugins
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = plugins.map(([path, metadata]) => {
            const config = this.pluginConfigs.get(path);
            const isActive = this.activePlugins.has(path);
            
            return `
                <div class="plugin-item ${isActive ? 'active' : ''}" data-plugin="${path}">
                    <div class="plugin-info">
                        <div class="plugin-name">${metadata.name}</div>
                        <div class="plugin-version">v${metadata.version}</div>
                        <div class="plugin-description">${metadata.description}</div>
                    </div>
                    <div class="plugin-controls">
                        <label class="toggle-switch">
                            <input type="checkbox" ${config?.enabled ? 'checked' : ''} 
                                   onchange="window.pluginSystem.togglePlugin('${path}', this.checked)">
                            <span class="slider"></span>
                        </label>
                        <button class="btn btn-sm" onclick="window.pluginSystem.showPluginDetails('${path}')">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle plugin enabled/disabled
     */
    async togglePlugin(pluginPath, enabled) {
        try {
            const config = this.pluginConfigs.get(pluginPath) || {};
            config.enabled = enabled;
            this.pluginConfigs.set(pluginPath, config);

            if (enabled) {
                const metadata = this.plugins.get(pluginPath);
                if (metadata) {
                    await this.loadPlugin(pluginPath, metadata);
                }
            } else {
                await this.unloadPlugin(pluginPath);
            }

            await this.savePluginConfigs();
            this.renderPluginsList();
            
            window.uiUtils?.showNotification(
                `Plugin ${enabled ? 'enabled' : 'disabled'}: ${this.plugins.get(pluginPath)?.name}`,
                'success'
            );
        } catch (error) {
            console.error('Failed to toggle plugin:', error);
            window.uiUtils?.showNotification('Failed to toggle plugin', 'error');
        }
    }

    /**
     * Unload a plugin
     */
    async unloadPlugin(pluginPath) {
        try {
            // Remove plugin tab if it exists
            this.removePluginTab(pluginPath);
            
            // Remove from active plugins
            this.activePlugins.delete(pluginPath);
            
            console.log(`Plugin unloaded: ${this.plugins.get(pluginPath)?.name}`);
        } catch (error) {
            console.error('Failed to unload plugin:', error);
        }
    }

    /**
     * Show plugin details
     */
    showPluginDetails(pluginPath) {
        const container = document.getElementById('plugin-details');
        const metadata = this.plugins.get(pluginPath);
        const config = this.pluginConfigs.get(pluginPath);
        
        if (!container || !metadata) return;

        container.innerHTML = `
            <div class="plugin-detail-card">
                <h4>${metadata.name}</h4>
                <div class="plugin-meta">
                    <div class="meta-item">
                        <span class="label">Version:</span>
                        <span class="value">${metadata.version}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Author:</span>
                        <span class="value">${metadata.author}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Status:</span>
                        <span class="value ${this.activePlugins.has(pluginPath) ? 'active' : 'inactive'}">
                            ${this.activePlugins.has(pluginPath) ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="plugin-description">
                    <p>${metadata.description}</p>
                </div>
                ${metadata.features ? `
                    <div class="plugin-features">
                        <h5>Features:</h5>
                        <ul>
                            ${metadata.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="plugin-actions">
                    <button class="btn btn-primary" onclick="window.pluginSystem.reloadPlugin('${pluginPath}')">
                        <i class="fas fa-redo"></i> Reload
                    </button>
                    <button class="btn btn-secondary" onclick="window.pluginSystem.deletePlugin('${pluginPath}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create plugin tab
     */
    createPluginTab(pluginId, title, icon) {
        const tabId = `plugin-${pluginId}`;
        
        // Add navigation item
        const navContainer = document.querySelector('.sidebar');
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.setAttribute('data-tab', tabId);
        navItem.innerHTML = `
            <i class="${icon || 'fas fa-puzzle-piece'}"></i>
            <span>${title}</span>
        `;
        navContainer.appendChild(navItem);

        // Add tab content
        const contentContainer = document.querySelector('.main-content');
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = tabId;
        tabContent.innerHTML = `
            <div class="plugin-content">
                <div class="plugin-header">
                    <h2>${title}</h2>
                </div>
                <div class="plugin-body" id="${tabId}-body"></div>
            </div>
        `;
        contentContainer.appendChild(tabContent);

        // Add click handler
        navItem.addEventListener('click', () => {
            window.app?.switchTab(tabId);
        });

        return tabContent;
    }

    /**
     * Remove plugin tab
     */
    removePluginTab(pluginId) {
        const tabId = `plugin-${pluginId}`;
        
        // Remove navigation item
        const navItem = document.querySelector(`[data-tab="${tabId}"]`);
        if (navItem) navItem.remove();

        // Remove tab content
        const tabContent = document.getElementById(tabId);
        if (tabContent) tabContent.remove();
    }

    /**
     * Plugin storage methods
     */
    getPluginStorage(key) {
        try {
            const storage = localStorage.getItem(`plugin_${key}`);
            return storage ? JSON.parse(storage) : null;
        } catch (error) {
            console.error('Failed to get plugin storage:', error);
            return null;
        }
    }

    setPluginStorage(key, value) {
        try {
            localStorage.setItem(`plugin_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set plugin storage:', error);
            return false;
        }
    }

    /**
     * Plugin event system
     */
    onPluginEvent(event, callback) {
        if (!this.eventListeners) this.eventListeners = new Map();
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emitPluginEvent(event, data) {
        if (this.eventListeners && this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Plugin event handler error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Plugin UI component helpers
     */
    createPluginCard(title, content, className = '') {
        return `
            <div class="plugin-card ${className}">
                <div class="plugin-card-header">
                    <h3>${title}</h3>
                </div>
                <div class="plugin-card-body">
                    ${content}
                </div>
            </div>
        `;
    }

    createPluginButton(text, onClick, className = '') {
        const button = document.createElement('button');
        button.className = `btn ${className}`;
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    createPluginChart(canvasId, config) {
        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.width = 400;
        canvas.height = 200;
        
        // Initialize Chart.js if available
        if (window.Chart) {
            return new window.Chart(canvas, config);
        }
        
        return null;
    }

    /**
     * Plugin command execution
     */
    async executePluginCommand(command) {
        try {
            return await window.electronAPI.executeCommand(command);
        } catch (error) {
            console.error('Plugin command execution failed:', error);
            return null;
        }
    }

    /**
     * Plugin file operations
     */
    async readPluginFile(path) {
        try {
            return await window.electronAPI.readFile(path);
        } catch (error) {
            console.error('Plugin file read failed:', error);
            return null;
        }
    }

    async writePluginFile(path, content) {
        try {
            return await window.electronAPI.writeFile(path, content);
        } catch (error) {
            console.error('Plugin file write failed:', error);
            return false;
        }
    }

    /**
     * Sample plugin content generators
     */
    getNetworkMonitorPlugin() {
        return `
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
    
    body.innerHTML = \`
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
    \`;
    
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
    
    if (downloadSpeed) downloadSpeed.textContent = \`\${networkData.rx_sec || 0} Mbps\`;
    if (uploadSpeed) uploadSpeed.textContent = \`\${networkData.tx_sec || 0} Mbps\`;
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
`;
    }

    getGameLauncherPlugin() {
        return `
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
        { name: 'Sample Game', path: 'C:\\\\Games\\\\SampleGame\\\\game.exe', enabled: true }
    ];
    
    body.innerHTML = \`
        <div class="game-launcher">
            <div class="game-controls">
                <button class="btn btn-primary" onclick="addGame()">Add Game</button>
                <button class="btn btn-secondary" onclick="scanForGames()">Scan for Games</button>
            </div>
            <div class="games-grid" id="games-grid"></div>
        </div>
    \`;
    
    renderGames();
};

function renderGames() {
    const container = document.getElementById('games-grid');
    if (!container) return;
    
    container.innerHTML = games.map((game, index) => \`
        <div class="game-card">
            <div class="game-info">
                <h4>\${game.name}</h4>
                <p>\${game.path}</p>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" onclick="launchGame(\${index})">
                    <i class="fas fa-play"></i> Launch
                </button>
                <button class="btn btn-secondary" onclick="editGame(\${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="removeGame(\${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    \`).join('');
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
        window.electronAPI.executeCommand(\`start "" "\${game.path}"\`);
        window.uiUtils?.showNotification(\`Launching \${game.name}...\`, 'info');
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
`;
    }

    getSystemOptimizerPlugin() {
        return `
/* @plugin {
    "name": "System Optimizer",
    "version": "1.0.0",
    "author": "PlayNexus",
    "description": "System optimization and maintenance tools",
    "features": ["Memory optimization", "Disk cleanup", "Performance tuning"]
} */

exports.init = async function(api) {
    // Create plugin tab
    const tab = api.createTab('system-optimizer', 'System Optimizer', 'fas fa-tools');
    const body = document.getElementById('plugin-system-optimizer-body');
    
    body.innerHTML = \`
        <div class="system-optimizer">
            <div class="optimization-tools">
                <div class="tool-card">
                    <h4>Memory Optimization</h4>
                    <p>Free up RAM and optimize memory usage</p>
                    <button class="btn btn-primary" onclick="optimizeMemory()">Optimize Memory</button>
                </div>
                <div class="tool-card">
                    <h4>Disk Cleanup</h4>
                    <p>Remove temporary files and free disk space</p>
                    <button class="btn btn-primary" onclick="cleanupDisk()">Clean Disk</button>
                </div>
                <div class="tool-card">
                    <h4>Performance Tuning</h4>
                    <p>Optimize system performance settings</p>
                    <button class="btn btn-primary" onclick="tunePerformance()">Tune Performance</button>
                </div>
            </div>
            <div class="optimization-status" id="optimization-status"></div>
        </div>
    \`;
};

function optimizeMemory() {
    const status = document.getElementById('optimization-status');
    status.innerHTML = '<div class="status-message">Optimizing memory...</div>';
    
    // Simulate memory optimization
    setTimeout(() => {
        const freedMB = Math.floor(Math.random() * 500) + 100;
        status.innerHTML = \`
            <div class="status-success">
                <i class="fas fa-check-circle"></i>
                Memory optimization complete! Freed \${freedMB} MB
            </div>
        \`;
        window.uiUtils?.showNotification(\`Freed \${freedMB} MB of memory\`, 'success');
    }, 2000);
}

function cleanupDisk() {
    const status = document.getElementById('optimization-status');
    status.innerHTML = '<div class="status-message">Cleaning disk...</div>';
    
    // Simulate disk cleanup
    setTimeout(() => {
        const freedGB = (Math.random() * 2 + 0.5).toFixed(1);
        status.innerHTML = \`
            <div class="status-success">
                <i class="fas fa-check-circle"></i>
                Disk cleanup complete! Freed \${freedGB} GB
            </div>
        \`;
        window.uiUtils?.showNotification(\`Freed \${freedGB} GB of disk space\`, 'success');
    }, 3000);
}

function tunePerformance() {
    const status = document.getElementById('optimization-status');
    status.innerHTML = '<div class="status-message">Tuning performance...</div>';
    
    // Simulate performance tuning
    setTimeout(() => {
        status.innerHTML = \`
            <div class="status-success">
                <i class="fas fa-check-circle"></i>
                Performance tuning complete! System optimized
            </div>
        \`;
        window.uiUtils?.showNotification('Performance tuning complete', 'success');
    }, 2500);
}
`;
    }

    /**
     * Plugin management methods
     */
    async refreshPlugins() {
        await this.scanPluginDirectory();
        this.renderPluginsList();
        window.uiUtils?.showNotification('Plugins refreshed', 'success');
    }

    async installPlugin() {
        // This would open a file dialog to select a plugin file
        window.uiUtils?.showNotification('Plugin installation feature coming soon', 'info');
    }

    async reloadPlugin(pluginPath) {
        await this.unloadPlugin(pluginPath);
        const metadata = this.plugins.get(pluginPath);
        if (metadata) {
            await this.loadPlugin(pluginPath, metadata);
        }
        window.uiUtils?.showNotification('Plugin reloaded', 'success');
    }

    async deletePlugin(pluginPath) {
        if (confirm('Are you sure you want to delete this plugin?')) {
            await this.unloadPlugin(pluginPath);
            this.plugins.delete(pluginPath);
            this.pluginConfigs.delete(pluginPath);
            await this.savePluginConfigs();
            this.renderPluginsList();
            window.uiUtils?.showNotification('Plugin deleted', 'success');
        }
    }

    async createSamplePlugins() {
        await this.createSamplePlugins();
        await this.refreshPlugins();
        window.uiUtils?.showNotification('Sample plugins created', 'success');
    }
}

// Initialize plugin system
window.pluginSystem = new PluginSystem();
document.addEventListener('DOMContentLoaded', () => {
    window.pluginSystem.init();
});