import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { flexibleMutation, flexibleQuery } from "../utils/permission";

// Notification schema for database
export const NotificationSchema = v.object({
  company_id: v.id("companies"),
  user_id: v.optional(v.id("users")),
  title: v.string(),
  content: v.string(),
  type: v.optional(v.string()),
  read: v.boolean(),
  created_at: v.number(),
});

// ============================================
// QUERIES
// ============================================

// List all notifications for the company/user
export const list = flexibleQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    let query = ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .order("desc");

    const notifications = await query.collect();

    // Apply limit if provided
    const limitedNotifications = args.limit ? notifications.slice(0, args.limit) : notifications;

    // Transform to expected format
    return limitedNotifications.map((notification) => ({
      id: notification._id,
      title: notification.title,
      content: notification.content,
      date: new Date(notification.created_at).toISOString(),
      read: notification.read,
      type: notification.type || "default",
    }));
  },
});

// Get unread notifications count
export const getUnreadCount = flexibleQuery({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) throw new ConvexError({ message: "Company not found", code: 404 });

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return { count: notifications.length };
  },
});

// ============================================
// MUTATIONS
// ============================================

// Create a notification
export const create = flexibleMutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) throw new ConvexError({ message: "Company not found", code: 404 });

    const notificationId = await ctx.db.insert("notifications", {
      company_id: targetCompanyId,
      user_id: user._id,
      title: args.title,
      content: args.content,
      type: args.type || "default",
      read: false,
      created_at: Date.now(),
    });

    return { id: notificationId, message: "Notification created successfully" };
  },
});

// Mark notification as read
export const markAsRead = flexibleMutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new ConvexError({ message: "Notification not found", code: 404 });

    // Ensure user can only update notifications from their company (or admin impersonating)
    if (!isAdmin && notification.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    await ctx.db.patch(args.notificationId, { read: true });

    return { message: "Notification marked as read" };
  },
});

// Mark all notifications as read
export const markAllAsRead = flexibleMutation({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) throw new ConvexError({ message: "Company not found", code: 404 });

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { message: `${notifications.length} notifications marked as read` };
  },
});

// Internal mutation to create a notification from other server modules (no auth required)
export const createInternal = internalMutation({
  args: {
    company_id: v.id("companies"),
    title: v.string(),
    content: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      company_id: args.company_id,
      title: args.title,
      content: args.content,
      type: args.type || "default",
      read: false,
      created_at: Date.now(),
    });
  },
});

// Delete a notification
export const remove = flexibleMutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new ConvexError({ message: "Notification not found", code: 404 });

    // Ensure user can only delete notifications from their company (or admin impersonating)
    if (!isAdmin && notification.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    await ctx.db.delete(args.notificationId);

    return { message: "Notification deleted successfully" };
  },
});
