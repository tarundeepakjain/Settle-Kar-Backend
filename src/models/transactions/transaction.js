class Transaction {
  // Private
  #amount;
  #userId;
  #groupId;
  #description;

  // Public
  timestamp = new Date()

  constructor({ amount, userId, groupId, description }) {
    this.#amount = amount;
    this.#userId = userId;
    this.#groupId = groupId;
    this.#description = description;
  }

  getDetails() {
    return {
      amount: this.#amount,
      userId: this.#userId,
      groupId: this.#groupId,
      description: this.#description,
      timestamp: this.timestamp,
    };
  }

  process() {
    throw new Error("process() must be implemented by child class");
  }

}

export default Transaction;
