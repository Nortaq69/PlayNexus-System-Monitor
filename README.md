# PlayNexus System Monitor

A cyberpunk-themed Windows system monitoring and utility tool built with Electron. Features real-time system monitoring, process management, file watching, and various system utilities with a stunning futuristic UI.

![PlayNexus System Monitor](https://img.shields.io/badge/PlayNexus-System%20Monitor-00ffff?style=for-the-badge&logo=electron)

## 🚀 Features

### 📊 Real-time System Monitoring
- **CPU Usage**: Live CPU monitoring with animated charts
- **Memory Usage**: Real-time memory consumption tracking
- **Disk Usage**: Storage space monitoring with visual indicators
- **Network Activity**: Network speed and interface monitoring
- **System Information**: Detailed system specs and statistics

### 🔧 Process Management
- **Process List**: View all running processes with details
- **Search & Filter**: Find specific processes quickly
- **Resource Usage**: Monitor CPU and memory usage per process
- **Process Control**: Kill processes safely

### 📁 File System Monitor
- **File Watching**: Monitor directories for file changes
- **Real-time Events**: Track file additions, modifications, and deletions
- **Event Logging**: Maintain history of file system events
- **Multiple Paths**: Watch multiple directories simultaneously

### 🛠️ System Utilities
- **Screenshot Tool**: Capture desktop screenshots
- **Clipboard Manager**: View and manage clipboard content
- **System Cleaner**: Clean temporary files and optimize performance
- **Network Tools**: Network diagnostics and testing

### 🎨 Advanced UI/UX
- **Cyberpunk Theme**: Futuristic dark theme with neon accents
- **Glassmorphism**: Modern glass-like interface elements
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: Fluid transitions and hover effects
- **Multiple Themes**: Cyberpunk, Terminal, and Synthwave themes

### ⚙️ Configuration & Settings
- **Persistent Settings**: Save preferences across sessions
- **Theme Switching**: Choose from multiple visual themes
- **Monitoring Controls**: Enable/disable specific monitoring features
- **Auto-start**: Configure application to start with Windows

## 🛠️ Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Windows 10** (64-bit)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playnexus-system-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development mode**
   ```bash
   npm run dev
   ```

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Build Windows installer**
   ```bash
   npm run build:win
   ```

3. **Create portable version**
   ```bash
   npm run dist
   ```

## 📦 Build Outputs

After building, you'll find the following in the `dist` folder:

- **PlayNexus System Monitor Setup.exe** - Windows installer
- **PlayNexus System Monitor.exe** - Portable executable
- **win-unpacked/** - Unpacked application folder

## 🏗️ Project Structure

```
playnexus-system-monitor/
├── main.js                 # Main Electron process
├── preload.js             # Preload script for security
├── package.json           # Project configuration
├── renderer/              # Frontend application
│   ├── index.html         # Main HTML file
│   ├── styles/            # CSS stylesheets
│   │   ├── main.css       # Main styles
│   │   ├── components.css # Component styles
│   │   └── themes.css     # Theme definitions
│   └── js/                # JavaScript modules
│       ├── app.js         # Main application logic
│       ├── dashboard.js   # Dashboard functionality
│       ├── processes.js   # Process management
│       ├── files.js       # File watching
│       ├── utilities.js   # System utilities
│       ├── settings.js    # Settings management
│       └── ui.js          # UI utilities
├── assets/                # Static assets
│   ├── icons/             # Application icons
│   ├── fonts/             # Custom fonts
│   └── sounds/            # Audio files
└── dist/                  # Build outputs
```

## 🔧 Configuration

The application stores configuration in the user data directory:

**Windows**: `%APPDATA%/playnexus-system-monitor/config.json`

### Configuration Options

```json
{
  "theme": "cyberpunk",
  "autoStart": false,
  "monitoring": {
    "cpu": true,
    "memory": true,
    "disk": true,
    "network": true
  },
  "fileWatcher": {
    "enabled": false,
    "paths": []
  },
  "notifications": {
    "enabled": true,
    "sound": true
  }
}
```

## 🎨 Themes

### Cyberpunk (Default)
- Dark background with neon cyan accents
- Glassmorphism effects
- Futuristic typography

### Terminal
- Classic terminal appearance
- Green text on black background
- Monospace fonts

### Synthwave
- Purple and pink gradient backgrounds
- Retro-futuristic aesthetic
- Neon grid effects

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + R**: Refresh current tab
- **Ctrl/Cmd + ,**: Open settings
- **Escape**: Close modals
- **F11**: Toggle fullscreen

## 🔒 Security Features

- **Context Isolation**: Secure communication between main and renderer processes
- **Node Integration Disabled**: Prevents direct Node.js access from renderer
- **Single Instance**: Prevents multiple application instances
- **Input Validation**: All user inputs are validated and sanitized

## 🚀 Performance Optimization

- **Efficient Monitoring**: Optimized system data collection
- **Memory Management**: Proper cleanup of resources
- **Chart Optimization**: Smooth animations with minimal CPU usage
- **Lazy Loading**: Load components only when needed

## 🐛 Troubleshooting

### Common Issues

1. **Application won't start**
   - Ensure Node.js is installed and up to date
   - Check that all dependencies are installed
   - Verify Windows 10 compatibility

2. **System monitoring not working**
   - Run as administrator for full system access
   - Check Windows Defender/firewall settings
   - Verify systeminformation package installation

3. **Build errors**
   - Clear node_modules and reinstall dependencies
   - Update electron-builder to latest version
   - Check Windows SDK installation

### Debug Mode

Run the application in debug mode to see detailed logs:

```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron** - Cross-platform desktop application framework
- **Chart.js** - Beautiful charts and graphs
- **Systeminformation** - System monitoring library
- **Google Fonts** - Typography (Orbitron, JetBrains Mono)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ for the PlayNexus community**

*Experience the future of system monitoring with PlayNexus System Monitor*