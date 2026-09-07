const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/settlements.controller');

router.get('/', ctrl.getSettlements);

module.exports = router;
