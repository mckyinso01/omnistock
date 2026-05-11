import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Helper: award a new plan to user, pausing any active trial
async function awardPlan(base44, userId, newPlan, durationDays) {
  const users = await base44.asServiceRole.entities.User.filter({ id: userId });
  const user = users[0];
  if (!user) return { error: "User not found" };

  const now = new Date();
  const newEndDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const updateData = {
    current_plan: newPlan,
    trial_end_date: newEndDate.toISOString(),
  };

  // If there's an active trial, pause it
  if (user.current_plan && user.current_plan !== 'free' && user.trial_end_date) {
    const currentEnd = new Date(user.trial_end_date);
    if (currentEnd > now) {
      updateData.paused_plan = user.current_plan;
      updateData.paused_trial_end_date = user.trial_end_date;
    }
  }

  await base44.asServiceRole.entities.User.update(userId, updateData);
  return { success: true, plan: newPlan, ends: newEndDate.toISOString() };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ACTION: initialize_trial — called on first login/register
  if (action === 'initialize_trial') {
    const existing = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const userData = existing[0];

    if (userData?.current_plan && userData.current_plan !== 'free') {
      return Response.json({ already_initialized: true, plan: userData.current_plan });
    }

    // Generate referral code
    const referralCode = user.id.slice(-8).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase();
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await base44.asServiceRole.entities.User.update(user.id, {
      current_plan: 'basic_trial',
      trial_end_date: trialEnd.toISOString(),
      referral_code: referralCode,
      referral_count: 0,
      basic_sub_referral_count: 0,
    });

    // If user registered via referral, process it
    if (userData?.referred_by) {
      const referrers = await base44.asServiceRole.entities.User.filter({ referral_code: userData.referred_by });
      const referrer = referrers[0];
      if (referrer) {
        // Create referral record
        await base44.asServiceRole.entities.Referral.create({
          referrer_id: referrer.id,
          referrer_email: referrer.email,
          referred_email: user.email,
          referred_user_id: user.id,
          status: 'installed',
          bonus_awarded: true,
        });

        // Award referrer 7-day Pro trial
        await awardPlan(base44, referrer.id, 'pro_trial', 7);
        await base44.asServiceRole.entities.User.update(referrer.id, {
          referral_count: (referrer.referral_count || 0) + 1,
        });
      }
    }

    return Response.json({ success: true, plan: 'basic_trial', trial_end: trialEnd.toISOString(), referral_code: referralCode });
  }

  // ACTION: check_and_resume — check if current plan expired, resume paused plan if any
  if (action === 'check_and_resume') {
    const existing = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const userData = existing[0];
    if (!userData) return Response.json({ plan: 'free' });

    const now = new Date();
    const trialEnd = userData.trial_end_date ? new Date(userData.trial_end_date) : null;

    if (trialEnd && trialEnd <= now) {
      // Current plan expired
      if (userData.paused_plan && userData.paused_trial_end_date) {
        const pausedEnd = new Date(userData.paused_trial_end_date);
        if (pausedEnd > now) {
          // Resume paused plan
          await base44.asServiceRole.entities.User.update(user.id, {
            current_plan: userData.paused_plan,
            trial_end_date: userData.paused_trial_end_date,
            paused_plan: null,
            paused_trial_end_date: null,
          });
          return Response.json({ plan: userData.paused_plan, resumed: true });
        }
      }
      // Everything expired, go free
      await base44.asServiceRole.entities.User.update(user.id, {
        current_plan: 'free',
        trial_end_date: null,
        paused_plan: null,
        paused_trial_end_date: null,
      });
      return Response.json({ plan: 'free' });
    }

    return Response.json({
      plan: userData.current_plan || 'free',
      trial_end_date: userData.trial_end_date,
      paused_plan: userData.paused_plan,
      referral_code: userData.referral_code,
      referral_count: userData.referral_count || 0,
      basic_sub_referral_count: userData.basic_sub_referral_count || 0,
      loyalty_bonus_awarded: userData.loyalty_bonus_awarded || false,
    });
  }

  // ACTION: save_referral_code — save referral code before registration
  if (action === 'save_referred_by') {
    const { referral_code } = body;
    await base44.asServiceRole.entities.User.update(user.id, { referred_by: referral_code });
    return Response.json({ success: true });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});