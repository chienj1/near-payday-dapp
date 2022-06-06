near create-account ffpay.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account boss.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account employee.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 1
near state boss.looksrare.testnet
near state employee.looksrare.testnet
near state ffpay.looksrare.testnet
near send ffpay.looksrare.testnet employee.looksrare.testnet 0.01

yarn asb
near deploy --accountId=ffpay.looksrare.testnet --wasmFile=build/release/near-fluidity-dapp.wasm

near call ffpay.looksrare.testnet getTimeRatio '{"beginTime":"2022-06-06T10:45:00.123456789", "endTime":"2022-06-06T20:45:00.123456789"}' --accountId=employee.looksrare.testnet

near call ffpay.looksrare.testnet setPayflow '{"payflow":{"id": "1"}}' --accountId=boss.looksrare.testnet --depositYocto=100000000000000000000000
// 0.1 NEAR

near view ffpay.looksrare.testnet getPayflows --accountId=boss.looksrare.testnet

near call ffpay.looksrare.testnet withdrawAssets '{"id":"1", "ammount":"5000000"}' --accountId=boss.looksrare.testnet

near call ffpay.looksrare.testnet depositAssets '{"id":"1"}' --accountId=boss.looksrare.testnet --depositYocto=10000000000000000000000


near call ffpay.looksrare.testnet startPayment '{"id":"1", "beginTime":"2022-06-02T01:00:00.000000000","endTime":"2022-06-03T10:00:00.000000000", "numofpay":2, "receiver":"employee.looksrare.testnet"}' --accountId=boss.looksrare.testnet

near call ffpay.looksrare.testnet getPayment '{"id":"1", "ammount":"50"}' --accountId=employee.looksrare.testnet

near call ffpay.looksrare.testnet updateAvailable '{"beginTime":"2022-06-06T10:45:00.123456789", "endTime":"2022-06-06T20:45:00.123456789", "initBalance":"100", "taken":"0"}' --accountId=employee.looksrare.testnet

near call ffpay.looksrare.testnet killPayflow '{"id":"1"}'  --accountId=looksrare.testnet

time format ok = '2022-04-20T05:45:32.123456789' (minimum: nanosecond)