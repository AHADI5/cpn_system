import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function ProtectedRoute({children, requiredPermissions}) {
    const {user, loading, permissions} = useAuth();

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner or loading component
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasRequiredPermissions = requiredPermissions.every(permission =>
        permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}