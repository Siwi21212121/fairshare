const prisma = require('../lib/prisma');
const { assertMember, getGroupMembership } = require('../lib/access');
const { calculateBalances, round2 } = require('../lib/settlement');

function initialOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

exports.createGroup = async (req, res) => {
  try {
    const { name, type, currency } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Group name is required' });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        type: type || 'trip',
        currency: currency || 'INR',
        createdBy: req.userId,
        members: {
          create: [{ userId: req.userId, displayName: user.name, initial: initialOf(user.name), role: 'OWNER' }],
        },
      },
      include: { members: true },
    });

    res.status(201).json({ group });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

exports.listGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: { OR: [{ createdBy: req.userId }, { members: { some: { userId: req.userId } } }] },
      include: { members: true, expenses: { include: { participants: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const result = groups.map((g) => {
      const totalExpenses = round2(g.expenses.reduce((s, e) => s + e.amount, 0));
      const balances = calculateBalances(g.members, g.expenses);
      const myMember = g.members.find((m) => m.userId === req.userId);
      const mine = myMember ? balances[myMember.id] || 0 : 0;

      return {
        id: g.id,
        name: g.name,
        type: g.type,
        currency: g.currency,
        createdAt: g.createdAt,
        peopleCount: g.members.length,
        totalExpenses,
        youOwe: mine < -0.01 ? round2(-mine) : 0,
        youAreOwed: mine > 0.01 ? round2(mine) : 0,
        settled: Math.abs(mine) < 0.01,
      };
    });

    res.json({ groups: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load groups' });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);
    const membership = await getGroupMembership(req.params.id, req.userId);

    const full = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        expenses: {
          include: { participants: { include: { member: true } }, paidBy: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const totalExpenses = round2(full.expenses.reduce((s, e) => s + e.amount, 0));
    const balances = calculateBalances(full.members, full.expenses);
    const myMember = full.members.find((m) => m.userId === req.userId);
    const myBalance = myMember ? balances[myMember.id] || 0 : 0;

    const myPaid = round2(
      full.expenses.filter((e) => e.paidById === myMember?.id).reduce((s, e) => s + e.amount, 0)
    );
    const myShare = round2(
      full.expenses.reduce((s, e) => {
        const p = e.participants.find((pp) => pp.memberId === myMember?.id);
        return s + (p ? p.amount : 0);
      }, 0)
    );

    res.json({
      group: {
        id: full.id,
        name: full.name,
        type: full.type,
        currency: full.currency,
        createdAt: full.createdAt,
        members: full.members,
        currentUserRole: membership.isOwner ? 'OWNER' : membership.member?.role || 'VIEWER',
        summary: {
          totalExpenses,
          youPaid: myPaid,
          yourShare: myShare,
          youOwe: myBalance < -0.01 ? round2(-myBalance) : 0,
          youAreOwed: myBalance > 0.01 ? round2(myBalance) : 0,
        },
        expenses: full.expenses,
      },
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to load group' });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the group creator can edit this group' });
    }

    const { name, currency, type } = req.body;
    const updated = await prisma.group.update({
      where: { id: group.id },
      data: {
        name: name !== undefined ? name.trim() : group.name,
        currency: currency !== undefined ? currency : group.currency,
        type: type !== undefined ? type : group.type,
      },
    });

    res.json({ group: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the group creator can delete this group' });
    }

    await prisma.group.delete({ where: { id: group.id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};
