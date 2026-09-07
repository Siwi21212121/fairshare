const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/balances.controller');

router.get('/', ctrl.getBalances);

module.exports = router;
