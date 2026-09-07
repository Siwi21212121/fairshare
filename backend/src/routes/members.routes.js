const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/members.controller');

router.post('/', ctrl.addMember);
router.get('/', ctrl.listMembers);
router.patch('/:memberId/role', ctrl.updateMemberRole);
router.delete('/:memberId', ctrl.removeMember);

module.exports = router;
