import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { create } from "zustand";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthStore = create<AuthContextType>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  loginMutation: { mutate: () => {}, isLoading: false, error: null },
  logoutMutation: { mutate: () => {}, isLoading: false, error: null },
  registerMutation: { mutate: () => {}, isLoading: false, error: null },
  login: async (username, password) => {
    //This function will be called by the component to trigger the mutation.
    set(state => ({...state, isLoading: true, error: null}))
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      set({ user: response, isLoading: false, error: null});
    } catch (error: any) {
      set({ isLoading: false, error })
    }

  },
  register: async (username, email, password) => {
    set(state => ({...state, isLoading: true, error: null}))
    try {
      await apiRequest("POST", "/api/auth/register", { username, email, password });
      set({ isLoading: false, error: null});
    } catch (error: any) {
      set({ isLoading: false, error })
    }

  },
  logout: async () => {
    set(state => ({...state, isLoading: true, error: null}))
    try {
      await apiRequest("POST", "/api/auth/logout");
      set({ user: null, isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error })
    }

  },
}));


export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user, isLoading, error, login, register, logout } = useAuthStore();


  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}