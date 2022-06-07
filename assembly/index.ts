import { Payflow, listedPayflows } from './model';
import { ContractPromiseBatch, context, u128, datetime } from 'near-sdk-as';
import { PlainDateTime, Duration } from "assemblyscript-temporal";
import { parseNearAmount, formatNearAmount } from "near-api-js/lib/utils/format";

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

function getDurationSecond(duration: Duration): f32 {
    return f32((((duration.years*365+duration.days)*24+duration.hours)*60+duration.minutes)*60+duration.seconds);
}

function getTimeDiffInSecond(time1: PlainDateTime, time2: PlainDateTime): f32 {
    return getDurationSecond(getTimeDiff(time1, time2));
}

export function getTimeRatio(beginTime: string, endTime: string): f32 {
    const bTime = stringToDatetime(beginTime);
    const nowTime = getNowTime();
    const eTime = stringToDatetime(endTime);
    const top = getTimeDiffInSecond(bTime, nowTime);
    const bot = getTimeDiffInSecond(bTime, eTime);
    let ratio = top/bot;
    if (ratio>1) {
        ratio = 1;
    }
    return ratio;
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

export function updateAvailable(beginTime: string, endTime: string,
                                initBalance: u128, taken: u128): f32 {
    let ratio = getTimeRatio(beginTime, endTime);
    return ratio*initBalance.toF32()-taken.toF32();
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
    if (getTimeDiffInSecond(btime, now)<=0) {
        throw new Error("Payment is not arrived");
    }
    let available = u128.fromF32(updateAvailable(payflow.beginTime, 
                                                 payflow.endTime, 
                                                 payflow.initBalance, 
                                                 payflow.taken));
    if (ammount > available) {
        throw new Error("Ask too much, should be less than "+available.toString());
    }
    ContractPromiseBatch.create(payflow.receiver).transfer(ammount);
    payflow.decreaseBalance(ammount);
    payflow.increaseTaken(ammount);
    payflow.setAvailable(available);
    listedPayflows.set(payflow.id, payflow);
}
/********************************************************************* */

export function f32tou128(number: f32): u128 {
    return u128.fromF32(number);
}

export function f32toString(number: f32): string {
    return number.toString();
}

export function f32tof32(number: f32): f32 {
    return number;
}