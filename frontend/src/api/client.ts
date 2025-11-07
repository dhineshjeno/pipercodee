import { getAuthHeader } from '../config/cognito';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://r0cwi88py6.execute-api.ap-south-1.amazonaws.com/prod';

async function request(path: string, init?: RequestInit) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...getAuthHeader(),
		...(init?.headers as Record<string, string> | undefined),
	};

	const res = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers,
		credentials: 'omit',
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`API ${res.status}: ${text}`);
	}

	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		return res.json();
	}
	return res.text();
}

export async function getMe(): Promise<any> {
	return request('/me');
}

export async function getUserById(userId: string | undefined): Promise<any> {
    return request(`/user/${userId}`, {
      method: 'GET',
    });
}

export async function getLeaderboard(): Promise<any[]> {
	return request('/leaderboard');
}

export async function updateMe(payload: {
    name?: string;
    username?: string;
    statusMessage?: string;
    notifications?: {
      friendActivity: boolean;
      achievements: boolean;
      weeklyReport: boolean;
      leaderboardUpdates: boolean;
    };
    privacy?: {
      showProfile: boolean;
      showActivity: boolean;
      showStats: boolean;
    };
  }): Promise<any> {
    return request('/me', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

