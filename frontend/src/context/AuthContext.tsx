import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getStoredUser,
  logout as logoutUser,
} from "@/api/auth";

type AuthUser = NonNullable<ReturnType<typeof getStoredUser>>;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  /**
   * IMPORTANT:
   *
   * Do not read localStorage directly here.
   *
   * The initial value is null so that SSR can render safely.
   */
  const [user, setUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  /**
   * Read localStorage only after the component mounts
   * in the browser.
   */
  useEffect(() => {
    const storedUser = getStoredUser();

    setUser(storedUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    setUser,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider",
    );
  }

  return context;
}

