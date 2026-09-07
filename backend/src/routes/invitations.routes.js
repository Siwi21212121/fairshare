const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/invitations.controller');

// Public so an email link can be opened before the recipient logs in.
router.get('/:token', ctrl.getInvitation);

// Accepting an invitation requires an authenticated FairShare account.
router.post('/:token/accept', auth, ctrl.acceptInvitation);

module.exports = router;
