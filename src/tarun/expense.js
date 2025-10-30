// classes/expense.js
import expenseModel from "../models/expense.js";

export default class Expense {
  #desc;
  #amount = 0;
  #time = new Date();

  constructor(desc = "", amount = 0, time = null) {
    this.setDesc(desc);
    this.setAmount(amount);
    this.setTime(time ?? new Date());
  }

  // ----- Getters -----
  getDetails() {
    return {
      description: this.#desc,
      amount: this.#amount,
      time: this.#time,
    };
  }

  // ----- Setters -----
  setAmount(value) {
    const n = Number(value);
    if (!isFinite(n) || n < 0)
      throw new TypeError("amount must be a non-negative number");
    this.#amount = n;
    return this.#amount;
  }

  setDesc(desc) {
    this.#desc = desc;
  }

  setTime(value) {
    if (value == null) value = new Date();

    let date;
    if (value instanceof Date) {
      if (isNaN(value)) throw new TypeError("time must be a valid Date");
      date = new Date(value);
    } else {
      const str = String(value);
      const containsTime =
        /T\d{2}:\d{2}(:\d{2})?/.test(str) || /\d{2}:\d{2}(:\d{2})?/.test(str);
      if (typeof value === "string" && !containsTime) {
        throw new TypeError(
          'time string must include both date and time (e.g. "2025-10-27T15:30:00")'
        );
      }
      date = new Date(value);
    }

    if (isNaN(date)) throw new TypeError("time must be a valid Date or parsable value");
    this.#time = date;
  }

  // ----- Serializers -----
  toJSON() {
    return {
      description: this.#desc,
      amount: this.#amount,
      time: this.#time.toISOString(),
    };
  }

  toDBObject(data={
      description: this.#desc,
      amount: this.#amount,
      time: this.#time,
  }) {
    return data;
  }

  // ----- MongoDB Operations -----
  async save() {
    const data = this.toDBObject();
    const expenseDoc = new expenseModel(data);
    return await expenseDoc.save();
  }

  static async findOne(filter) {
    return await expenseModel.findOne(filter);
  }

  static async findById(id) {
    return await expenseModel.findById(id);
  }
}


export class GroupExpense extends Expense {
  #paidby;

  constructor(paidby, desc = "", amount = 0, time = null) {
    super(desc, amount, time);
    this.#paidby = paidby;
  }

  toJSON() {
    return { ...super.toJSON(), paidby: this.#paidby };
  }

  toDBObject(data={ ...super.toDBObject(), paidby: this.#paidby }) {
    return data;
  }

  async save() {
    const data = this.toDBObject();
    const expenseDoc = new (await import("../models/expenseModel.js")).default(data);
    return await expenseDoc.save();
  }

  static async findOne(filter) {
    const model = (await import("../models/expenseModel.js")).default;
    return await model.findOne(filter).populate("paidby");
  }

  static async findById(id) {
    const model = (await import("../models/expenseModel.js")).default;
    return await model.findById(id).populate("paidby");
  }
}
