const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

router.get('/me', auth, ctrl.me);

module.exports = router;
