// stores/notificationsStore.ts
import { create } from "zustand";

type Notification = {
  id: number;
  mensaje: string;
  // ... otros campos
};

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  clearNotifications: () => set({ notifications: [] }),
}));
