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

  /** Split equally among members */
  splitEqually(amount) {
    if (this.members.length === 0)
      throw new Error("No members to split amount.");
    const increment = amount / this.members.length;
    this.userBal = this.userBal.map((v) => v + increment);
  }

  /** Split unequally */
  splitUnequally(amount, splitPrice) {
    const total = splitPrice.reduce((a, b) => a + b, 0);
    if (total !== amount || splitPrice.length !== this.members.length)
      throw new Error("Invalid split amounts.");
    for (let i = 0; i < this.members.length; i++) {
      this.userBal[i] += splitPrice[i];
    }
  }

  /** Add an expense */
  addExpense(expense, splitPrice = []) {
    if (!(expense instanceof GroupExpense))
      throw new TypeError("Expense must be instance of GroupExpense");
    const amount = expense.amount;
    if (amount <= 0) throw new Error("Expense must be positive");
    this.#expenses.push(expense);
    if (splitPrice.length === 0) this.splitEqually(amount);
    else this.splitUnequally(amount, splitPrice);
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
      userBal: this.userBal,
      balance: this.#balance,
      expenses: this.#expenses.map((e) =>
        typeof e.toJSON === "function" ? e.toJSON() : e
      ),
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
