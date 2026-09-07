const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { assertOwner } = require('../lib/access');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const INVITE_DAYS = 7;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendInvitationEmail({ to, group, inviter, role, token }) {
  const inviteUrl = `${FRONTEND_URL.replace(/\/$/, '')}/invite/${token}`;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;

  // Local development can still be tested without an email provider.
  // Once EMAIL_API_KEY and EMAIL_FROM are configured, this sends the real email.
  if (!apiKey || !from) return { sent: false, inviteUrl };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `You're invited to ${group.name} on FairShare`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#222">
          <h2>You've been invited to ${group.name} on FairShare</h2>
          <p><strong>${inviter.name}</strong> invited you as an <strong>${role.toLowerCase()}</strong>.</p>
          <p>Join the trip to see expenses, balances and settlements${role === 'EDITOR' ? ', and add or edit expenses.' : '.'}</p>
          <p style="margin:28px 0">
            <a href="${inviteUrl}" style="background:#6c63ff;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">
              Accept Invitation
            </a>
          </p>
          <p style="color:#777;font-size:13px">This invitation expires in ${INVITE_DAYS} days.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Email provider error:', detail);
    const err = new Error('The invitation was created, but the email could not be sent. Check your email settings.');
    err.status = 502;
    throw err;
  }

  return { sent: true, inviteUrl };
}

function publicInvitation(invitation) {
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
    group: invitation.group ? { id: invitation.group.id, name: invitation.group.name, type: invitation.group.type } : undefined,
    invitedBy: invitation.invitedBy ? { name: invitation.invitedBy.name, email: invitation.invitedBy.email } : undefined,
  };
}

exports.listInvitations = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);
    const invitations = await prisma.invitation.findMany({
      where: { groupId: group.id, status: 'PENDING' },
      include: { invitedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const now = new Date();
    const normalized = [];
    for (const inv of invitations) {
      if (inv.expiresAt <= now) {
        await prisma.invitation.update({ where: { id: inv.id }, data: { status: 'EXPIRED' } });
      } else {
        normalized.push(publicInvitation(inv));
      }
    }
    res.json({ invitations: normalized });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to load invitations' });
  }
};

exports.createInvitation = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);
    const email = normalizeEmail(req.body.email);
    const role = req.body.role === 'VIEWER' ? 'VIEWER' : req.body.role === 'EDITOR' ? 'EDITOR' : null;

    if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (!role) return res.status(400).json({ error: 'Choose Viewer or Editor' });

    const inviter = await prisma.user.findUnique({ where: { id: req.userId } });
    const targetUser = await prisma.user.findUnique({ where: { email } });

    const existingMember = targetUser
      ? await prisma.groupMember.findFirst({ where: { groupId: group.id, userId: targetUser.id } })
      : null;

    if (existingMember) {
      return res.status(409).json({ error: 'This person is already a member of the trip' });
    }

    const existingPending = await prisma.invitation.findFirst({
      where: { groupId: group.id, email, status: 'PENDING' },
    });

    if (existingPending && existingPending.expiresAt > new Date()) {
      return res.status(409).json({ error: 'There is already a pending invitation for this email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        groupId: group.id,
        email,
        role,
        token,
        status: 'PENDING',
        expiresAt,
        invitedById: req.userId,
      },
      include: { group: true, invitedBy: { select: { name: true, email: true } } },
    });

    try {
      const emailResult = await sendInvitationEmail({ to: email, group, inviter, role, token });
      res.status(201).json({
        invitation: publicInvitation(invitation),
        emailSent: emailResult.sent,
        inviteUrl: emailResult.inviteUrl,
        message: emailResult.sent
          ? 'Invitation email sent'
          : 'Invitation created. Configure EMAIL_API_KEY and EMAIL_FROM to send real emails.',
      });
    } catch (emailError) {
      await prisma.invitation.delete({ where: { id: invitation.id } });
      throw emailError;
    }
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to create invitation' });
  }
};

exports.getInvitation = async (req, res) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: req.params.token },
      include: {
        group: { select: { id: true, name: true, type: true, currency: true } },
        invitedBy: { select: { name: true, email: true } },
      },
    });

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status === 'PENDING' && invitation.expiresAt <= new Date()) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
      invitation.status = 'EXPIRED';
    }

    res.json({ invitation: publicInvitation(invitation) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load invitation' });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: req.params.token },
      include: { group: true },
    });

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status !== 'PENDING') return res.status(400).json({ error: `This invitation is ${invitation.status.toLowerCase()}.` });
    if (invitation.expiresAt <= new Date()) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
      return res.status(400).json({ error: 'This invitation has expired.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        error: `This invitation was sent to ${invitation.email}. Please log in with that email address.`,
      });
    }

    const existing = await prisma.groupMember.findFirst({
      where: { groupId: invitation.groupId, userId: user.id },
    });

    let member;
    if (existing) {
      member = existing;
    } else {
      member = await prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: user.id,
          displayName: user.name,
          initial: (user.name || '?').trim().charAt(0).toUpperCase(),
          role: invitation.role,
        },
      });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    res.json({ groupId: invitation.groupId, member });
  } catch (e) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message || 'Failed to accept invitation' });
  }
};

exports.revokeInvitation = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);
    const invitation = await prisma.invitation.findFirst({ where: { id: req.params.invitationId, groupId: group.id } });
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status !== 'PENDING') return res.status(400).json({ error: 'Only pending invitations can be revoked' });

    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'REVOKED' } });
    res.json({ success: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to revoke invitation' });
  }
};

module.exports.sendInvitationEmail = sendInvitationEmail;
