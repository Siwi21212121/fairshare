const prisma = require('../lib/prisma');
const { assertMember } = require('../lib/access');
const { calculateBalances, simplifySettlements } = require('../lib/settlement');

exports.getSettlements = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);

    const members = await prisma.groupMember.findMany({ where: { groupId: group.id } });
    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: { participants: true },
    });

    const balanceMap = calculateBalances(members, expenses);
    const raw = simplifySettlements(balanceMap);
    const byId = Object.fromEntries(members.map((m) => [m.id, m]));

    const settlements = raw.map((s) => ({
      from: { id: s.from, displayName: byId[s.from]?.displayName, initial: byId[s.from]?.initial },
      to: { id: s.to, displayName: byId[s.to]?.displayName, initial: byId[s.to]?.initial },
      amount: s.amount,
    }));

    res.json({ count: settlements.length, settlements });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to calculate settlements' });
  }
};
