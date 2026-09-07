const prisma = require('../lib/prisma');
const { assertMember, assertOwner } = require('../lib/access');

function initialOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

exports.addMember = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);
    const { displayName } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: 'Member name is required' });
    }

    const member = await prisma.groupMember.create({
      data: { groupId: group.id, displayName: displayName.trim(), initial: initialOf(displayName), role: 'EDITOR' },
    });

    res.status(201).json({ member });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to add member' });
  }
};

exports.listMembers = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);
    const members = await prisma.groupMember.findMany({
      where: { groupId: group.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ members });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to load members' });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);
    const { role } = req.body;
    if (!['VIEWER', 'EDITOR'].includes(role)) {
      return res.status(400).json({ error: 'Role must be VIEWER or EDITOR' });
    }

    const member = await prisma.groupMember.findFirst({
      where: { id: req.params.memberId, groupId: group.id },
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.userId === req.userId) {
      return res.status(400).json({ error: 'The owner role cannot be changed' });
    }

    const updated = await prisma.groupMember.update({
      where: { id: member.id },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ member: updated });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to update member role' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const group = await assertOwner(req.params.id, req.userId);

    const member = await prisma.groupMember.findFirst({
      where: { id: req.params.memberId, groupId: group.id },
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.userId === req.userId) return res.status(400).json({ error: 'The owner cannot be removed' });

    const usedAsPayer = await prisma.expense.findFirst({
      where: { groupId: group.id, paidById: req.params.memberId },
    });
    const usedAsParticipant = await prisma.expenseParticipant.findFirst({
      where: { memberId: req.params.memberId, expense: { groupId: group.id } },
    });

    if (usedAsPayer || usedAsParticipant) {
      return res.status(400).json({ error: 'This member has expense history and cannot be removed' });
    }

    await prisma.groupMember.delete({ where: { id: req.params.memberId } });
    res.json({ success: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to remove member' });
  }
};
