import type { NavKey } from './components/Sidebar';
import LoginScreen from './pages/admin/LoginScreen';
import DashboardScreen from './pages/admin/DashboardScreen';
import UsersScreen from './pages/admin/UsersScreen';
import UserDetailScreen from './pages/admin/UserDetailScreen';
import TransactionsScreen from './pages/admin/TransactionsScreen';
import ProvidersScreen from './pages/admin/ProvidersScreen';
import CommunitiesScreen from './pages/admin/CommunitiesScreen';
import InformationScreen from './pages/admin/InformationScreen';
import TicketsScreen from './pages/admin/TicketsScreen';
import BroadcastScreen from './pages/admin/BroadcastScreen';
import SettingsScreen from './pages/admin/SettingsScreen';
import Home from './pages/home';
import NewUserDashboard from './pages/NewUserDashboard';
import Respond from './pages/Respond';
import Waitlist from './pages/Waitlist';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { PlatformUser } from './types';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const AUTH_TOKEN_KEY = 'authToken';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
  });
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const tokenExists = Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
    setIsAuthenticated(tokenExists);
  }, []);

  function handleSignIn() {
    setIsAuthenticated(true);
    try {
      window.location.href = '/admin/dashboard';
    } catch {
      // ignore in non-browser environments
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setSelectedUser(null);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    try {
      window.location.href = '/admin/login';
    } catch {
      // ignore in non-browser environments
    }
  }

  const navKeyToPath = (k: NavKey) => {
    switch (k) {
      case 'dashboard':
        return '/admin/dashboard';
      case 'users':
        return '/admin/users';
      case 'transactions':
        return '/admin/transactions';
      case 'providers':
        return '/admin/providers';
      case 'communities':
        return '/admin/communities';
      case 'information':
        return '/admin/information';
      case 'tickets':
        return '/admin/tickets';
      case 'broadcast':
        return '/admin/broadcast';
      case 'settings':
        return '/admin/settings';
      default:
        return '/admin/dashboard';
    }
  };

  function AdminProtected({ children }: { children: ReactNode }) {
    return isAuthenticated ? (
      <>{children}</>
    ) : (
      <Navigate to="/admin/login" replace />
    );
  }

  function AdminRoute({ Component }: { Component: any }) {
    const navigate = useNavigate();

    const onNavigate = (k: NavKey) => navigate(navKeyToPath(k));

    return (
      <Component
        onNavigate={onNavigate}
        onLogout={handleLogout}
        onViewUser={(user: PlatformUser) => {
          setSelectedUser(user);
          navigate(`/admin/users/${user.id}`);
        }}
        user={selectedUser}
        onBack={() => navigate('/admin/users')}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/respond" element={<Respond />} />
          <Route path="/new-user-dashboard" element={<NewUserDashboard />} />

          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <LoginScreen onSignIn={handleSignIn} />
              )
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtected>
                <AdminRoute Component={DashboardScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminProtected>
                <AdminRoute Component={UsersScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/users/:id"
            element={
              <AdminProtected>
                <AdminRoute Component={UserDetailScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/transactions"
            element={
              <AdminProtected>
                <AdminRoute Component={TransactionsScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/providers"
            element={
              <AdminProtected>
                <AdminRoute Component={ProvidersScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/communities"
            element={
              <AdminProtected>
                <AdminRoute Component={CommunitiesScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/information"
            element={
              <AdminProtected>
                <AdminRoute Component={InformationScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <AdminProtected>
                <AdminRoute Component={TicketsScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/broadcast"
            element={
              <AdminProtected>
                <AdminRoute Component={BroadcastScreen} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminProtected>
                <AdminRoute Component={SettingsScreen} />
              </AdminProtected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
