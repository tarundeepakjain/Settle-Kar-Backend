export default class Expense {
    #desc;
    #amount = 0;
    #time = new Date();

    constructor(desc='',amount = 0, time = null) {
        this.setDesc(desc);
        this.setAmount(amount);
        this.setTime(time ?? new Date());
    }

    //Getters
    getDetails(){
        return {
            description:this.#desc,
            amount:this.#amount,
            time:this.#time
        };
    }

    //Setters
    setAmount(value) {
        const n = Number(value);
        if (!isFinite(n) || n < 0) throw new TypeError('amount must be a non-negative number');
        this.#amount = n;
        return this.#amount;
    }

    setDesc(desc){
        this.#desc=desc;
    }
    /**
     * Replace the expense time. Accepts Date or any value Date can parse.
     * Requires that string inputs include both date and time (e.g. "2025-10-27T15:30:00" or "2025-10-27 15:30").
     */
    setTime(value) {
        if (value == null) value = new Date();

        let date;
        if (value instanceof Date) {
            if (isNaN(value)) throw new TypeError('time must be a valid Date');
            date = new Date(value);
        } else {
            // For string inputs, ensure they include both date and time
            const str = String(value);
            const containsTime = /T\d{2}:\d{2}(:\d{2})?/.test(str) || /\d{2}:\d{2}(:\d{2})?/.test(str);
            if (typeof value === 'string' && !containsTime) {
                throw new TypeError('time string must include both date and time (e.g. "2025-10-27T15:30:00")');
            }
            date = new Date(value);
        }

        if (isNaN(date)) throw new TypeError('time must be a valid Date or parsable value');
        this.#time = date;
        return this.getTime();
    }

    //Serializers
    toJSON() {
        return { amount: this.#amount, time: this.#time.toISOString() };
    }
}


export class GroupExpense extends Expense {
    #paidby;
    //Make check here for non empty paidby in backend
    constructor(paidby,desc='',amount = 0, time = null) {
        super(desc,amount, time);
        this.#paidby=paidby;
    }
    
    toJSON() {
        return { ...super.toJSON(), paidby: this.#paidby };
    }
}
