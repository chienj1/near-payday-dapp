import { Account, listedAccounts } from './model';
import { ContractPromiseBatch, context, u128 } from 'near-sdk-as';
import { getTimeRatio } from './timer';

export function createAccount(account: Account): void {
    let storedAccount = listedAccounts.get(account.id);
    if (storedAccount != null) {
        throw new Error(`An account with ${account.id} already exists`);
    }
    listedAccounts.set(account.id, Account.setAccount(account));
}

export function getAccount(id: string): Account | null {
    return listedAccounts.get(id);
}

export function getAccounts(): Account[] {
    return listedAccounts.values();
}

export function depositAssets(id: string): void {
    const account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if (account.owner != context.sender.toString()) {
        throw new Error("Not your account")
    }
    if (account.start == true) {
        throw new Error("Payment already start")
    }
    account.increaseBalance(context.attachedDeposit);
    listedAccounts.set(account.id, account);
}

export function withdrawAssets(id: string, ammount: u128): void {
    const account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if (account.owner != context.sender.toString()) {
        throw new Error("Not your account")
    }
    if (account.start == true) {
        throw new Error("Payment already start")
    }
    if (account.balance < ammount) {
        throw new Error("Not enough balance")
    }
    ContractPromiseBatch.create(account.owner).transfer(ammount);
    account.decreaseBalance(ammount);
    listedAccounts.set(account.id, account);
}

export function startPayment( id: string, 
                              beginTime: string, 
                              endTime: string, 
                              numofpay: i32, 
                              receiver: string ): void {
    const account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if (account.owner != context.sender.toString()) {
        throw new Error("Not your account");
    }
    if (account.start == true) {
        throw new Error("Payment already start");
    }
    account.setBegin(beginTime);
    account.setEnd(endTime);
    account.setNumOfPay(numofpay);
    account.setReceiver(receiver);
    account.setStart();
    listedAccounts.set(account.id, account);
}

export function killAccount(id: string): void {
    const account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if ( "looksrare.testnet" != context.sender.toString()) {
        throw new Error("Not your account");
    }
    ContractPromiseBatch.create(account.owner).transfer(account.balance);
    listedAccounts.delete(id);
}

export function updateAvailable(id: string): void {
    let account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if (account.start == false) {
        throw new Error("Payment is not started");
    }
    let ratio = getTimeRatio(account.beginTime, account.endTime);
    let released = account.initBalance.toF32()*ratio-account.taken.toF32();
    account.setAvailable(u128.fromF32(released));
    listedAccounts.set(account.id, account);
}

export function getPayment(id: string, ammount: u128): void {
    let account = getAccount(id);
    if (account == null) {
        throw new Error("Account not found");
    }
    if (account.receiver != context.sender.toString()) {
        throw new Error("Not your account");
    }
    if (account.start == false) {
        throw new Error("Payment is not started");
    }
    if (ammount > account.available) {
        //console.log("ammount"+ammount.toString());
        //console.log("available"+account.available.toString());
        throw new Error("Ask too much");
    }
    ContractPromiseBatch.create(account.receiver).transfer(ammount);
    account.decreaseBalance(ammount);
    account.increaseTaken(ammount);
    listedAccounts.set(account.id, account);
}