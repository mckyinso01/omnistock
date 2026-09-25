import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { phone, channel, transaction } = body;

    if (!phone || !channel || !transaction) {
      return Response.json({ error: 'Missing required fields: phone, channel, transaction' }, { status: 400 });
    }

    if (!['whatsapp', 'sms'].includes(channel)) {
      return Response.json({ error: 'Channel must be "whatsapp" or "sms"' }, { status: 400 });
    }

    const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
    const authToken = secrets.get('TWILIO_AUTH_TOKEN');
    const whatsappFrom = secrets.get('TWILIO_WHATSAPP_FROM');
    const smsFrom = secrets.get('TWILIO_SMS_FROM');

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    // Build receipt message text
    const items = (transaction.items || []).map((item, i) =>
      `${i + 1}. ${item.product_name} x${item.quantity} - ₱${(item.subtotal || 0).toFixed(2)}`
    ).join('\n');

    const receiptText = `🧾 OmniStock Receipt\n` +
      `Txn #: ${transaction.transaction_number || 'N/A'}\n` +
      `Date: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}\n` +
      `${'─'.repeat(24)}\n` +
      `${items}\n` +
      `${'─'.repeat(24)}\n` +
      `Subtotal: ₱${(transaction.subtotal || 0).toFixed(2)}\n` +
      (transaction.discount_amount ? `Discount: -₱${transaction.discount_amount.toFixed(2)}\n` : '') +
      `Total: ₱${(transaction.total_amount || 0).toFixed(2)}\n` +
      `Payment: ${transaction.payment_method || 'cash'}\n` +
      (transaction.change_amount != null ? `Change: ₱${transaction.change_amount.toFixed(2)}\n` : '') +
      `${'─'.repeat(24)}\n` +
      `Thank you for shopping with us! 🙏`;

    // Normalize phone number (ensure + prefix)
    let normalizedPhone = phone.replace(/[^0-9+]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      // Default to Philippines country code if no + prefix
      normalizedPhone = '+' + normalizedPhone;
    }

    const fromNumber = channel === 'whatsapp' ? whatsappFrom : smsFrom;
    if (!fromNumber) {
      return Response.json({ error: `Twilio ${channel} sender number not configured` }, { status: 500 });
    }

    const toNumber = channel === 'whatsapp' ? `whatsapp:${normalizedPhone}` : normalizedPhone;
    const fromFormatted = channel === 'whatsapp' ? (whatsappFrom.startsWith('whatsapp:') ? whatsappFrom : `whatsapp:${whatsappFrom}`) : smsFrom;

    // Twilio REST API call
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append('From', fromFormatted);
    formData.append('To', toNumber);
    formData.append('Body', receiptText);

    const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      return Response.json({
        error: twilioData.message || 'Twilio API error',
        code: twilioData.code,
      }, { status: 502 });
    }

    return Response.json({
      success: true,
      messageSid: twilioData.sid,
      channel,
      to: toNumber,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}