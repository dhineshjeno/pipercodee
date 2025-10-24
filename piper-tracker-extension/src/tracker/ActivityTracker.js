"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
const vscode = require("vscode");
class ActivityTracker {
    constructor(backendAPI, statusBar) {
        this.backendAPI = backendAPI;
        this.statusBar = statusBar;
        this.currentActivity = null;
        this.isTracking = true;
        this.heartbeatInterval = null;
    }
    initialize() {
        this.setupEventListeners();
        this.startHeartbeat();
        this.statusBar.updateStatus('tracking');
    }
    setupEventListeners() {
        // Track active text editor changes
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && this.isTracking) {
                this.handleFileChange(editor);
            }
        });
        // Track text document changes
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.currentActivity && this.isTracking) {
                this.currentActivity.linesChanged =
                    (this.currentActivity.linesChanged || 0) + event.contentChanges.length;
            }
        });
        // Track workspace changes
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.updateProjectName();
        });
    }
    handleFileChange(editor) {
        const document = editor.document;
        const language = this.detectLanguage(document);
        const filePath = document.fileName;
        // If we're already tracking this file, just update the time
        if (this.currentActivity && this.currentActivity.file === filePath) {
            this.currentActivity.duration = Date.now() - this.currentActivity.startTime;
            return;
        }
        // Send previous activity
        if (this.currentActivity) {
            this.sendActivity(this.currentActivity);
        }
        // Start new activity
        this.currentActivity = {
            language,
            project: this.getProjectName(),
            file: filePath,
            startTime: Date.now(),
            duration: 0
        };
        this.statusBar.updateLanguage(language);
    }
    detectLanguage(document) {
        const languageId = document.languageId;
        // Map VS Code language IDs to common names
        const languageMap = {
            'typescript': 'TypeScript',
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust',
            'php': 'PHP',
            'ruby': 'Ruby',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'markdown': 'Markdown',
            'yaml': 'YAML',
            'dockerfile': 'Docker',
            'shellscript': 'Shell'
        };
        return languageMap[languageId] || languageId;
    }
    getProjectName() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].name;
        }
        return 'Unknown Project';
    }
    updateProjectName() {
        if (this.currentActivity) {
            this.currentActivity.project = this.getProjectName();
        }
    }
    async sendActivity(activity) {
        try {
            await this.backendAPI.sendHeartbeat(activity);
            console.log('Activity sent:', activity);
        }
        catch (error) {
            console.error('Failed to send activity:', error);
        }
    }
    startHeartbeat() {
        const config = vscode.workspace.getConfiguration('pipercode');
        const interval = config.get('heartbeatInterval', 120) * 1000;
        this.heartbeatInterval = setInterval(() => {
            if (this.currentActivity && this.isTracking) {
                this.currentActivity.duration = Date.now() - this.currentActivity.startTime;
                this.sendActivity(this.currentActivity);
            }
        }, interval);
    }
    toggleTracking() {
        this.isTracking = !this.isTracking;
        this.statusBar.updateStatus(this.isTracking ? 'tracking' : 'paused');
        return this.isTracking;
    }
    getTodayStats() {
        // This would calculate today's total coding time
        // For now, return mock data
        return '127';
    }
    dispose() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        // Send final activity
        if (this.currentActivity) {
            this.sendActivity(this.currentActivity);
        }
    }
}
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=ActivityTracker.js.map