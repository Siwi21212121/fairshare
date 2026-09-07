const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/groups.controller');

const membersRouter = require('./members.routes');
const expensesRouter = require('./expenses.routes');
const balancesRouter = require('./balances.routes');
const settlementsRouter = require('./settlements.routes');
const invitationsCtrl = require('../controllers/invitations.controller');

// every group route requires a logged-in user
router.use(auth);

router.post('/', ctrl.createGroup);
router.get('/', ctrl.listGroups);
router.get('/:id', ctrl.getGroup);
router.put('/:id', ctrl.updateGroup);
router.delete('/:id', ctrl.deleteGroup);

router.use('/:id/members', membersRouter);
router.use('/:id/expenses', expensesRouter);
router.use('/:id/balances', balancesRouter);
router.use('/:id/settlements', settlementsRouter);

// Owner-only invitation management
router.get('/:id/invitations', invitationsCtrl.listInvitations);
router.post('/:id/invitations', invitationsCtrl.createInvitation);
router.delete('/:id/invitations/:invitationId', invitationsCtrl.revokeInvitation);

module.exports = router;
