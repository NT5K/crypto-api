
let Decimals = 0
let account;

// $(".new-name").on("submit", (event) => {
//     event.preventDefault();
//     var newName = {
//         address: $("#wallet-address").val().trim(),
//         name: $("#wallet-name").val().trim()
//     };
//     console.log(newName)
//     $.ajax("/add", {
//         type: "POST",
//         data: newName,
//         success: (response) => {
//             const { message } = response
//             // if(response.success) {
//             console.log(message)
//             document.getElementById("response_from_post_name").innerHTML = message
//             // }
//         }
//     })
// })

$("input#query-name").on({
    keydown: function (e) {
        if (e.which === 32)
            return false;
    },
    change: function () {
        this.value = this.value.replace(/\s/g, "");
    }
});

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
        supply4: $("#subtract_supply_from_4").val().trim(),
        getcall: $("#query-name").val().trim(),
    };
    $.ajax("/posttodatabase", {
        type: "POST",
        data: newToken,
        success: (response) => {
            const { message } = response
            // if(response.success) {
            console.log(message)
            document.getElementById("response_from_post").innerHTML = message
        }
    })
})

$(".getData").on('submit', (event) => {
    event.preventDefault();
    let address = $("#addressfor").val().trim()

    $.ajax("/contract_abi/" + address, {
        type: "GET",
        success: (response) => {
            const { address, name, symbol, decimals, totalSupply } = response
            Decimals = decimals
            // console.log('creator account: ', owner.creator)
            // console.log('active account: ', account)
            document.getElementById("address").value = address
            document.getElementById("name").value = name
            document.getElementById("symbol").value = symbol
            document.getElementById("decimals").value = decimals
            document.getElementById("totalSupply").value = (BigNumber(totalSupply).dividedBy(JSON.parse("1e" + Decimals))).toFixed()
        }
    }).then(() => {
        console.log('successfully retrieved contract information from abi')
    });
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






