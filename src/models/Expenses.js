
class Expense {
  constructor(paidBy, amount, description, splitBetween) {
    this.paidBy = paidBy;
    this.amount = amount;
    this.description = description;
    this.splitBetween = splitBetween;
  }
  calculateShares() {
    const share = this.amount / this.splitBetween.length;
    return this.splitBetween.map(user => ({
      user,
      owes: user === this.paidBy ? 0 : share
    }));
  }
}
module.exports = Expense;
