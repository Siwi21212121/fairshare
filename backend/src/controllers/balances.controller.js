const prisma = require('../lib/prisma');
const { assertMember } = require('../lib/access');
const { calculateBalances, round2 } = require('../lib/settlement');

exports.getBalances = async (req, res) => {
  try {
    const group = await assertMember(req.params.id, req.userId);

    const members = await prisma.groupMember.findMany({ where: { groupId: group.id } });
    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: { participants: true },
    });

    const balanceMap = calculateBalances(members, expenses);

    const result = members.map((m) => {
      const paid = round2(expenses.filter((e) => e.paidById === m.id).reduce((s, e) => s + e.amount, 0));
      const share = round2(
        expenses.reduce((s, e) => {
          const p = e.participants.find((pp) => pp.memberId === m.id);
          return s + (p ? p.amount : 0);
        }, 0)
      );
      const balance = round2(balanceMap[m.id] || 0);

      return {
        memberId: m.id,
        displayName: m.displayName,
        initial: m.initial,
        paid,
        share,
        balance,
        status: balance > 0.01 ? 'gets' : balance < -0.01 ? 'owes' : 'settled',
      };
    });

    res.json({ balances: result });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Failed to calculate balances' });
  }
};
