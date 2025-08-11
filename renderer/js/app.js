// PlayNexus System Monitor - Main Application
class PlayNexusApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.charts = {};
        this.systemData = null;
        this.processes = [];
        this.config = {};
        
        this.init();
    }

    async init() {
        try {
            // Load configuration
            this.config = await window.electronAPI.getConfig();
            
            // Initialize UI components
            this.initWindowControls();
            this.initTabNavigation();
            this.initEventListeners();
            
            // Initialize modules
            this.initDashboard();
            this.initProcesses();
            this.initFiles();
            this.initUtilities();
            this.initSettings();
            
            // Start system monitoring
            this.startSystemMonitoring();
            
            // Load initial data
            await this.loadInitialData();
            
            console.log('PlayNexus System Monitor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    // Window Controls
    initWindowControls() {
        const minimizeBtn = document.getElementById('minimizeBtn');
        const maximizeBtn = document.getElementById('maximizeBtn');
        const closeBtn = document.getElementById('closeBtn');

        minimizeBtn?.addEventListener('click', () => {
            window.electronAPI.minimizeWindow?.();
        });

        maximizeBtn?.addEventListener('click', () => {
            window.electronAPI.maximizeWindow?.();
        });

        closeBtn?.addEventListener('click', () => {
            window.electronAPI.closeWindow?.();
        });
    }

    // Tab Navigation
    initTabNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabName = item.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName)?.classList.add('active');

        this.currentTab = tabName;
        
        // Trigger tab-specific initialization
        this.onTabSwitch(tabName);
    }

    onTabSwitch(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.refreshDashboard();
                break;
            case 'processes':
                this.loadProcesses();
                break;
            case 'files':
                this.loadFileWatcher();
                break;
            case 'utilities':
                // Utilities are already initialized
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Event Listeners
    initEventListeners() {
        // System data updates
        window.electronAPI.onSystemDataUpdate((data) => {
            this.systemData = data;
            this.updateDashboard(data);
        });

        // File events
        window.electronAPI.onFileEvent((event) => {
            this.handleFileEvent(event);
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + R to refresh current tab
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.refreshCurrentTab();
        }

        // Ctrl/Cmd + , to open settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            this.switchTab('settings');
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    // System Monitoring
    startSystemMonitoring() {
        window.electronAPI.startMonitoring();
    }

    stopSystemMonitoring() {
        window.electronAPI.stopMonitoring();
    }

    // Data Loading
    async loadInitialData() {
        try {
            // Load system data
            this.systemData = await window.electronAPI.getSystemData();
            this.updateDashboard(this.systemData);

            // Load processes
            this.processes = await window.electronAPI.getProcesses();
            
            // Load file watcher data
            this.loadFileWatcher();

        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // Dashboard
    initDashboard() {
        this.initCharts();
        this.initDashboardControls();
    }

    initCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            family: 'JetBrains Mono'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 0
                }
            }
        };

        // CPU Chart
        const cpuCtx = document.getElementById('cpuChart')?.getContext('2d');
        if (cpuCtx) {
            this.charts.cpu = new Chart(cpuCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'CPU Usage',
                        data: [],
                        borderColor: '#00ffff',
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: chartOptions
            });
        }

        // Memory Chart
        const memoryCtx = document.getElementById('memoryChart')?.getContext('2d');
        if (memoryCtx) {
            this.charts.memory = new Chart(memoryCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Memory Usage',
                        data: [],
                        borderColor: '#00ff00',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: chartOptions
            });
        }

        // Disk Chart
        const diskCtx = document.getElementById('diskChart')?.getContext('2d');
        if (diskCtx) {
            this.charts.disk = new Chart(diskCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Used', 'Free'],
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: ['#ff00ff', '#333333'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // Network Chart
        const networkCtx = document.getElementById('networkChart')?.getContext('2d');
        if (networkCtx) {
            this.charts.network = new Chart(networkCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Network Speed',
                        data: [],
                        borderColor: '#ff0040',
                        backgroundColor: 'rgba(255, 0, 64, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: chartOptions
            });
        }
    }

    initDashboardControls() {
        const refreshBtn = document.getElementById('refreshBtn');
        const exportBtn = document.getElementById('exportBtn');

        refreshBtn?.addEventListener('click', () => {
            this.refreshDashboard();
        });

        exportBtn?.addEventListener('click', () => {
            this.exportSystemData();
        });
    }

    updateDashboard(data) {
        if (!data) return;

        // Update CPU
        if (data.cpu) {
            const cpuUsage = Math.round(data.cpu.load);
            document.getElementById('cpuUsage').textContent = `${cpuUsage}%`;
            this.updateChart(this.charts.cpu, cpuUsage);
        }

        // Update Memory
        if (data.memory) {
            const memoryUsage = Math.round((data.memory.used / data.memory.total) * 100);
            document.getElementById('memoryUsage').textContent = `${memoryUsage}%`;
            this.updateChart(this.charts.memory, memoryUsage);
        }

        // Update Disk
        if (data.disk && data.disk.length > 0) {
            const mainDisk = data.disk[0];
            const diskUsage = Math.round(mainDisk.use);
            document.getElementById('diskUsage').textContent = `${diskUsage}%`;
            this.updateDiskChart(diskUsage);
        }

        // Update Network
        if (data.network && data.network.length > 0) {
            const mainNetwork = data.network[0];
            const networkSpeed = this.formatBytes(mainNetwork.rxSec + mainNetwork.txSec);
            document.getElementById('networkSpeed').textContent = `${networkSpeed}/s`;
            this.updateChart(this.charts.network, mainNetwork.rxSec + mainNetwork.txSec);
        }

        // Update system info
        this.updateSystemInfo(data);
    }

    updateChart(chart, value) {
        if (!chart) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString();

        chart.data.labels.push(timeString);
        chart.data.datasets[0].data.push(value);

        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    updateDiskChart(usage) {
        if (!this.charts.disk) return;

        this.charts.disk.data.datasets[0].data = [usage, 100 - usage];
        this.charts.disk.update();
    }

    updateSystemInfo(data) {
        const systemInfo = document.getElementById('systemInfo');
        if (!systemInfo) return;

        const info = [
            { label: 'OS', value: 'Windows 10' },
            { label: 'Architecture', value: 'x64' },
            { label: 'CPU Cores', value: data.cpu?.cores?.length || 'Unknown' },
            { label: 'Total Memory', value: this.formatBytes(data.memory?.total || 0) },
            { label: 'Available Memory', value: this.formatBytes(data.memory?.available || 0) },
            { label: 'Disk Space', value: this.formatBytes(data.disk?.[0]?.size || 0) },
            { label: 'Network Interfaces', value: data.network?.length || 0 }
        ];

        systemInfo.innerHTML = info.map(item => `
            <div class="info-item">
                <span class="info-label">${item.label}</span>
                <span class="info-value">${item.value}</span>
            </div>
        `).join('');
    }

    // Processes
    initProcesses() {
        this.initProcessControls();
    }

    initProcessControls() {
        const refreshBtn = document.getElementById('refreshProcessesBtn');
        const searchInput = document.getElementById('processSearch');

        refreshBtn?.addEventListener('click', () => {
            this.loadProcesses();
        });

        searchInput?.addEventListener('input', (e) => {
            this.filterProcesses(e.target.value);
        });
    }

    async loadProcesses() {
        try {
            this.processes = await window.electronAPI.getProcesses();
            this.renderProcesses();
        } catch (error) {
            console.error('Failed to load processes:', error);
            this.showNotification('Failed to load processes', 'error');
        }
    }

    renderProcesses() {
        const tbody = document.getElementById('processesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.processes.map(process => `
            <tr>
                <td>${process.name}</td>
                <td>${process.pid}</td>
                <td>${process.cpu?.toFixed(1) || '0.0'}%</td>
                <td>${this.formatBytes(process.memory || 0)}</td>
                <td><span class="status-running">Running</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="app.killProcess(${process.pid})">
                        Kill
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filterProcesses(searchTerm) {
        const tbody = document.getElementById('processesTableBody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const processName = row.cells[0]?.textContent?.toLowerCase() || '';
            const matches = processName.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    // Files
    initFiles() {
        this.initFileControls();
    }

    initFileControls() {
        const addPathBtn = document.getElementById('addWatchPathBtn');
        const clearLogsBtn = document.getElementById('clearLogsBtn');

        addPathBtn?.addEventListener('click', () => {
            this.addWatchPath();
        });

        clearLogsBtn?.addEventListener('click', () => {
            this.clearFileLogs();
        });
    }

    async addWatchPath() {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) {
                // Add to config and restart file watcher
                this.config.fileWatcher.paths.push(path);
                await window.electronAPI.saveConfig(this.config);
                this.loadFileWatcher();
                this.showNotification('Path added to file watcher', 'success');
            }
        } catch (error) {
            console.error('Failed to add watch path:', error);
            this.showNotification('Failed to add watch path', 'error');
        }
    }

    loadFileWatcher() {
        const pathsList = document.getElementById('watchPathsList');
        if (!pathsList) return;

        pathsList.innerHTML = this.config.fileWatcher?.paths?.map(path => `
            <div class="path-item">
                <span>${path}</span>
                <button class="btn btn-secondary btn-sm" onclick="app.removeWatchPath('${path}')">
                    Remove
                </button>
            </div>
        `).join('') || '<p>No paths watched</p>';
    }

    handleFileEvent(event) {
        const eventsLog = document.getElementById('fileEventsLog');
        if (!eventsLog) return;

        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;
        eventItem.innerHTML = `
            <strong>${event.type.toUpperCase()}</strong>: ${event.path}
            <small>${new Date().toLocaleTimeString()}</small>
        `;

        eventsLog.insertBefore(eventItem, eventsLog.firstChild);

        // Keep only last 100 events
        while (eventsLog.children.length > 100) {
            eventsLog.removeChild(eventsLog.lastChild);
        }
    }

    // Utilities
    initUtilities() {
        this.initUtilityControls();
    }

    initUtilityControls() {
        const screenshotBtn = document.getElementById('screenshotBtn');
        const clipboardBtn = document.getElementById('clipboardBtn');
        const cleanerBtn = document.getElementById('cleanerBtn');
        const networkToolsBtn = document.getElementById('networkToolsBtn');

        screenshotBtn?.addEventListener('click', () => {
            this.takeScreenshot();
        });

        clipboardBtn?.addEventListener('click', () => {
            this.showClipboard();
        });

        cleanerBtn?.addEventListener('click', () => {
            this.startSystemCleanup();
        });

        networkToolsBtn?.addEventListener('click', () => {
            this.showNetworkTools();
        });
    }

    async takeScreenshot() {
        try {
            const path = await window.electronAPI.takeScreenshot();
            this.showNotification(`Screenshot saved to: ${path}`, 'success');
        } catch (error) {
            console.error('Failed to take screenshot:', error);
            this.showNotification('Failed to take screenshot', 'error');
        }
    }

    async showClipboard() {
        try {
            const content = await window.electronAPI.getClipboardContent?.();
            this.showModal('Clipboard Content', `
                <div style="max-height: 300px; overflow-y: auto;">
                    <pre style="background: var(--tertiary-bg); padding: 16px; border-radius: 6px; color: var(--text-secondary);">${content || 'Clipboard is empty'}</pre>
                </div>
            `);
        } catch (error) {
            console.error('Failed to get clipboard content:', error);
            this.showNotification('Failed to get clipboard content', 'error');
        }
    }

    startSystemCleanup() {
        this.showModal('System Cleanup', `
            <p>This will clean temporary files and optimize system performance.</p>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="app.performCleanup()">Start Cleanup</button>
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
            </div>
        `);
    }

    showNetworkTools() {
        this.showModal('Network Tools', `
            <div style="display: grid; gap: 16px;">
                <button class="btn btn-primary" onclick="app.pingTest()">Ping Test</button>
                <button class="btn btn-primary" onclick="app.traceroute()">Traceroute</button>
                <button class="btn btn-primary" onclick="app.networkScan()">Network Scan</button>
            </div>
        `);
    }

    // Settings
    initSettings() {
        this.loadSettings();
        this.initSettingsControls();
    }

    loadSettings() {
        // Load current settings into UI
        document.getElementById('cpuMonitoring')?.checked = this.config.monitoring?.cpu || false;
        document.getElementById('memoryMonitoring')?.checked = this.config.monitoring?.memory || false;
        document.getElementById('diskMonitoring')?.checked = this.config.monitoring?.disk || false;
        document.getElementById('networkMonitoring')?.checked = this.config.monitoring?.network || false;
        document.getElementById('notificationsEnabled')?.checked = this.config.notifications?.enabled || false;
        document.getElementById('soundEnabled')?.checked = this.config.notifications?.sound || false;
        document.getElementById('autoStart')?.checked = this.config.autoStart || false;
    }

    initSettingsControls() {
        // Theme selector
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.changeTheme(theme);
            });
        });

        // Settings toggles
        document.getElementById('cpuMonitoring')?.addEventListener('change', (e) => {
            this.updateSetting('monitoring.cpu', e.target.checked);
        });

        document.getElementById('memoryMonitoring')?.addEventListener('change', (e) => {
            this.updateSetting('monitoring.memory', e.target.checked);
        });

        document.getElementById('diskMonitoring')?.addEventListener('change', (e) => {
            this.updateSetting('monitoring.disk', e.target.checked);
        });

        document.getElementById('networkMonitoring')?.addEventListener('change', (e) => {
            this.updateSetting('monitoring.network', e.target.checked);
        });

        document.getElementById('notificationsEnabled')?.addEventListener('change', (e) => {
            this.updateSetting('notifications.enabled', e.target.checked);
        });

        document.getElementById('soundEnabled')?.addEventListener('change', (e) => {
            this.updateSetting('notifications.sound', e.target.checked);
        });

        document.getElementById('autoStart')?.addEventListener('change', (e) => {
            this.updateSetting('autoStart', e.target.checked);
        });
    }

    async updateSetting(path, value) {
        try {
            const pathParts = path.split('.');
            let current = this.config;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
                if (!current[pathParts[i]]) {
                    current[pathParts[i]] = {};
                }
                current = current[pathParts[i]];
            }
            
            current[pathParts[pathParts.length - 1]] = value;
            
            await window.electronAPI.saveConfig(this.config);
            this.showNotification('Settings saved', 'success');
        } catch (error) {
            console.error('Failed to save setting:', error);
            this.showNotification('Failed to save setting', 'error');
        }
    }

    changeTheme(theme) {
        document.body.className = `theme-${theme}`;
        
        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`)?.classList.add('active');
        
        this.updateSetting('theme', theme);
    }

    // Utility Methods
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    refreshCurrentTab() {
        this.onTabSwitch(this.currentTab);
    }

    refreshDashboard() {
        this.loadInitialData();
    }

    async exportSystemData() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                system: this.systemData,
                processes: this.processes,
                config: this.config
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('System data exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    // Modal Management
    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const modalOverlay = document.getElementById('modalOverlay');

        if (modalTitle) modalTitle.textContent = title;
        if (modalContent) modalContent.innerHTML = content;
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    // Notifications
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Cleanup
    destroy() {
        this.stopSystemMonitoring();
        window.electronAPI.removeAllListeners('system-data-update');
        window.electronAPI.removeAllListeners('file-event');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlayNexusApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});