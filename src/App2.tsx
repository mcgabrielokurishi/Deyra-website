import { useState } from "react";
import type { NavKey } from "./components/Sidebar";
import LoginScreen from "./pages/admin/LoginScreen";
import DashboardScreen from "./pages/admin/DashboardScreen";
import UsersScreen from "./pages/admin/UsersScreen";
import UserDetailScreen from "./pages/admin/UserDetailScreen";
import TransactionsScreen from "./pages/admin/TransactionsScreen";
import ProvidersScreen from "./pages/admin/ProvidersScreen";
import CommunitiesScreen from "./pages/admin/CommunitiesScreen";
import SettingsScreen from "./pages/admin/SettingsScreen";
import type { PlatformUser } from "./types";

type Route = NavKey | "userDetail";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState<Route>("dashboard");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  function handleSignIn(_email: string, _password: string) {
    // Wire this up to your auth API. For now, any submit logs in.
    setIsAuthenticated(true);
    setRoute("dashboard");
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setSelectedUser(null);
    setRoute("dashboard");
  }

  function handleViewUser(user: PlatformUser) {
    setSelectedUser(user);
    setRoute("userDetail");
  }

  if (!isAuthenticated) {
    return <LoginScreen onSignIn={handleSignIn} />;
  }

  switch (route) {
    case "dashboard":
      return <DashboardScreen onNavigate={setRoute} onLogout={handleLogout} />;
    case "users":
      return (
        <UsersScreen
          onNavigate={setRoute}
          onLogout={handleLogout}
          onViewUser={handleViewUser}
        />
      );
    case "userDetail":
      return selectedUser ? (
        <UserDetailScreen
          user={selectedUser}
          onNavigate={setRoute}
          onLogout={handleLogout}
          onBack={() => setRoute("users")}
        />
      ) : (
        <UsersScreen
          onNavigate={setRoute}
          onLogout={handleLogout}
          onViewUser={handleViewUser}
        />
      );
    case "transactions":
      return (
        <TransactionsScreen onNavigate={setRoute} onLogout={handleLogout} />
      );
    case "providers":
      return <ProvidersScreen onNavigate={setRoute} onLogout={handleLogout} />;
    case "communities":
      return (
        <CommunitiesScreen onNavigate={setRoute} onLogout={handleLogout} />
      );
    case "settings":
      return <SettingsScreen onNavigate={setRoute} onLogout={handleLogout} />;
    default:
      return <DashboardScreen onNavigate={setRoute} onLogout={handleLogout} />;
  }
}
