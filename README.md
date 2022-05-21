near create-account fpay.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account boss.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account employee.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 1
near state boss.looksrare.testnet
near state employee.looksrare.testnet
near state fpay.looksrare.testnet
near send fpay.looksrare.testnet employee.looksrare.testnet 0.01

yarn asb
near deploy --accountId=fpay.looksrare.testnet --wasmFile=build/release/near-fluidity-dapp.wasm

near call fpay.looksrare.testnet createAccount '{"account":{"id": "1"}}' --accountId=boss.looksrare.testnet --depositYocto=100000000000000000000000
// 0.1 NEAR

near view fpay.looksrare.testnet getAccounts --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet withdrawAssets '{"id":"1", "ammount":"5000000"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet depositAssets '{"id":"1"}' --accountId=boss.looksrare.testnet --depositYocto=10000000000000000000000

near call fpay.looksrare.testnet updateAvailable '{"id":"1"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet startPayment '{"id":"1", "beginTime":"2022-05-21T01:00:00.000000000","endTime":"2022-05-22T1:00:00.000000000", "numofpay":2, "receiver":"employee.looksrare.testnet"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet getPayment '{"id":"1", "ammount":"50"}' --accountId=employee.looksrare.testnet

near call fpay.looksrare.testnet killAccount '{"id":"1"}'  --accountId=looksrare.testnet

time format ok = '2022-04-20T05:45:32.123456789' (minimum: nanosecond)