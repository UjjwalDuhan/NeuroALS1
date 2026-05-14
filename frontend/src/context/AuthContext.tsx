import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthState } from "@/types";
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  clearAuthStorage,
} from "@/utils/storage";
import { getCurrentUser, logoutUser } from "@/services/authService";

// ── State & Action Types ──────────────────────────────────────────────────────
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true on mount (checking stored token)
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };

    case "UPDATE_USER":
      return { ...state, user: action.payload };

    default:
      return state;
  }
}

// ── Context Shape ─────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser<User>();

      if (!storedToken || !storedUser) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        // Verify token is still valid with server
        const res = await getCurrentUser();
        if (res.success && res.data?.user) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: res.data.user, token: storedToken },
          });
        } else {
          clearAuthStorage();
          dispatch({ type: "LOGOUT" });
        }
      } catch {
        // Token expired or server unreachable
        clearAuthStorage();
        dispatch({ type: "LOGOUT" });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback((user: User, token: string) => {
    setStoredToken(token);
    setStoredUser(user);
    dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(); // Notify server (audit log)
    } catch {
      // Even if server call fails, clear local state
    } finally {
      clearAuthStorage();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setStoredUser(user);
    dispatch({ type: "UPDATE_USER", payload: user });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── useAuth hook ──────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
