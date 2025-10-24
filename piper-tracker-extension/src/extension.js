"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ActivityTracker_1 = require("./tracker/ActivityTracker");
const StatusBar_1 = require("./ui/StatusBar");
const BackendAPI_1 = require("./api/BackendAPI");
function activate(context) {
    console.log('PiperCode Activity Tracker is now active!');
    // Initialize components
    const backendAPI = new BackendAPI_1.BackendAPI();
    const statusBar = new StatusBar_1.StatusBar();
    const activityTracker = new ActivityTracker_1.ActivityTracker(backendAPI, statusBar);
    // Register commands
    const showStatsCommand = vscode.commands.registerCommand('pipercode.showStats', () => {
        vscode.window.showInformationMessage(`Today's coding: ${activityTracker.getTodayStats()} minutes`);
    });
    const toggleTrackingCommand = vscode.commands.registerCommand('pipercode.toggleTracking', () => {
        const isEnabled = activityTracker.toggleTracking();
        vscode.window.showInformationMessage(`Activity tracking ${isEnabled ? 'enabled' : 'disabled'}`);
    });
    // Start tracking
    activityTracker.initialize();
    // Add to subscriptions
    context.subscriptions.push(showStatsCommand);
    context.subscriptions.push(toggleTrackingCommand);
    context.subscriptions.push(activityTracker);
    context.subscriptions.push(statusBar);
}
exports.activate = activate;
function deactivate() {
    console.log('PiperCode Activity Tracker is now deactivated!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map