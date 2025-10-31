import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../config/cognito';

interface ProtectedRouteProps {
	children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const location = useLocation();
	const authed = isAuthenticated();

	if (!authed) {
		return (
			<Navigate to="/login" state={{ from: location.pathname }} replace />
		);
	}

	return children;
};


