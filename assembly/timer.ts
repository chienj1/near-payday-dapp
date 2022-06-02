import { datetime } from 'near-sdk-as';
import { PlainDateTime, Duration } from "assemblyscript-temporal";

function getTimeDiff(time1: PlainDateTime, time2: PlainDateTime): Duration {
    return time1.until(time2);
}

function getNowTime(): PlainDateTime {
    return datetime.block_datetime();
}

function getDurationSecond(duration: Duration): f32 {
    return f32((((duration.years*365+duration.days)*24+duration.hours)*60+duration.minutes)*60+duration.seconds);
}

export function getTimeRatio(_beginTime: string, _endTime: string): f32 {
    let beginTime = PlainDateTime.from(_beginTime);
    let nowTime = getNowTime();
    let endTime = PlainDateTime.from(_endTime);
    let timeBeginToEnd = getTimeDiff(beginTime, endTime);
    let timeBeginToNow = getTimeDiff(beginTime, nowTime);
    let ratio = getDurationSecond(timeBeginToNow)/getDurationSecond(timeBeginToEnd);
    let ratio_less_than_one = ratio<1;
    if (ratio_less_than_one) {
        return ratio;
    }
    else {
        return 1.0000;
    }
    
}