import React, { useEffect, useMemo, useState } from 'react';
import { exchangeCodeForTokens } from '../config/cognito';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
	const navigate = useNavigate();
	const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState<string>('');
	const { code, error, errorDescription } = useMemo(() => {
		const params = new URLSearchParams(window.location.search);
		return {
			code: params.get('code'),
			error: params.get('error'),
			errorDescription: params.get('error_description'),
		};
	}, []);

	useEffect(() => {
		// Handle OAuth errors from Cognito
		if (error) {
			setStatus('error');
			const errorMsg = errorDescription || error;
			setMessage(`Authentication error: ${errorMsg}`);
			
			// Common error messages
			if (error === 'invalid_scope') {
				setMessage('Invalid scope error. Please check that your Cognito app client has "openid", "email", and "profile" scopes enabled.');
			} else if (error === 'invalid_request') {
				setMessage('Invalid request. Please check your Cognito app client configuration and callback URLs.');
			}
			return;
		}

		// Handle successful authorization code
		if (code) {
			(async () => {
				try {
					await exchangeCodeForTokens(code);
					setStatus('success');
					setMessage('Signed in successfully. Redirecting...');
					setTimeout(() => {
						navigate('/', { replace: true });
					}, 1000);
				} catch (e: any) {
					setStatus('error');
					setMessage(e?.message || 'Authentication failed');
				}
			})();
		}
	}, [code, error, errorDescription, navigate]);

	return (
		<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<h1 className="text-2xl font-bold text-slate-100 mb-4">Authentication</h1>
			{error && (
				<div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-4">
					<p className="text-red-400 font-semibold mb-2">Error: {error}</p>
					{errorDescription && (
						<p className="text-red-300 text-sm">{errorDescription}</p>
					)}
					<div className="mt-4 text-sm text-slate-400">
						<p className="mb-2">Common fixes:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Check that your Cognito app client has the correct OAuth scopes enabled</li>
							<li>Verify the callback URL matches exactly: https://pipercodeee.vercel.app/auth/callback</li>
							<li>Ensure the app client is configured as a Public client</li>
							<li>Check that Authorization code grant is enabled</li>
						</ul>
					</div>
					<button
						onClick={() => navigate('/login')}
						className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
					>
						Try Again
					</button>
				</div>
			)}
			{status === 'success' && (
				<div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4">
					<p className="text-emerald-300">{message}</p>
				</div>
			)}
			{status === 'error' && !error && (
				<div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
					<p className="text-red-400">{message}</p>
				</div>
			)}
			{!code && !error && status === 'idle' && (
				<p className="text-slate-300">Processing authentication…</p>
			)}
		</div>
	);
};


