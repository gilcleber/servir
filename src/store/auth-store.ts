import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/types'

interface AuthState {
    user: Profile | null;
    role: Profile['role'] | null;
    isLoading: boolean;
    login: (user: Profile) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            role: null,
            isLoading: false,
            login: (user) => set({ user, role: user.role }),
            logout: () => set({ user: null, role: null }),
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'servir-auth',
        }
    )
)
