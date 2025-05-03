<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse; // Import Inertia Response

class NotificationController extends Controller
{
    /**
     * Fetch notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $limit = $request->input('limit', 10); // Default limit

        // Fetch unread notifications
        $unreadNotifications = $user->unreadNotifications()->limit($limit)->get();

        // Fetch read notifications (optional, could be separate endpoint if needed)
        // $readNotifications = $user->readNotifications()->limit($limit)->get();

        // Get total unread count
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'unread' => $unreadNotifications,
            // 'read' => $readNotifications, // Uncomment if needed
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark specific notifications as read.
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|string', // Notification IDs are usually strings (UUIDs)
        ]);

        $notifications = $user->unreadNotifications()->whereIn('id', $validated['ids'])->get();

        if ($notifications->isNotEmpty()) {
            $notifications->markAsRead();
        }

        return response()->json(['message' => 'Notifikasi ditandai sebagai terbaca.']);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Semua notifikasi ditandai sebagai terbaca.']);
    }

    /**
     * Display the notification history page.
     */
    public function history(): InertiaResponse
    {
        $user = Auth::user();

        // Fetch all notifications, paginated, latest first
        $notifications = $user->notifications()->latest()->paginate(20); // Adjust pagination size as needed

        return Inertia::render('front/notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark specific notifications as unread.
     */
    public function markAsUnread(Request $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|string',
        ]);

        // Find notifications (read or unread) belonging to the user
        $notifications = $user->notifications()->whereIn('id', $validated['ids'])->get();

        if ($notifications->isNotEmpty()) {
            // Update read_at to null for all found notifications
            $user->notifications()->whereIn('id', $validated['ids'])->update(['read_at' => null]);
        }

        return response()->json(['message' => 'Notifikasi ditandai sebagai belum dibaca.']);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();

            return response()->json(['message' => 'Notifikasi dihapus.']);
        } else {
            return response()->json(['message' => 'Notifikasi tidak ditemukan atau tidak sah.'], 404);
        }
    }
}
