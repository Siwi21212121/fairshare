const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/expenses.controller');

router.post('/', ctrl.createExpense);
router.get('/', ctrl.listExpenses);
router.get('/:expenseId', ctrl.getExpense);
router.put('/:expenseId', ctrl.updateExpense);
router.delete('/:expenseId', ctrl.deleteExpense);

module.exports = router;
