
const connection = require("./../public/javascript/connection");
const express = require('express');
const router = express.Router();
const axios = require('axios')
const Web3 = require("web3")
const BigNumber = require('bignumber.js');
require('dotenv').config()

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + process.env.INFURA_KEY))

module.exports = router;

// get contract abi
router.get('/contract_abi/:address', (req, res) => {
    const { address } = req.params
    // console.log(web3.utils.isAddress(address))
    if (web3.utils.isAddress(address)) {
        axios.get('http://api.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=' + process.env.ETHERSCAN_KEY)
        .then(function (response) {
            console.log(response.data.status)
            let abi = JSON.parse(response.data.result)
            // console.log(abi)
            if (abi != '') {
                const contract = new web3.eth.Contract(abi, address) 
                contract.methods.name().call((__, name) => {
                    contract.methods.symbol().call((__, symbol) => {
                        contract.methods.totalSupply().call((__, totalSupply) => {
                            contract.methods.decimals().call((__, decimals) => {
                            // console.log(totalSupply)
                                res.send({
                                    name,
                                    symbol,
                                    totalSupply,
                                    address,
                                    decimals
                                })
                            })
                        })
                    })
                })
            }
        })
        .catch(function (error) {
            console.log(error)
             res.send({
                    name: "address is not a contract",
                    symbol: "address is not a contract",
                    totalSupply: 0,
                    address: "address is not a contract",
                    decimals: 0
                })
        })
        .finally(function () {
            // always executed
        });
    } else {
        res.send({
            name: "not a valid address",
            symbol: "not a valid address",
            totalSupply: 0,
            address: "not a valid address",
            decimals: 0
        })
    }   
})

// get totalSupply of a contract **NOT USED**
router.get('/ping', (req, res) => {
    console.log("test")
    const query = "SELECT * FROM tokens WHERE getcall = hex2t;";
    connection.query(query, (err, load) => {
        res.send({
            message: "refresh"
        })
    })
});

// return token balance of a user for a contract
router.get('/balance_of_user/:wallet/:token_address', (req, res) => {

    const { wallet, token_address } = req.params
    // console.log('wallet = ',web3.utils.isAddress(wallet))
    // console.log('token_address = ',web3.utils.isAddress(token_address))
    // const contract = new web3.eth.Contract(abi, token_address)
    if (web3.utils.isAddress(wallet)) {
        axios.get('http://api.etherscan.io/api?module=contract&action=getabi&address=' + token_address + '&apikey=' + process.env.ETHERSCAN_KEY)
        .then(function (response) {
            let abi = JSON.parse(response.data.result)
            // console.log(abi)
            const contract = new web3.eth.Contract(abi, token_address)
            contract.methods.balanceOf(wallet).call((error, balance) => {
                res.send({
                    balance
                })
            })
        });
    } else {
        res.send({
            balance: 0
        })
    }
});

// return circulating supply for a token
router.get('/circulating/:getcall', (req, res) => {
    const query = "SELECT * FROM tokens WHERE getcall = ?;";
    const checkAddress = "SELECT EXISTS(SELECT * FROM tokens WHERE getcall = ? LIMIT 1);"
    const { getcall } = req.params
    connection.query(checkAddress, getcall, (err, check) => {
        const tokenExistsCheck = JSON.parse(Object.values(check[0]))
        // console.log('is it already in there? ', tokenExistsCheck)
        console.log("token is in database: ", tokenExistsCheck)
        if (tokenExistsCheck === 1) {
            connection.query(query, getcall, (err, result) => {
                const { address, removed_account_1, removed_account_2, removed_account_3, removed_account_4 } = result[0]
                if (err) {
                    // catch error
                    console.log(err)
                    return res.status(500).end();
                }
                axios.get('http://api.etherscan.io/api?module=contract&action=getabi&address=' + address + '&apikey=' + process.env.ETHERSCAN_KEY)
                    .then(function (response) {
                        let abi = JSON.parse(response.data.result)
                        // console.log(abi)
                        // let array = []
                        // const emptyArray = []
                        const contract = new web3.eth.Contract(abi, address)
                        // for (let item of abi) {
                        // //     if (item.type === "constructor") console.log('constructors ',item.inputs)
                        //     if (item.stateMutability === "view" && item.inputs.length === 0) {
                        //         array.push(item.name)
                        //         // console.log('functions ', item.name+'()')
                        //     }
                        // //     // if (item.includes('()')) console.log(item.name)
                        // }
                        // console.log(array)
                        // console.log(Object.keys(contract.methods))
                        contract.methods.totalSupply().call((__, totalSupply) => { 
                            contract.methods.balanceOf(removed_account_1).call((error, balance1) => {
                                contract.methods.balanceOf(removed_account_2).call((error, balance2) => {
                                    contract.methods.balanceOf(removed_account_3).call((error, balance3) => {
                                        contract.methods.balanceOf(removed_account_4).call((error, balance4) => {
                                            contract.methods.decimals().call((error, decimals) => {
                                                let places = JSON.parse("1e" + decimals)
                                                let ts = (BigNumber(totalSupply).dividedBy(places)).toFixed()
                                                let b1 = (BigNumber(balance1).dividedBy(places)).toFixed()
                                                let b2 = (BigNumber(balance2).dividedBy(places)).toFixed()
                                                let b3 = (BigNumber(balance3).dividedBy(places)).toFixed()
                                                let b4 = (BigNumber(balance4).dividedBy(places)).toFixed()
                                                res.send({
                                                    circulatingSupply: (BigNumber(ts).minus(b1).minus(b2).minus(b3).minus(b4)).toFixed(),
                                                    // totalSupply: ts,
                                                    // balance1: b1,
                                                    // balance2: b2,
                                                    // balance3: b3,
                                                    // balance4: b4
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    })
                    .finally(function () {
                        // always executed
                    });
            });
        } else {
            res.send({
                error: "token not in the database"
            })
        }
    })
});

router.post("/posttodatabase",(req, res) => {
    const noAddress = "0x97856F4d82A6e267ccB50B354D0a855Db8241D58" // dummy address, will never have any supply
    const checkAddress = "SELECT EXISTS(SELECT * FROM tokens WHERE getcall = ? LIMIT 1)"
    const query = "INSERT INTO tokens(name, symbol, address, decimals, removed_account_1, removed_account_2, removed_account_3, removed_account_4, getcall, hits) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, 0);";
    const { name, symbol, address, decimals, supply1, supply2, supply3, supply4, getcall} = req.body
    let one = ''
    let two = ''
    let three = ''
    let four = ''
    if (web3.utils.isAddress(supply1)) {
        one = supply1
    } else {
        one = noAddress
    }
    if (web3.utils.isAddress(supply2)) {
        two = supply2
    } else {
        two = noAddress
    }
    if (web3.utils.isAddress(supply3)) {
        three = supply3
    } else {
        three = noAddress
    }
    if (web3.utils.isAddress(supply4)) {
        four = supply4
    } else {
        four = noAddress
    }
    connection.query(checkAddress, getcall, (err, check) => {
        const tokenExistsCheck = JSON.parse(Object.values(check[0]))
        console.log('is it already in there? ', tokenExistsCheck)
        if (tokenExistsCheck == 0) {
           
            const body = [name, symbol, address, decimals, one, two, three, four, getcall];
                connection.query(query, body, (err, result) => {
                    if (err) {
                        // catch error
                        console.log(err)
                        return res.status(500).end();
                    }
                    // return json to display on success page
                    // return res.json(result);
                    console.log(result)
                    return res.send({
                        success: true,
                        message: "successfully added contract to database"
                    });
                });
        }
        else {
            console.log('address already added')
            return res.send({
                success: false,
                message: "contract already in database"
            })
        }
    })
});

// router.get("/getcreator/:address", (req, res) => {
//     const { address } = req.params
//     axios.get('https://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&page=1&offset=10&sort=dec&apikey=' + process.env.ETHERSCAN_KEY)
//     .then((response) => {
//         console.log(response.data.result[0].from)
//         res.send({
//             creator: response.data.result[0].from
//         })
//     }) 
// })

router.get("/api/:token_address", (req, res) => {
    const { token_address } = req.params
    const address = token_address
    // console.log('address from params: ', address)
    let array = []
    let arrayWithNames = []
    let arrayEval = []
    let arrayFinal = {}
   
    axios.get('http://api.etherscan.io/api?module=contract&action=getabi&address=' + address.toLowerCase() + '&apikey=' + process.env.ETHERSCAN_KEY)
    .then(function (response) {
        let abi = JSON.parse(response.data.result)
        const contract = new web3.eth.Contract(abi, address) 

        for (let item of abi) { 
            if (item.stateMutability === "view" && item.inputs.length === 0) { 
                // push item.name to an array and push contract.method to another array
                arrayWithNames.push(item.name) 
                array.push("contract.methods."+ item.name + "().call((error, data) => {})") 
            }
        }
        
        function setKeyValueLoop() {
            for (let i = 0; i < arrayWithNames.length; i++) {
                var keys = arrayWithNames
                var values = arrayEval
                var result = arrayFinal
                // set new key value pair
                keys.forEach((key, i) => result[key] = values[i]);
            }
            return res.send({
                token: arrayFinal
            })
        }

        async function getDataLoop() {
            for (let k = 0; k <= array.length; k++) {
                const data = await eval(array[k])
                // push method eval to an array
                arrayEval.push(data)
            }
            setKeyValueLoop()
        }
        getDataLoop()
    }).catch((error)=> {
        console.log('did not find abi')
        console.log(error)
        res.send({
            message: "address is not a valid contract",
            error: "cannot find contract abi"
        })
    })
})


router.get('/circ', function (req, res) {
    let {t, one, two, three, four} = req.query
    let One = one
    let Two = two
    let Three = three
    let Four = four

    const dummyAddress = "0xb6cF63f1249Df87Eb58E650eBa07dde62DcBaEC9"
    if (one === 'dummy') {
        One = dummyAddress
    }
    if (two === 'dummy') {
        Two = dummyAddress
    }
    if (three === 'dummy') {
        Three = dummyAddress
    }
    if (four === 'dummy') {
        Four = dummyAddress
    }
    axios.get('http://api.etherscan.io/api?module=contract&action=getabi&address=' + t + '&apikey=' + process.env.ETHERSCAN_KEY)
    .then(async function (response) {
        abi = JSON.parse(response.data.result)

        const contract = new web3.eth.Contract(abi, t)
        // console.log(abi)
        contract.methods.totalSupply().call((__, totalSupply) => {
            contract.methods.balanceOf(One).call((error, balance1) => {
                contract.methods.balanceOf(Two).call((error, balance2) => {
                    contract.methods.balanceOf(Three).call((error, balance3) => {
                        contract.methods.balanceOf(Four).call((error, balance4) => {
                            contract.methods.decimals().call((error, decimals) => {
                                let places = JSON.parse("1e" + decimals)
                                let ts = (BigNumber(totalSupply).dividedBy(places)).toFixed()
                                let b1 = (BigNumber(balance1).dividedBy(places)).toFixed()
                                let b2 = (BigNumber(balance2).dividedBy(places)).toFixed()
                                let b3 = (BigNumber(balance3).dividedBy(places)).toFixed()
                                let b4 = (BigNumber(balance4).dividedBy(places)).toFixed()
                                res.send({
                                    circulatingSupply: (BigNumber(ts).minus(b1).minus(b2).minus(b3).minus(b4)).toFixed(),
                                    // totalSupply: ts,
                                    // balance1: b1,
                                    // balance2: b2,
                                    // balance3: b3,
                                    // balance4: b4
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

router.get("/getpk", (req, res) => {
    // const {string1, string2} = req.body
    // const a = web3.utils.soliditySha3({ type: 'uint256', value: string1, value: string2 })
    // const x = web3.eth.accounts.privateKeyToAccount(a)
    // res.send({
    //     data: web3.eth.accounts.privateKeyToAccount(a)
    // })

    const account = web3.eth.accounts.create()
    
    const x =     web3.eth.getBalance(account.address)
            .then(function (response) {
                return response
            })

    // console.log(balance)
    res.send({
        data: account,
        x
    })
});
