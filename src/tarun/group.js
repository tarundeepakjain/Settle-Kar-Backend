import User from "../models/user.js";
import GroupModel from "../models/group.js";
import { GroupExpense } from "./expense.js";

export default class Group {
  #gid;
  #balance;
  #expenses;
  groupName;
  members;
  userBal;
  description;
  createdBy;
  inviteid;
  createdAt;
  updatedAt;

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
    this.members = members;
    this.userBal = userBal;
    this.#balance = balance;
    this.#expenses = expenses;
    this.description = description;
    this.createdBy = createdBy;
    this.inviteid = inviteid;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateBalanceEqual(amount, splitAmong) {
    const splitCount = splitAmong.length;
    const share = amount / splitCount;

    this.userBal = this.userBal.map(entry => {
      if (splitAmong.includes(entry.userId.toString())) {
        return {
          userId: entry.userId,
          balance: entry.balance + share
        };
      }
      return entry;
    });
  }


  /** Add an expense */
  addExpense(expense) {
    if (!(expense instanceof GroupExpense))
      throw new TypeError("Expense must be instance of GroupExpense");

    const amount = expense.amount;
    const splitAmong = expense.splitAmong;

    if (!Array.isArray(splitAmong) || splitAmong.length === 0)
      throw new Error("splitAmong must be a non-empty array");

    // save expense
    this.#expenses.push(expense);

    // update balances
    this.updateBalanceEqual(amount, splitAmong);
  }


  /** Add member */
  addMember(user) {
    if (!(user instanceof User))
      throw new TypeError("Member must be instance of User");
    this.members.push(user);
    this.userBal.push(0);
  }

  /** Convert class instance to plain MongoDB object */
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
      expenses: this.#expenses.map(e => e.toJSON()),
    };
  }


  /** Save to MongoDB */
  async save() {
    const data = this.toDBObject();
    const groupDoc = new GroupModel(data);
    return await groupDoc.save();
  }

  /** Static helpers */
  static async findOne(filter) {
    return await GroupModel.findOne(filter).populate("members createdBy");
  }

  static async findById(id) {
    return await GroupModel.findById(id).populate("members createdBy");
  }

  static async find(filter) {
    return await GroupModel.find(filter).populate("members createdBy");
  }

  /** ✅ Add a user to group */
  static async addMember(groupId, userId) {
    const group = await GroupModel.findById(groupId);
    if (!group) throw new Error("Group not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (group.members.includes(userId))
      throw new Error("User already in group");

    // Add to group
    group.members.push(userId);
    await group.save();

    // Add group ref in user
    if (!user.groups.includes(group._id)) {
      user.groups.push(group._id);
      await user.save();
    }

    return group;
  }

  /** ✅ Remove a user from group */
  static async removeMember(groupId, userId) {
    const group = await GroupModel.findById(groupId);
    if (!group) throw new Error("Group not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!group.members.includes(userId))
      throw new Error("User not in this group");

    // Remove from group
    group.members = group.members.filter(
      (id) => id.toString() !== userId.toString()
    );
    await group.save();

    // Remove group ref in user
    user.groups = user.groups.filter(
      (id) => id.toString() !== group._id.toString()
    );
    await user.save();

    return group;
  }
}
