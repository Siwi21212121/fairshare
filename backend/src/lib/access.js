const prisma = require('./prisma');

async function getGroupMembership(groupId, userId) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  const member = group.members.find((m) => m.userId === userId);
  const isOwner = group.createdBy === userId;

  if (!isOwner && !member) {
    const err = new Error('You do not have access to this group');
    err.status = 403;
    throw err;
  }

  return { group, member, isOwner };
}

async function assertMember(groupId, userId) {
  const { group } = await getGroupMembership(groupId, userId);
  return group;
}

async function assertOwner(groupId, userId) {
  const result = await getGroupMembership(groupId, userId);
  if (!result.isOwner) {
    const err = new Error('Only the trip owner can manage members');
    err.status = 403;
    throw err;
  }
  return result.group;
}

async function assertEditor(groupId, userId) {
  const result = await getGroupMembership(groupId, userId);
  if (!result.isOwner && result.member?.role !== 'EDITOR') {
    const err = new Error('Viewers cannot modify this trip');
    err.status = 403;
    throw err;
  }
  return result.group;
}

module.exports = { assertMember, assertOwner, assertEditor, getGroupMembership };
