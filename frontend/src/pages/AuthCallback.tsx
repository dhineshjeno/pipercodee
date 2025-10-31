import React, { useEffect, useMemo, useState } from 'react';
import { exchangeCodeForTokens } from '../config/cognito';

export const AuthCallback: React.FC = () => {
	const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState<string>('');
	const { code, error } = useMemo(() => {
		const params = new URLSearchParams(window.location.search);
		return {
			code: params.get('code'),
			error: params.get('error'),
		};
	}, []);

	useEffect(() => {
		(async () => {
			if (!code) return;
			try {
				await exchangeCodeForTokens(code);
				setStatus('success');
				setMessage('Signed in successfully.');
			} catch (e: any) {
				setStatus('error');
				setMessage(e?.message || 'Authentication failed');
			}
		})();
	}, [code]);

	return (
		<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<h1 className="text-2xl font-bold text-slate-100 mb-4">Authentication</h1>
			{error && (
				<p className="text-red-400">Error: {error}</p>
			)}
			{status === 'success' && (
				<p className="text-slate-300">{message}</p>
			)}
			{status === 'error' && (
				<p className="text-red-400">{message}</p>
			)}
			{!code && !error && status === 'idle' && (
				<p className="text-slate-300">Processing authentication…</p>
			)}
		</div>
	);
};


