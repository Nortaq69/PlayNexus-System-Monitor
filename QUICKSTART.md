# PlayNexus System Monitor - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- **Windows 10** (64-bit)
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)

### Option 1: Automatic Installation (Recommended)

1. **Download and Extract**
   - Download the project files
   - Extract to a folder (e.g., `C:\PlayNexus\`)

2. **Run Installer**
   ```cmd
   double-click install.bat
   ```
   - Follow the prompts
   - Choose whether to auto-start with Windows

3. **Launch Application**
   - Desktop shortcut will be created automatically
   - Or run: `npm start`

### Option 2: Manual Installation

1. **Open Command Prompt**
   ```cmd
   cd C:\path\to\playnexus-system-monitor
   ```

2. **Install Dependencies**
   ```cmd
   npm install
   ```

3. **Start Application**
   ```cmd
   npm start
   ```

## 🎯 First Steps

### 1. Dashboard Overview
- **CPU Usage**: Real-time processor monitoring
- **Memory Usage**: RAM consumption tracking
- **Disk Usage**: Storage space monitoring
- **Network Activity**: Network speed and interface stats

### 2. Process Management
- Click **Processes** in the sidebar
- View all running processes
- Search for specific processes
- Monitor resource usage per process

### 3. File Monitoring
- Click **File Watcher** in the sidebar
- Add directories to monitor
- Watch for file changes in real-time
- View event history

### 4. System Utilities
- **Screenshot Tool**: Capture desktop screenshots
- **Clipboard Manager**: View clipboard content
- **System Cleaner**: Clean temporary files
- **Network Tools**: Network diagnostics

### 5. Customization
- Click **Settings** in the sidebar
- Choose from multiple themes:
  - **Cyberpunk** (default)
  - **Terminal**
  - **Synthwave**
- Configure monitoring options
- Set up notifications

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + R` | Refresh current tab |
| `Ctrl + ,` | Open settings |
| `Escape` | Close modals |
| `F11` | Toggle fullscreen |

## 🔧 Configuration

### Configuration Location
```
%APPDATA%\playnexus-system-monitor\config.json
```

### Key Settings
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
  "notifications": {
    "enabled": true,
    "sound": true
  }
}
```

## 🛠️ Building for Distribution

### Create Windows Installer
```cmd
npm run build:win
```

### Create Portable Version
```cmd
npm run dist
```

### Use Build Script
```cmd
double-click build.bat
```

## 🐛 Troubleshooting

### Application Won't Start
1. Check Node.js installation: `node --version`
2. Reinstall dependencies: `npm install`
3. Clear cache: `npm cache clean --force`

### System Monitoring Not Working
1. Run as administrator
2. Check Windows Defender settings
3. Verify systeminformation package: `npm list systeminformation`

### Build Errors
1. Update Node.js to latest LTS version
2. Clear node_modules: `rmdir /s node_modules`
3. Reinstall: `npm install`

### Performance Issues
1. Disable unnecessary monitoring in settings
2. Close other resource-intensive applications
3. Check available system resources

## 📞 Support

### Getting Help
- Check the main README.md for detailed documentation
- Review troubleshooting section above
- Check Windows Event Viewer for errors

### Common Issues

**Q: The app shows "0%" for all metrics**
A: Run the application as administrator for full system access

**Q: Charts are not updating**
A: Check if monitoring is enabled in settings

**Q: File watcher not working**
A: Ensure the directory path exists and is accessible

**Q: Theme not changing**
A: Restart the application after changing themes

## 🎨 Themes Preview

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

## 🔒 Security Notes

- Application runs with user privileges by default
- System monitoring requires administrator access for full functionality
- No data is sent to external servers
- Configuration is stored locally

## 📈 Performance Tips

1. **Disable unused monitoring** in settings
2. **Close unnecessary tabs** when not in use
3. **Use portable version** for better performance
4. **Monitor system resources** to avoid conflicts

---

**Ready to monitor your system like a cyberpunk hacker?** 🚀

*For detailed documentation, see README.md*