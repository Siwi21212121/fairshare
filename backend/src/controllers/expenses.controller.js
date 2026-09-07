const prisma = require('../lib/prisma');
const { assertMember, assertEditor } = require('../lib/access');
const { round2, splitEqually } = require('../lib/settlement');

async function validateAndBuildParticipants(groupId, { amount, paidById, splitType, participants }) {
  const members = await prisma.groupMember.findMany({ where: { groupId } });
  const memberIds = new Set(members.map((m) => m.id));

  if (!memberIds.has(paidById)) {
    const err = new Error('Paid-by person is not a member of this group');
    err.status = 400;
    throw err;
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    const err = new Error('Select at least one participant');
    err.status = 400;
    throw err;
  }

  if (splitType === 'unequal') {
    for (const p of participants) {
      if (!memberIds.has(p.memberId)) {
        const err = new Error('One of the participants is not a member of this group');
        err.status = 400;
        throw err;
      }
      if (p.amount === undefined || p.amount === null || isNaN(Number(p.amount)) || Number(p.amount) < 0) {
        const err = new Error('Every participant needs a valid amount');
        err.status = 400;
        throw err;
      }
    }

    const entered = round2(participants.reduce((s, p) => s + Number(p.amount), 0));
    const expected = round2(Number(amount));

    if (Math.abs(entered - expected) > 0.01) {
      const err = new Error("Your split doesn't add up");
      err.status = 400;
      err.details = { expected, entered, difference: round2(expected - entered) };
      throw err;
    }

    return participants.map((p) => ({ memberId: p.memberId, amount: round2(Number(p.amount)) }));
  }

  const ids = participants.map((p) => (typeof p === 'string' ? p : p.memberId));
  for (const id of ids) {
    if (!memberIds.has(id)) {
      const err = new Error('One of the participants is not a member of this group');
      err.status = 400;
      throw err;
    }
  }

  return splitEqually(Number(amount), ids);
}

exports.createExpense = async (req, res) => {
  try {
    const group = await assertEditor(req.params.id, req.userId);
    const { title, amount, paidById, splitType } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'Expense title is required' });
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Amount must be greater than 0' });
    if (!paidById) return res.status(400).json({ error: 'Please select who paid' });

    const participantRows = await validateAndBuildParticipants(group.id, req.body);

    const expense = await prisma.expense.create({
      data: {
        groupId: group.id,
        title: title.trim(),
        amount: round2(amt),
        paidById,
        splitType: splitType === 'unequal' ? 'unequal' : 'equal',
        participants: { create: participantRows },
      },
      include: { participants: { include: { member: true } }, paidBy: true },
    });

    res.status(201).json({ expense });
  } catch (e) {
    const body = { error: e.message || 'Failed to add expense' };
    if (e.details) Object.assign(body, e.details);
    res.status(e.status || 500).json(body);
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);
    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: { participants: { include: { member: true } }, paidBy: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ expenses });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to load expenses' });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.expenseId, groupId: group.id },
      include: { participants: { include: { member: true } }, paidBy: true },
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to load expense' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const group = await assertEditor(req.params.id, req.userId);
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.expenseId, groupId: group.id },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const { title, amount, paidById, splitType } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Expense title is required' });
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Amount must be greater than 0' });
    if (!paidById) return res.status(400).json({ error: 'Please select who paid' });

    const participantRows = await validateAndBuildParticipants(group.id, req.body);

    await prisma.expenseParticipant.deleteMany({ where: { expenseId: existing.id } });
    const updated = await prisma.expense.update({
      where: { id: existing.id },
      data: {
        title: title.trim(),
        amount: round2(amt),
        paidById,
        splitType: splitType === 'unequal' ? 'unequal' : 'equal',
        participants: { create: participantRows },
      },
      include: { participants: { include: { member: true } }, paidBy: true },
    });

    res.json({ expense: updated });
  } catch (e) {
    const body = { error: e.message || 'Failed to update expense' };
    if (e.details) Object.assign(body, e.details);
    res.status(e.status || 500).json(body);
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const group = await assertEditor(req.params.id, req.userId);
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.expenseId, groupId: group.id },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    await prisma.expense.delete({ where: { id: existing.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to delete expense' });
  }
};
