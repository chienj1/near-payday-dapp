near create-account fpay.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account boss.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account employee.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 1
near state boss.looksrare.testnet
near state employee.looksrare.testnet
near state fpay.looksrare.testnet
near send fpay.looksrare.testnet employee.looksrare.testnet 0.01

yarn asb
near deploy --accountId=fpay.looksrare.testnet --wasmFile=build/release/near-fluidity-dapp.wasm

near call fpay.looksrare.testnet createAccount '{"account":{"id": "1"}}' --accountId=boss.looksrare.testnet --depositYocto=1000000000000000000000000

near view fpay.looksrare.testnet getAccounts --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet withdrawAssets '{"id":"1", "ammount":"5000000"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet depositAssets '{"id":"1"}' --accountId=boss.looksrare.testnet --depositYocto=10000000000000000000000

near call fpay.looksrare.testnet killAccount '{"id":"1"}'  --accountId=looksrare.testnet

near call fpay.looksrare.testnet startPayment '{"id":"1", "beginTime":"now","endTime":"tomorrow", "numofpay":2, "receiver":"employee.looksrare.testnet"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet getPayment '{"id":"1", "ammount":"10000000000000000000000","update_available":"10000000000000000000001"}' --accountId=employee.looksrare.testnet
