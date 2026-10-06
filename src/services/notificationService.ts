import { apiConfig } from "@/config/api";
import { apiClient, mockDelay } from "./apiClient";

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface NotificationService {
  list(): Promise<Notification[]>;
  markAllRead(): Promise<void>;
}

let store: Notification[] | null = null;
const db = () =>
  (store ??= [
    { id: "n1", title: "Exam schedule published", body: "TE Mid-Semester timetable is now live.", time: "15 min ago", read: false },
    { id: "n2", title: "Fee reminder", body: "Second instalment deadline in 10 days.", time: "2 hrs ago", read: false },
    { id: "n3", title: "Leave approved", body: "Your leave for 12 Oct has been approved.", time: "Yesterday", read: false },
    { id: "n4", title: "System maintenance", body: "ERP will be unavailable Sunday 2–4 AM.", time: "2 days ago", read: true },
  ]);

const mockNotificationService: NotificationService = {
  async list() {
    await mockDelay();
    return db().map((n) => ({ ...n }));
  },
  async markAllRead() {
    await mockDelay();
    db().forEach((n) => (n.read = true));
  },
};

const restNotificationService: NotificationService = {
  list: () => apiClient.get(apiConfig.notifications.baseUrl), // GET /api/notifications
  markAllRead: () => apiClient.post(`${apiConfig.notifications.baseUrl}/read-all`), // POST /api/notifications/read-all
};

export const notificationService: NotificationService = apiConfig.notifications.useMock ? mockNotificationService : restNotificationService;
