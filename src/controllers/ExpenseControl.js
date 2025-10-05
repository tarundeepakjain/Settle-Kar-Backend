
const Expense = require('../models/Expenses');
const Group = require('../models/Grp');
let groups = {}; 
exports.addExpense = (req, res) => {
  const { groupId, paidBy, amount, description, splitBetween } = req.body;
  if (!groups[groupId]) {
    return res.status(404).json({ message: "Group not found" });
  }
  const expense = new Expense(paidBy, amount, description, splitBetween);
  groups[groupId].addExpense(expense);
  res.json({ message: "Expense added successfully", expense });
};
exports.createGroup = (req, res) => {
  const { groupId, members } = req.body;
  if (groups[groupId]) {
    return res.status(400).json({ message: "Group already exists" });
  }
  groups[groupId] = new Group(groupId, members);
  res.json({ message: "Group created successfully", group: groups[groupId] });
};
exports.getBalance = (req, res) => {
  const { groupId } = req.params;
  const group = groups[groupId];
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }
  res.json({ balances: group.getBalances() });
};
