import * as vscode from 'vscode';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.show();
    }

    updateStatus(status: 'tracking' | 'paused' | 'error'): void {
        switch (status) {
            case 'tracking':
                this.statusBarItem.text = '$(pulse) PiperCode';
                this.statusBarItem.tooltip = 'Coding activity tracking is active';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'paused':
                this.statusBarItem.text = '$(circle-slash) PiperCode';
                this.statusBarItem.tooltip = 'Coding activity tracking is paused';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                break;
            case 'error':
                this.statusBarItem.text = '$(error) PiperCode';
                this.statusBarItem.tooltip = 'Error connecting to PiperCode backend';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
        }
    }

    updateLanguage(language: string): void {
        this.statusBarItem.text = `$(pulse) PiperCode: ${language}`;
        this.statusBarItem.tooltip = `Coding in ${language} - Activity tracking active`;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}