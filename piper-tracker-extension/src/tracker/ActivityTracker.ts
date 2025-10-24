import * as vscode from 'vscode';
import { BackendAPI } from '../api/BackendAPI';
import { StatusBar } from '../ui/StatusBar';

export interface CodingActivity {
    language: string;
    project: string;
    file: string;
    startTime: number;
    duration: number;
    linesChanged?: number;
}

export class ActivityTracker {
    private currentActivity: CodingActivity | null = null;
    private isTracking: boolean = true;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor(
        private backendAPI: BackendAPI,
        private statusBar: StatusBar
    ) {}

    public initialize(): void {
        this.setupEventListeners();
        this.startHeartbeat();
        this.statusBar.updateStatus('tracking');
    }

    private setupEventListeners(): void {
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

    private handleFileChange(editor: vscode.TextEditor): void {
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

    private detectLanguage(document: vscode.TextDocument): string {
        const languageId = document.languageId;
        
        // Map VS Code language IDs to common names
        const languageMap: { [key: string]: string } = {
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

    private getProjectName(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].name;
        }
        return 'Unknown Project';
    }

    private updateProjectName(): void {
        if (this.currentActivity) {
            this.currentActivity.project = this.getProjectName();
        }
    }

    private async sendActivity(activity: CodingActivity): Promise<void> {
        try {
            await this.backendAPI.sendHeartbeat(activity);
            console.log('Activity sent:', activity);
        } catch (error) {
            console.error('Failed to send activity:', error);
        }
    }

    private startHeartbeat(): void {
        const config = vscode.workspace.getConfiguration('pipercode');
        const interval = config.get<number>('heartbeatInterval', 120) * 1000;

        this.heartbeatInterval = setInterval(() => {
            if (this.currentActivity && this.isTracking) {
                this.currentActivity.duration = Date.now() - this.currentActivity.startTime;
                this.sendActivity(this.currentActivity);
            }
        }, interval);
    }

    public toggleTracking(): boolean {
        this.isTracking = !this.isTracking;
        this.statusBar.updateStatus(this.isTracking ? 'tracking' : 'paused');
        return this.isTracking;
    }

    public getTodayStats(): string {
        // This would calculate today's total coding time
        // For now, return mock data
        return '127';
    }

    public dispose(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        // Send final activity
        if (this.currentActivity) {
            this.sendActivity(this.currentActivity);
        }
    }
}