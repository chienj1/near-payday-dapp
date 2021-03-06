import { Payflow, listedPayflows } from './model';
import { ContractPromiseBatch, context, u128, datetime } from 'near-sdk-as';
import { PlainDateTime, Duration } from "assemblyscript-temporal";

// Time management
/********************************************************************* */
function stringToDatetime(time: string): PlainDateTime {
    return PlainDateTime.from(time);
}

function getTimeDiff(time1: PlainDateTime, time2: PlainDateTime): Duration {
    return time1.until(time2);
}

function getNowTime(): PlainDateTime {
    return datetime.block_datetime();
}

function getDurationSecond(duration: Duration): u128 {
    return u128.from((((duration.years*365+duration.days)*24+duration.hours)*60+duration.minutes)*60+duration.seconds);
}

function getTimeDiffInSecond(time1: PlainDateTime, time2: PlainDateTime): u128 {
    return getDurationSecond(getTimeDiff(time1, time2));
}

export function getTimeRatio(beginTime: string, endTime: string): u128[] {
    const bTime = stringToDatetime(beginTime);
    const nowTime = getNowTime();
    const eTime = stringToDatetime(endTime);
    let top = getTimeDiffInSecond(bTime, nowTime);
    let bot = getTimeDiffInSecond(bTime, eTime);
    if (top>bot) {
        top = u128.One;
        bot = u128.One;
    }
    return [top, bot];
}
/********************************************************************* */

// Payflow management
/********************************************************************* */
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
    if (PlainDateTime.compare(etime, btime)==-1) {
        throw new Error("Wrong time sequence");
    }
    if (PlainDateTime.compare(btime, now)==-1) {
        throw new Error("Time already passed");
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

export function updateAvailable(beginTime: string, endTime: string,
                                initBalance: u128, taken: u128): u128 {
    let ratio = getTimeRatio(beginTime, endTime);
    return u128.sub(u128.mul(u128.div(initBalance, ratio[1]), ratio[0]), taken);
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
    const now = getNowTime();
    const btime = stringToDatetime(payflow.beginTime);
    if (getTimeDiffInSecond(btime, now)<=u128.Zero) {
        throw new Error("Payment is not arrived");
    }
    let available = updateAvailable(payflow.beginTime, 
                                    payflow.endTime, 
                                    payflow.initBalance, 
                                    payflow.taken);
    if (ammount > available) {
        throw new Error("Ask too much, should be less than "+available.toString());
    }
    ContractPromiseBatch.create(payflow.receiver).transfer(ammount);
    payflow.decreaseBalance(ammount);
    payflow.increaseTaken(ammount);
    payflow.setAvailable(u128.sub(available, ammount));
    listedPayflows.set(payflow.id, payflow);
}