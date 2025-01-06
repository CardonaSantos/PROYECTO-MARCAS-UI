// useStore.ts
import { create } from "zustand";

interface StoreState {
  authToken: string | null;
  sucursalId: number | null;
  userNombre: string | null;
  userCorreo: string | null;
  userId: number | null;
  userRol: string | null;
  userActivo: boolean | null;

  setUserNombre: (usernombre: string) => void;
  setUserCorreo: (usercorreo: string) => void;
  setUserId: (userid: number) => void;
  setActivo: (activo: boolean) => void;
  setRol: (rol: string) => void;
  setSucursalId: (id: number) => void;
  clearAuth: () => void;
  setAuthToken: (token: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  authToken: null,
  sucursalId: null,
  userNombre: null,
  userCorreo: null,
  userId: null,
  userRol: null,
  userActivo: null,

  setUserNombre: (usernombre) => set({ userNombre: usernombre }),
  setUserCorreo: (usercorreo) => set({ userCorreo: usercorreo }),
  setUserId: (userid) => set({ userId: userid }),
  setActivo: (activo) => set({ userActivo: activo }),
  setRol: (rol) => set({ userRol: rol }),
  setSucursalId: (id) => set({ sucursalId: id }),
  clearAuth: () => set({ authToken: null, sucursalId: null }),
  setAuthToken: (token) => set({ authToken: token }),
}));
