import { PersistentUnorderedMap, u128, context } from "near-sdk-as";

@nearBindgen
export class Payflow {
    id: string;
    beginTime: string;
    endTime: string;
    numofpay: i32;
    receiver: string;
    owner: string;
    balance: u128;

    initBalance: u128;
    available: u128;
    taken: u128;
    start: bool;
    public static fromPayflow(_payflow: Payflow): Payflow {
        const payflow = new Payflow();
        payflow.id = _payflow.id;
        payflow.owner = context.sender;
        payflow.balance = context.attachedDeposit;
        return payflow;
    }
    public increaseBalance(ammount: u128): void {
        this.balance = u128.add(this.balance, ammount);
    }
    public decreaseBalance(ammount: u128): void {
        this.balance = u128.sub(this.balance, ammount);
    }
    public setBegin(_beginTime: string): void {
        this.beginTime = _beginTime;
    }
    public setEnd(_endTime: string): void {
        this.endTime = _endTime;
    }
    public setNumOfPay(_numofpay: i32): void {
        this.numofpay = _numofpay;
    }
    public setReceiver(_receiver: string): void {
        this.receiver = _receiver;
    }
    public setStart(): void {
        this.initBalance = this.balance;
        this.available = u128.Zero;
        this.taken = u128.Zero;
        this.start = true;
    }
    public setAvailable(ammount: u128): void {
        this.available = ammount;
    }
    public setTaken(ammount: u128): void {
        this.taken = ammount;
    }
    public increaseTaken(ammount: u128): void {
        this.taken = u128.add(this.taken, ammount);
    }
}

export const listedPayflows = new PersistentUnorderedMap<string, Payflow>("LISTED_PAYFLOWS");