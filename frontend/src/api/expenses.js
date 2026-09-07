import client from './client';

export async function listExpenses(groupId) {
  const res = await client.get(`/groups/${groupId}/expenses`);
  return res.data.expenses;
}

export async function getExpense(groupId, expenseId) {
  const res = await client.get(`/groups/${groupId}/expenses/${expenseId}`);
  return res.data.expense;
}

export async function createExpense(groupId, payload) {
  const res = await client.post(`/groups/${groupId}/expenses`, payload);
  return res.data.expense;
}

export async function updateExpense(groupId, expenseId, payload) {
  const res = await client.put(`/groups/${groupId}/expenses/${expenseId}`, payload);
  return res.data.expense;
}

export async function deleteExpense(groupId, expenseId) {
  await client.delete(`/groups/${groupId}/expenses/${expenseId}`);
}

export async function getBalances(groupId) {
  const res = await client.get(`/groups/${groupId}/balances`);
  return res.data.balances;
}

export async function getSettlements(groupId) {
  const res = await client.get(`/groups/${groupId}/settlements`);
  return res.data; // { count, settlements }
}
