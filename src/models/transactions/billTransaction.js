import Transaction from "./transaction";


class BillTransaction extends Transaction {
  #biller;

  constructor({ amount, userId, groupId, description, biller }) {
    super({ amount, userId, groupId, description });
    this.#biller = biller;
  }

  process() {
    return {
      ...this.getDetails(),
      method: "Bill Payment",
      biller: this.#biller,
      status: "Bill settled ✅",
    };
  }

}

export default BillTransaction;
