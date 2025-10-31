export const cognitoRegion = 'ap-south-1';
export const cognitoUserPoolId = 'ap-south-1_F2cFRz0qR';
export const cognitoAppClientId = '3b7fr3mamdosg4nnbjaklsk53j';
export const cognitoDomain = 'https://ap-south-1f2cfrz0qr.auth.ap-south-1.amazoncognito.com';

export function getRedirectUri(): string {
	return `${window.location.origin}/auth/callback`;
}

export function getLogoutUri(): string {
	return `${window.location.origin}/`;
}

function baseAuthorizeParams(): URLSearchParams {
    return new URLSearchParams({
        client_id: cognitoAppClientId,
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: getRedirectUri(),
    });
}

export function buildAuthorizeUrl(): string {
    const params = baseAuthorizeParams();
    return `${cognitoDomain}/oauth2/authorize?${params.toString()}`;
}

async function sha256(input: Uint8Array): Promise<ArrayBuffer> {
    return await crypto.subtle.digest('SHA-256', input as unknown as BufferSource);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString(length: number = 64): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < randomValues.length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}

export async function beginLoginWithPKCE(): Promise<void> {
    const codeVerifier = generateRandomString(96);
    const encoder = new TextEncoder();
    const verifierBytes = encoder.encode(codeVerifier);
    const codeChallenge = base64UrlEncode(await sha256(verifierBytes));

    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const params = baseAuthorizeParams();
    params.set('code_challenge_method', 'S256');
    params.set('code_challenge', codeChallenge);

    const url = `${cognitoDomain}/oauth2/authorize?${params.toString()}`;
    window.location.replace(url);
}

export function buildLogoutUrl(): string {
	const params = new URLSearchParams({
		client_id: cognitoAppClientId,
		logout_uri: getLogoutUri(),
	});
	return `${cognitoDomain}/logout?${params.toString()}`;
}

export function setAuthenticated(value: boolean): void {
	if (value) {
		sessionStorage.setItem('isAuthenticated', 'true');
	} else {
		sessionStorage.removeItem('isAuthenticated');
		sessionStorage.removeItem('cognitoCode');
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('id_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('id_token_payload');
	}
}

export function isAuthenticated(): boolean {
    const idToken = sessionStorage.getItem('id_token');
    if (!idToken) return sessionStorage.getItem('isAuthenticated') === 'true';
    try {
        const [, payloadB64] = idToken.split('.');
        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        const now = Math.floor(Date.now() / 1000);
        return typeof payload.exp === 'number' && payload.exp > now;
    } catch {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    }
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) {
        throw new Error('Missing PKCE code_verifier');
    }

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognitoAppClientId,
        code,
        redirect_uri: getRedirectUri(),
        code_verifier: codeVerifier,
    });

    const res = await fetch(`${cognitoDomain}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token exchange failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    const idToken: string | undefined = data.id_token;
    const accessToken: string | undefined = data.access_token;
    const refreshToken: string | undefined = data.refresh_token;

    if (idToken) {
        sessionStorage.setItem('id_token', idToken);
        try {
            const [, payloadB64] = idToken.split('.');
            const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
            sessionStorage.setItem('id_token_payload', payloadJson);
        } catch {}
    }
    if (accessToken) sessionStorage.setItem('access_token', accessToken);
    if (refreshToken) sessionStorage.setItem('refresh_token', refreshToken);

    setAuthenticated(true);
}

export function getIdTokenClaims(): Record<string, any> | null {
    const payload = sessionStorage.getItem('id_token_payload');
    if (!payload) return null;
    try {
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

export function getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
}

export function getAuthHeader(): Record<string, string> {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}


