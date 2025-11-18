// tarun/group.js - FINAL FIXED VERSION
import GroupModel from "../models/group.js";
import User from "../models/user.js";
import { GroupExpense } from "./expense.js";

export default class Group {
  #gid;
  #balance;
  #expenses;

  constructor({
    gid,
    name,
    members = [],
    balance = 0,
    expenses = [],
    userBal = [],
    description = "",
    createdBy = null,
    inviteid = "",
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.#gid = gid;
    this.groupName = name;
    this.members = members.map(m => m.toString());

    // Normalize userBal (old DB values or new style)
    this.userBal = (userBal || []).map(u => {
      if (typeof u === "number") {
        return { userId: null, balance: u };
      }
      return {
        userId: u.userId ? u.userId.toString() : null,
        balance: u.balance ?? 0
      };
    });

    this.#balance = balance;

    // Expenses (kept as plain objects or instances)
    this.#expenses = expenses || [];

    this.description = description;
    this.createdBy = createdBy ? createdBy.toString() : null;
    this.inviteid = inviteid;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** ----------------------------------------
   * Helper: Ensure userBal includes all members
   ---------------------------------------- */
  ensureUserBalForMembers() {
    const existing = new Set(
      this.userBal.map(u => u.userId ? u.userId.toString() : "")
    );

    for (const m of this.members) {
      if (!existing.has(m.toString())) {
        this.userBal.push({ userId: m.toString(), balance: 0 });
      }
    }
  }

  /** ----------------------------------------
   *  Equal Split Balance Update
   ---------------------------------------- */
  updateBalanceEqual(amount, splitAmong) {
    if (!Array.isArray(splitAmong) || splitAmong.length === 0) {
      throw new Error("splitAmong must be a non-empty array");
    }

    const splitCount = splitAmong.length;
    const share = amount / splitCount;

    this.ensureUserBalForMembers();

    this.userBal = this.userBal.map(entry => {
      const uid = entry.userId ? entry.userId.toString() : null;
      if (uid && splitAmong.includes(uid)) {
        return {
          userId: uid,
          balance: (entry.balance || 0) + share
        };
      }
      return {
        userId: uid,
        balance: entry.balance || 0
      };
    });
  }

  /** ----------------------------------------
   * Add Expense
   ---------------------------------------- */
  addExpense(expense) {
    if (!(expense instanceof GroupExpense))
      throw new TypeError("expense must be a GroupExpense instance");

    const amount = expense.getDetails().amount; // FIXED
    const splitAmong = expense.splitAmong;

    if (!Array.isArray(splitAmong) || splitAmong.length === 0) {
      throw new Error("splitAmong must be provided");
    }

    // Add expense object
    this.#expenses.push(expense);

    // Update all balances
    this.updateBalanceEqual(amount, splitAmong);
  }

  /** ----------------------------------------
   * Add Member (Instance-Level)
   ---------------------------------------- */
  addMember(user) {
    const id = user?._id || user?.id;
    if (!id) throw new Error("Invalid user object");

    this.members.push(id.toString());
    this.userBal.push({ userId: id.toString(), balance: 0 });
  }

  /** ----------------------------------------
   * Convert Class → DB Serializable Object
   ---------------------------------------- */
  toDBObject() {
    return {
      gid: this.#gid,
      name: this.groupName,
      description: this.description,
      createdBy: this.createdBy,
      inviteid: this.inviteid,
      members: this.members,
      userBal: this.userBal.map(u => ({
        userId: u.userId,
        balance: u.balance
      })),
      balance: this.#balance,

      // FIX: safely serialize expenses
      expenses: this.#expenses.map(e =>
        typeof e?.toJSON === "function" ? e.toJSON() : e
      ),
    };
  }

  /** ----------------------------------------
   * Save new Group to DB
   ---------------------------------------- */
  async save() {
    const data = this.toDBObject();
    const groupDoc = new GroupModel(data);
    return await groupDoc.save();
  }

  /** ----------------------------------------
   * Static DB Methods
   ---------------------------------------- */
  static async findOne(filter) {
    return await GroupModel.findOne(filter);
  }

  static async findById(id) {
    return await GroupModel.findById(id);
  }

  static async find(filter) {
    return await GroupModel.find(filter);
  }

  /** ----------------------------------------
   * Add Member (DB-Level)
   ---------------------------------------- */
  static async addMember(groupId, userId) {
    const group = await GroupModel.findById(groupId);
    if (!group) throw new Error("Group not found");

    if (group.members.includes(userId)) {
      throw new Error("User already in group");
    }

    group.members.push(userId);

    group.userBal.push({ userId, balance: 0 });

    await group.save();
    return group;
  }

  /** ----------------------------------------
   * Remove Member (DB-Level)
   ---------------------------------------- */
  static async removeMember(groupId, userId) {
    const group = await GroupModel.findById(groupId);
    if (!group) throw new Error("Group not found");

    group.members = group.members.filter(mid => mid.toString() !== userId.toString());
    group.userBal = group.userBal.filter(u => u.userId.toString() !== userId.toString());

    await group.save();
    return group;
  }
}
