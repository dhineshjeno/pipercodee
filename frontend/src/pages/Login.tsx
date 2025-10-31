import React, { useEffect } from 'react';
import { beginLoginWithPKCE } from '../config/cognito';

export const Login: React.FC = () => {
	useEffect(() => {
		beginLoginWithPKCE();
	}, []);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<p className="text-slate-300">Redirecting to sign in…</p>
		</div>
	);
};


