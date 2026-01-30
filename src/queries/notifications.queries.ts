import { useAuthedMutation, useAuthedQuery, useConvexResponse } from "@/app/convex.setup";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============================================
// TYPES
// ============================================

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to get all notifications for the company
 */
export const useNotifications = (limit?: number) => {
  const notifications = useAuthedQuery(api.modules.notifications.list, { limit });
  return notifications;
};

/**
 * Hook to get unread notifications count
 */
export const useUnreadNotificationsCount = () => {
  const count = useAuthedQuery(api.modules.notifications.getUnreadCount, {});
  return count;
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for notification mutations
 */
export const useNotificationMutations = () => {
  const createMutation = useAuthedMutation(api.modules.notifications.create);
  const markAsReadMutation = useAuthedMutation(api.modules.notifications.markAsRead);
  const markAllAsReadMutation = useAuthedMutation(api.modules.notifications.markAllAsRead);
  const removeMutation = useAuthedMutation(api.modules.notifications.remove);

  /**
   * Create a new notification
   */
  const createNotification = async (title: string, content: string, type?: string) => {
    if (!createMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(createMutation({ title, content, type }));
    return { result, error };
  };

  /**
   * Mark a notification as read
   */
  const markAsRead = async (notificationId: string) => {
    if (!markAsReadMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      markAsReadMutation({ notificationId: notificationId as Id<"notifications"> })
    );
    return { result, error };
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!markAllAsReadMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(markAllAsReadMutation({}));
    return { result, error };
  };

  /**
   * Delete a notification
   */
  const removeNotification = async (notificationId: string) => {
    if (!removeMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      removeMutation({ notificationId: notificationId as Id<"notifications"> })
    );
    return { result, error };
  };

  return {
    createNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
};
