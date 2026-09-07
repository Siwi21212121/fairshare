import client from './client';

export async function listGroups() {
  const res = await client.get('/groups');
  return res.data.groups;
}

export async function createGroup(data) {
  const res = await client.post('/groups', data);
  return res.data.group;
}

export async function getGroup(id) {
  const res = await client.get(`/groups/${id}`);
  return res.data.group;
}

export async function updateGroup(id, data) {
  const res = await client.put(`/groups/${id}`, data);
  return res.data.group;
}

export async function deleteGroup(id) {
  await client.delete(`/groups/${id}`);
}

export async function addMember(groupId, displayName) {
  const res = await client.post(`/groups/${groupId}/members`, { displayName });
  return res.data.member;
}

export async function listMembers(groupId) {
  const res = await client.get(`/groups/${groupId}/members`);
  return res.data.members;
}

export async function removeMember(groupId, memberId) {
  await client.delete(`/groups/${groupId}/members/${memberId}`);
}


export async function updateMemberRole(groupId, memberId, role) {
  const res = await client.patch(`/groups/${groupId}/members/${memberId}/role`, { role });
  return res.data.member;
}

export async function listInvitations(groupId) {
  const res = await client.get(`/groups/${groupId}/invitations`);
  return res.data.invitations;
}

export async function inviteMember(groupId, email, role) {
  const res = await client.post(`/groups/${groupId}/invitations`, { email, role });
  return res.data;
}

export async function revokeInvitation(groupId, invitationId) {
  await client.delete(`/groups/${groupId}/invitations/${invitationId}`);
}

export async function getInvitation(token) {
  const res = await client.get(`/invitations/${token}`);
  return res.data.invitation;
}

export async function acceptInvitation(token) {
  const res = await client.post(`/invitations/${token}/accept`);
  return res.data;
}
