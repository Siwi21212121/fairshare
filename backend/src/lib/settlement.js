// Core calculation engine for FairShare.
// Nothing here is hardcoded — every number is derived from the members and
// expenses passed in, which is what lets balances stay correct no matter
// what expenses get added, edited, or deleted.

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * balance = total amount a member paid - total amount they owe (their share).
 * Positive balance  -> the group owes this person money ("gets").
 * Negative balance  -> this person owes the group money ("owes").
 *
 * @param {Array<{id:string}>} members
 * @param {Array<{paidById:string, amount:number, participants:Array<{memberId:string, amount:number}>}>} expenses
 * @returns {Object<string, number>} memberId -> net balance
 */
function calculateBalances(members, expenses) {
  const balance = {};
  members.forEach((m) => {
    balance[m.id] = 0;
  });

  expenses.forEach((expense) => {
    balance[expense.paidById] = (balance[expense.paidById] || 0) + expense.amount;
    expense.participants.forEach((p) => {
      balance[p.memberId] = (balance[p.memberId] || 0) - p.amount;
    });
  });

  Object.keys(balance).forEach((id) => {
    balance[id] = round2(balance[id]);
  });

  return balance;
}

/**
 * Greedy debt-simplification: repeatedly matches the largest creditor with the
 * largest debtor until everyone is at (approximately) zero. This minimizes the
 * number of payments needed compared to settling every pairwise IOU directly,
 * and it is fully generic — it works for any balance distribution, not just
 * the demo data.
 *
 * @param {Object<string, number>} balanceMap memberId -> net balance
 * @returns {Array<{from:string, to:string, amount:number}>}
 */
function simplifySettlements(balanceMap) {
  const EPSILON = 0.01;

  const creditors = [];
  const debtors = [];

  Object.entries(balanceMap).forEach(([id, amount]) => {
    const rounded = round2(amount);
    if (rounded > EPSILON) creditors.push({ id, amount: rounded });
    else if (rounded < -EPSILON) debtors.push({ id, amount: round2(-rounded) });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const payment = round2(Math.min(debtor.amount, creditor.amount));

    if (payment > EPSILON) {
      settlements.push({ from: debtor.id, to: creditor.id, amount: payment });
    }

    debtor.amount = round2(debtor.amount - payment);
    creditor.amount = round2(creditor.amount - payment);

    if (debtor.amount <= EPSILON) i += 1;
    if (creditor.amount <= EPSILON) j += 1;
  }

  return settlements;
}

/**
 * Splits `amount` equally across `memberIds`, distributing leftover paise
 * so the shares always sum EXACTLY to amount (floating point safe).
 *
 * @param {number} amount
 * @param {string[]} memberIds
 * @returns {Array<{memberId:string, amount:number}>}
 */
function splitEqually(amount, memberIds) {
  const n = memberIds.length;
  const totalCents = Math.round(round2(amount) * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents - baseCents * n;

  return memberIds.map((memberId, idx) => ({
    memberId,
    amount: (baseCents + (idx < remainderCents ? 1 : 0)) / 100,
  }));
}

module.exports = { round2, calculateBalances, simplifySettlements, splitEqually };
