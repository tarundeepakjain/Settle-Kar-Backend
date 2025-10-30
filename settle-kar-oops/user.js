export default class User {
  #balance;
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.#balance = 0;
  }

  addBalance(amount) {
    this.#balance += amount;
  }

  deductBalance(amount) {
    this.#balance -= amount;
  }

  getBalance() {
    return this.#balance;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      balance: this.#balance,
    };
  }
}
