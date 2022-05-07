near create-account fpay.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account boss.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 10
near create-account employee.looksrare.testnet --masterAccount looksrare.testnet --initialBalance 1
near state boss.looksrare.testnet
near state employee.looksrare.testnet
near state fpay.looksrare.testnet
near send fpay.looksrare.testnet employee.looksrare.testnet 0.01

yarn asb
near deploy --accountId=fpay.looksrare.testnet --wasmFile=build/release/near-fluidity-dapp.wasm

near call fpay.looksrare.testnet createAccount '{"account":{"id": "1",  "beginTime": "202205072325",  "endTime": "202205072359", "numofpay": 2, "receiver": "employee.looksrare.testnet"}}' --accountId=boss.looksrare.testnet --depositYocto=1000000000000000000000000

near view fpay.looksrare.testnet getAccounts --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet withdrawAssets '{"id":"1", "ammount":"5000000"}' --accountId=boss.looksrare.testnet

near call fpay.looksrare.testnet depositAssets '{"id":"1"}' --accountId=boss.looksrare.testnet --depositYocto=10000000000000000000000

near call fpay.looksrare.testnet killAccount '{"id":"1"}'  --accountId=looksrare.testnet

near call fpay.looksrare.testnet getPayment '{"id":"3", "ammount":"100000000000000000000000"}' --accountId=employee.looksrare.testnet

