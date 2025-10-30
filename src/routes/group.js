import express from "express";
import jwt from "jsonwebtoken";
import GroupController from "../controllers/group.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";

const router = express.Router();
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";

// 🔹 Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔹 Get user's groups
router.get("/my-groups", authenticate, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate("members", "name email");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups", error: err.message });
  }
});

// 🔹 Create new group
router.post("/new", authenticate, GroupController.createGroup);

// 🔹 Member operations
router.post("/invite", authenticate, GroupController.Invite);
router.post("/add-member", authenticate, GroupController.addMember);
router.delete("/delete-member", authenticate, GroupController.deleteMember);

// 🔹 Get single group by ID (with expenses)
router.get("/:groupId", authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "name email")
      .lean();

    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.find({ group: group._id })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    group.expenses = expenses.map((exp) => ({
      _id: exp._id,
      description: exp.description,
      amount: exp.amount,
      paidBy: exp.paidBy,
      splits: exp.splits,
    }));

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: "Error fetching group", error: err.message });
  }
});

// 🔹 Get all expenses for group
router.get("/:groupId/expenses", authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.find({ group: group._id })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
});

// 🔹 Add expense to group
router.post("/:groupId/expenses", authenticate, async (req, res) => {
  const { description, amount, paidById, splits } = req.body;
  if (!description || !amount || !paidById) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expense = new Expense({
      description,
      amount,
      paidBy: paidById,
      group: group._id,
      splits: splits || [],
    });

    await expense.save();
    await expense.populate("paidBy", "name");

    res.status(201).json({
      _id: expense._id,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      splits: expense.splits,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding expense", error: err.message });
  }
});

export default router;
