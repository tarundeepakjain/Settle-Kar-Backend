const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
router.post("/groups", expenseController.createGroup);
router.post("/expenses", expenseController.addExpense);
router.get("/groups/:groupId/balance", expenseController.getBalance);
module.exports = router;
