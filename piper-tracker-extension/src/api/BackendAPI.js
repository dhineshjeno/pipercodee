"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendAPI = void 0;
const vscode = require("vscode");
class BackendAPI {
    constructor() {
        const config = vscode.workspace.getConfiguration('pipercode');
        this.backendUrl = config.get('backendUrl', 'http://localhost:8000');
        this.userId = config.get('userId', '');
    }
    async sendHeartbeat(activity) {
        if (!this.userId) {
            console.warn('User ID not configured. Please set pipercode.userId in settings.');
            return;
        }
        const heartbeatData = {
            user_id: this.userId,
            language: activity.language,
            project: activity.project,
            file: activity.file,
            start_time: activity.startTime,
            duration: activity.duration,
            lines_changed: activity.linesChanged,
            timestamp: Date.now()
        };
        try {
            const response = await fetch(`${this.backendUrl}/api/analytics/heartbeat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(heartbeatData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('Heartbeat sent successfully');
        }
        catch (error) {
            console.error('Failed to send heartbeat:', error);
            throw error;
        }
    }
    async getTodayStats(userId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/analytics/today/${userId}`);
            return await response.json();
        }
        catch (error) {
            console.error('Failed to fetch stats:', error);
            throw error;
        }
    }
}
exports.BackendAPI = BackendAPI;
//# sourceMappingURL=BackendAPI.js.map