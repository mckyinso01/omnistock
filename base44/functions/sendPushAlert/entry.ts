import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

/**
 * sendPushAlert — Sends a mobile push notification to a branch manager or admin.
 *
 * Used for low-stock alerts, approval requests, and other time-sensitive
 * operational notifications. Requires a native mobile build with push
 * credentials configured; without that the send will fail at delivery time.
 *
 * Called server-side (from workflows or other backend functions) via
 * asServiceRole — a logged-in end user must not be able to push to other users.
 *
 * Payload:
 *   { user_id: string, title: string, content: string, action_label?: string, action_url?: string }
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { user_id, title, content, action_label, action_url } = body;

    if (!user_id || !title || !content) {
      return Response.json(
        { error: 'user_id, title, and content are required' },
        { status: 400 }
      );
    }

    // Only admins can send push to other users; non-admins can only push to themselves
    if (user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — can only send to self' }, { status: 403 });
    }

    const result = await base44.asServiceRole.integrations.Core.SendPushNotification({
      user_id,
      title,
      content,
      action_label: action_label || null,
      action_url: action_url || null,
    });

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}