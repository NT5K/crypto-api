
let Decimals = 0
let account;

// web3 provider with fallback for old version
if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
        // ask user for permission
        ethereum.enable()
        // user approved permission
    } catch (error) {
        // user rejected permission
        console.log('user rejected permission')
    }
}
else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
    // no need to ask for permission
}
else {
    window.alert('No ethereum client detected. Try MetaMask!')
}
console.log(window.web3.currentProvider)

ethereum.autoRefreshOnNetworkChange = false;

web3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
        alert("Error retrieving accounts.");
        return;
    }
    if (accounts.length == 0) {
        alert("No account found! Make sure the Ethereum client is configured properly.");
        return;
    }
    account = accounts[0];
    console.log('Account: ' + account);
    web3.eth.defaultAccount = account;
    document.getElementById('my_wallet').innerHTML = "Account: " +account
});

window.ethereum.on('accountsChanged', function (user) {
    let select = window.web3.currentProvider.selectedAddress
    account = user
    document.getElementById('my_wallet').innerHTML = "<p style='color:red;'>Metamask account has changed. Please refresh the page</p>"
    // selectedAddress = ethereum.selectedAddress
    console.log(account)
})

$(".new-token").on("submit", (event) => {
    // preventDefault on a submit event.
    event.preventDefault();

    // data
    var newToken = {
        name: $("#name").val().trim(),
        symbol: $("#symbol").val().trim(),
        address: $("#address").val().trim(),
        decimals: $("#decimals").val().trim(),
        supply1: $("#subtract_supply_from_1").val().trim(),
        supply2: $("#subtract_supply_from_2").val().trim(),
        supply3: $("#subtract_supply_from_3").val().trim(),
        supply4: $("#subtract_supply_from_4").val().trim()
    };

    const contractAddress = $("#address").val().trim()

    $.ajax("/getcreator/" + contractAddress, {
        type: "GET",
        success: (response) => {
            const { creator } = response
            // console.log('type of creator ',typeof(creator), "creator address ", creator)
            // console.log('type of account ',typeof(account), 'current account address', account.toLowerCase())
            if (creator === account.toLowerCase()) {
                $.ajax("/posttodatabase", {
                    type: "POST",
                    data: newToken,
                    success: (response) => {
                        const { message } = response
                        // if(response.success) {
                        console.log(message)
                        document.getElementById("response_from_post").innerHTML = message
                        // }
                    }
                })
            } else {
                // console.log("not the owner of contract")
                document.getElementById("response_from_post").innerHTML = "not the owner of this contract"
            }
        }
    })
});


$(".getData").on('submit', (event) => {
    event.preventDefault();
    let address = $("#addressfor").val().trim()

    $.ajax("/getcreator/" + address, {
        type: "GET",
        success: (owner) => {
            $.ajax("/contract_abi/" + address, {
                type: "GET",
                success: (response) => {
                    const { address, name, symbol, decimals, totalSupply } = response
                    Decimals = decimals
                    console.log('creator account: ', owner.creator)
                    console.log('active account: ', account)
                    document.getElementById("address").value = address
                    document.getElementById("name").value = name
                    document.getElementById("symbol").value = symbol
                    document.getElementById("decimals").value = decimals
                    if (owner.creator == account.toLowerCase()) {
                        document.getElementById("owner").style.color = "green";
                        document.getElementById("owner").value = owner.creator
                    } else if (owner.creator != account.toLowerCase()) {
                        document.getElementById("owner").style.color = "red";
                        document.getElementById("owner").value = owner.creator
                    }

                    document.getElementById("totalSupply").value = (BigNumber(totalSupply).dividedBy(JSON.parse("1e" + Decimals))).toFixed()
                }
            }).then(() => {
                console.log('successfully retrieved contract information from abi')
            });
        }
    })
})

const getSupplyFrom = (walletId, balanceId) => {
    // console.log('walletID: ',typeof(walletId), 'balanceId',typeof(balanceId))
    let wallet = document.getElementById(walletId).value
    let address = document.getElementById("addressfor").value

    $.ajax('/balance_of_user/' + wallet + "/" + address, {
        type: "GET",
        success: (response) => {
            const { balance } = response
            // console.log(balance)
            document.getElementById(balanceId).value = (BigNumber(balance).dividedBy(JSON.parse("1e" + Decimals))).toFixed()
        }
    }).then(() => {
        console.log('successfully received balance of wallet')
        calculateCirculatingSupply()
    });
} 

const calculateCirculatingSupply = () => {
    let totalSupply = $("#totalSupply").val()
    let supply1 = $("#wallet_supply_1").val()
    let supply2 = $("#wallet_supply_2").val()
    let supply3 = $("#wallet_supply_3").val()
    let supply4 = $("#wallet_supply_4").val()
    document.getElementById("estimated_circulating").value = BigNumber(totalSupply).minus(supply1).minus(supply2).minus(supply3).minus(supply4)
    document.getElementById("estimated_removed").value = BigNumber(supply1).plus(supply2).plus(supply3).plus(supply4)
}






