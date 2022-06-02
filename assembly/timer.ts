import { datetime } from 'near-sdk-as';
import { PlainDateTime, Duration } from "assemblyscript-temporal";

export function stringToDatetime(time: string): PlainDateTime {
    return PlainDateTime.from(time);
}

function getTimeDiff(time1: PlainDateTime, time2: PlainDateTime): Duration {
    return time1.until(time2);
}

export function getNowTime(): PlainDateTime {
    return datetime.block_datetime();
}

function getDurationSecond(duration: Duration): f32 {
    return f32((((duration.years*365+duration.days)*24+duration.hours)*60+duration.minutes)*60+duration.seconds);
}

export function getTimeDiffInSecond(time1: PlainDateTime, time2: PlainDateTime): f32 {
    return getDurationSecond(getTimeDiff(time1, time2));
}

export function getTimeRatio(_beginTime: string, _endTime: string): f32 {
    let beginTime = stringToDatetime(_beginTime);
    let nowTime = getNowTime();
    let endTime = stringToDatetime(_endTime);
    let ratio = getTimeDiffInSecond(beginTime, nowTime)/getTimeDiffInSecond(beginTime, endTime);
    if (ratio<1) {
        return ratio;
    } else {
        return 1.0000;
    }
}