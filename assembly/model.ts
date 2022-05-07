import { PersistentUnorderedMap, u128, context } from "near-sdk-as";

@nearBindgen
export class Account {
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
    public static setAccount(_account: Account): Account {
        const account = new Account();
        account.id = _account.id;
        account.beginTime = _account.beginTime;
        account.endTime = _account.endTime;
        account.numofpay = _account.numofpay;
        account.receiver = _account.receiver;
        account.owner = context.sender;
        account.balance = context.attachedDeposit;
        return account;
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
        this.start = true;
    }
}

export const listedAccounts = new PersistentUnorderedMap<string, Account>("LISTED_ACCOUNTS");





/*@nearBindgen
export class Account{
    sender: string;
    receiver: string;
    beginDate: string;
    endDate: string;
    available: u128;
    numofsends: u32;
    balance: u128;
    start: bool;
    initBalance: u128;
    taken: u128;
    public static setAccount(_account: Account): Account {
        const account = new Account();
        account.id = _account.id;
        account.receiver = _account.receiver;
        account.balance = _account.balance;
        account.beginDate = _account.beginDate;
        account.endDate = _account.endDate;
        account.numofsends = _account.numofsends;
        account.sender = context.sender;
        return account;
    }
    public getId(id: string): string {
        return this.id;
    }
    public getOwner(owner: string): string {
        return this.sender;
    }
    public getReceiver(receiver: string): string {
        return this.receiver;
    }
    public getBalance(balance: u128): u128 {
        return this.balance;
    }
    public increaseBalance(change: u128): void {
        this.balance = u128.add(this.balance, change);
    }
    public decreaseBalance(change: u128): void {
        this.balance = u128.sub(this.balance, change);
    }
    //public updateAvailable(): void {
    //    this.available = floor((now-this.beginDate)/(this.end-this.beginDate)*this.numofsends)*this.balance/this.numofsends-taken;
    //}
    public updateTakan(ammount: u128): void {
        this.taken = u128.add(this.taken, ammount);
    }
    pucluc setStart()
}

export const listedAccounts = new PersistentUnorderedMap<string, Account>("LISTED_ACCOUNTS");*/
