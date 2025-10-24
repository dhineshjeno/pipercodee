import * as vscode from 'vscode';
import { ActivityTracker } from './tracker/ActivityTracker';
import { StatusBar } from './ui/StatusBar';
import { BackendAPI } from './api/BackendAPI';

export function activate(context: vscode.ExtensionContext) {
    console.log('PiperCode Activity Tracker is now active!');

    // Initialize components
    const backendAPI = new BackendAPI();
    const statusBar = new StatusBar();
    const activityTracker = new ActivityTracker(backendAPI, statusBar);

    // Register commands
    const showStatsCommand = vscode.commands.registerCommand('pipercode.showStats', () => {
        vscode.window.showInformationMessage(
            `Today's coding: ${activityTracker.getTodayStats()} minutes`
        );
    });

    const toggleTrackingCommand = vscode.commands.registerCommand('pipercode.toggleTracking', () => {
        const isEnabled = activityTracker.toggleTracking();
        vscode.window.showInformationMessage(
            `Activity tracking ${isEnabled ? 'enabled' : 'disabled'}`
        );
    });

    // Start tracking
    activityTracker.initialize();

    // Add to subscriptions
    context.subscriptions.push(showStatsCommand);
    context.subscriptions.push(toggleTrackingCommand);
    context.subscriptions.push(activityTracker);
    context.subscriptions.push(statusBar);
}

export function deactivate() {
    console.log('PiperCode Activity Tracker is now deactivated!');
}