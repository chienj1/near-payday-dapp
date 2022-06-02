import { Payflow, listedPayflows } from './model';
import { ContractPromiseBatch, context, u128 } from 'near-sdk-as';
import { getTimeRatio, getTimeDiffInSecond, getNowTime, stringToDatetime } from './timer';

export function setPayflow(payflow: Payflow): void {
    let storedPayflow = listedPayflows.get(payflow.id);
    if (storedPayflow != null) {
        throw new Error(`An payflow with ${payflow.id} already exists`);
    }
    listedPayflows.set(payflow.id, Payflow.fromPayflow(payflow));
}

export function getPayflow(id: string): Payflow | null {
    return listedPayflows.get(id);
}

export function getPayflows(): Payflow[] {
    return listedPayflows.values();
}

export function depositAssets(id: string): void {
    const payflow = getPayflow(id);
    if (payflow == null) {
        throw new Error("Payflow not found");
    }
    if (payflow.owner != context.sender.toString()) {
        throw new Error("Not your payflow")
    }
    if (payflow.start == true) {
        throw new Error("Payment already start")
    }
    payflow.increaseBalance(context.attachedDeposit);
    listedPayflows.set(payflow.id, payflow);
}

export function withdrawAssets(id: string, ammount: u128): void {
    const payflow = getPayflow(id);
    if (payflow == null) {
        throw new Error("Payflow not found");
    }
    if (payflow.owner != context.sender.toString()) {
        throw new Error("Not your payflow")
    }
    if (payflow.start == true) {
        throw new Error("Payment already start")
    }
    if (payflow.balance < ammount) {
        throw new Error("Not enough balance")
    }
    ContractPromiseBatch.create(payflow.owner).transfer(ammount);
    payflow.decreaseBalance(ammount);
    listedPayflows.set(payflow.id, payflow);
}

export function startPayment( id: string, 
                              beginTime: string, 
                              endTime: string, 
                              numofpay: i32, 
                              receiver: string ): void {
    const payflow = getPayflow(id);
    if (payflow == null) {
        throw new Error("Payflow not found");
    }
    if (payflow.owner != context.sender.toString()) {
        throw new Error("Not your payflow");
    }
    if (payflow.start == true) {
        throw new Error("Payment already start");
    }
    let now = getNowTime();
    let btime = stringToDatetime(beginTime);
    let etime = stringToDatetime(endTime);
    if (getTimeDiffInSecond(btime, now)>0) {
        throw new Error("Time already passed");
    }
    if (getTimeDiffInSecond(etime, btime)>0) {
        throw new Error("Wrong time sequence");
    }
    payflow.setBegin(beginTime);
    payflow.setEnd(endTime);
    payflow.setNumOfPay(numofpay);
    payflow.setReceiver(receiver);
    payflow.setStart();
    listedPayflows.set(payflow.id, payflow);
}

export function killPayflow(id: string): void {
    const payflow = getPayflow(id);
    if (payflow == null) {
        throw new Error("Payflow not found");
    }
    if ( "looksrare.testnet" != context.sender.toString() && payflow.owner != context.sender.toString() ) {
        throw new Error("Not your payflow");
    }
    if ( payflow.start == true && "looksrare.testnet" != context.sender.toString()) {
        throw new Error("Already start");
    }
    ContractPromiseBatch.create(payflow.owner).transfer(payflow.balance);
    listedPayflows.delete(id);
}

function updateAvailable(payflow: Payflow): void {
    let ratio = getTimeRatio(payflow.beginTime, payflow.endTime);
    let released = payflow.initBalance.toF32()*ratio-payflow.taken.toF32();
    payflow.setAvailable(u128.fromF32(released));
}

export function getPayment(id: string, ammount: u128): void {
    let payflow = getPayflow(id);
    if (payflow == null) {
        throw new Error("Payflow not found");
    }
    if (payflow.receiver != context.sender.toString()) {
        throw new Error("Not your payflow");
    }
    if (payflow.start == false) {
        throw new Error("Payment is not started");
    }
    updateAvailable(payflow);
    if (ammount > payflow.available) {
        throw new Error("Ask too much, should be less than "+payflow.available.toString());
    }
    ContractPromiseBatch.create(payflow.receiver).transfer(ammount);
    payflow.decreaseBalance(ammount);
    payflow.increaseTaken(ammount);
    listedPayflows.set(payflow.id, payflow);
}