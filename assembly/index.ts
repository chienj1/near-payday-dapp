import { Account, listedAccounts } from './model';
import { ContractPromiseBatch, context, u128 } from 'near-sdk-as';

export function createAccount(account: Account): void {
    let storedAccount = listedAccounts.get(account.id);
    if (storedAccount !== null) {
        throw new Error(`an account with ${account.id} already exists`);
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
        throw new Error("account not found");
    }
    account.increaseBalance(context.attachedDeposit);
    listedAccounts.set(account.id, account);
}

export function withdrawAssets(id: string, ammount: u128): void {
    const account = getAccount(id);
    if (account == null) {
        throw new Error("account not found");
    }
    ContractPromiseBatch.create(account.owner).transfer(ammount);
    account.decreaseBalance(ammount);
    listedAccounts.set(account.id, account);
}

export function killAccount(id: string): void {
    listedAccounts.delete(id);
}

/*export function startPayment(id:string): void {
    let account = getAccount(id);
    if 
}*/

export function getPayment(id: string, ammount: u128): void {
    let account = getAccount(id);
    if (account == null) {
        throw new Error("account not found");
    }
    ContractPromiseBatch.create(account.receiver).transfer(ammount);
    account.decreaseBalance(ammount);
    listedAccounts.set(account.id, account);
}




