import { createContext, useCallback, useContext, useEffect, useState } from "react";
// import { api } from "@/http/api";
import { fetchMe, BACKEND_URL } from "@/http/api";

type User = {
  _id: string;
  name: string;
  email: string;
  permissions: string[];
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await fetchMe();
      const { user, permissionKeys } = data;

      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        permissions: permissionKeys,
        avatar: user.image ? (user.image.startsWith("http") ? user.image : `${BACKEND_URL}${user.image}`) : undefined,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, refreshUser: loadUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
