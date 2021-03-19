let BN = require('bignumber.js');

var coinOne = new BN("1000000000000000000");
var coinOneHundred = new BN("100000000000000000000");

App = {
    account: null,
    web3Provider: null,
    contracts: {},
    requestView: null,
    cable:null,
    RequestViewAddress:"0x8683ca7bb1A0ca6Cf03c666eBf1Fa8E42d5bAe59",
    CableAddress:"0x179c87745f7Dc8ADe197326f24f64D4168D2e98D",
    PriceCumulateDataAddress:"0xDAcA5CF9B1745b0573fdfd09AB5C7b3A1DF14C46",

    init: async function() {


        return await App.initWeb3();
    },

    initWeb3: async function() {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);


        //显示当前钱包地址
        App.account = window.ethereum.selectedAddress;
        $("#wallet").html(App.account);

        return App.initContract();
    },

    initContract: function() {
        //实例化合约
        $.getJSON('RequesterView.json', function(data) {
            var RequesterViewArtifact = data;
            var rv = TruffleContract(RequesterViewArtifact);
            rv.setProvider(App.web3Provider);
            rv.at(App.RequestViewAddress).then(function (instance) {
                console.log("instance", instance);
                App.requestView = instance;
            });
        });
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#setOracle', App.handleSetOracle);
        $(document).on('click', '#setAllowance', App.handleSetAllowance);
        $(document).on('click', '#closeAllowance', App.handleCloseAllowance);
        $(document).on('click', '#TaskAdd', App.handleAddTask);
        $(document).on('click', '#getTaskIdentifier', App.handleIdGetTask);
    },

    // 设置预言机
    handleSetOracle: function(event) {
        event.preventDefault();

        var address = $('#orAddress').val();
        App.requestView.setOracle(address.toString(),{from: App.account}).then(function () {
        });
    },

    // 授权
    handleSetAllowance: function(event) {
        event.preventDefault();

        var tokenAddress = $('#tAddress').val();
        var oracleAddress = $('#oAddress').val();
        App.requestView.setAllowance(tokenAddress,oracleAddress,{from: App.account}).then(function () {
        });
    },

    //撤销
    handleCloseAllowance: function(event) {
        event.preventDefault();

        var tokenAddress = $('#tAddress').val();
        var oracleAddress = $('#oAddress').val();
        App.requestView.closeAllowance(tokenAddress,oracleAddress,{from: App.account}).then(function () {
        });
    },

    //发布任务
    handleAddTask: function(event) {
        event.preventDefault();

        var priceType = $('#price').val();
        var dataSource = $('#source').val();
        var period = $('#period').val();
        var rewardToken = $('#token').val();
        var rewardAmount = $('#amount').val();
        var rewardRatio = $('#ratio').val();
        //抵押挖矿
        App.requestView.addTask(priceType,dataSource,period,rewardToken,rewardAmount,rewardRatio,{from: App.account}).then(function () {
            // location.reload();
        });
    },

    // 通过id查任务
    handleIdGetTask: function () {


        var inNum = 0;
        // var Identifier = "";

        // for (var i=0; i<10; i++){
        //     App.requestView.getTaskIdentifier(i).then(function (data){
        //         var priceType = data[0];
        //         var dataSource = data[1];
        //         $('#type').html(priceType);
        //         App.requestView.getTaskRewardAmount(priceType,dataSource).then(function (amount) {
        //             $('#amountReward').html(amount.toString());
        //         });
        //         c
        //         App.requestView.getTaskRewardToken(priceType,dataSource).then(function (rewardToken) {
        //             $('#tokenReward').html(rewardToken);
        //         });
        //         App.requestView.getTaskRewardRatio(priceType,dataSource).then(function (rewardRatio) {
        //             $('#ratioReward').html(rewardRatio.toString());
        //         });
        //     });
        // };

        // App.requestView.getTaskIdentifier(inNum).then(function (data){
        //     all.push(data);
        //     while (data != null) {
        //         var priceType = data[0];
        //         var dataSource = data[1];
        //         $('#type').html(priceType);
        //         App.requestView.getTaskRewardAmount(priceType,dataSource).then(function (amount) {
        //             $('#amountReward').html(amount.toString());
        //         });
        //         App.requestView.getTaskRewardToken(priceType,dataSource).then(function (rewardToken) {
        //             $('#tokenReward').html(rewardToken);
        //         });
        //         App.requestView.getTaskRewardRatio(priceType,dataSource).then(function (rewardRatio) {
        //             $('#ratioReward').html(rewardRatio.toString());
        //         });
        //         inNum = inNum + 1;
        //         console.log(inNum);
        //
        //         App.requestView.getTaskIdentifier(inNum).then(function (data){
        //             Identifier = data.toString();
        //             all.push(Identifier);
        //             console.log(all);
        //         });
        //     }
        // });


        // App.requestView.getTaskIdentifier(inNum).then(function (data) {
        //     console.log(data);
        //     var Identifier = data.toString();
        //     var departPoint = Identifier.indexOf(",");
        //     var priceType = data.toString().substr(0,departPoint);
        //     var dataSource = data.toString().substr(departPoint+1,data.toString().length-departPoint);
        //     $('#type').html(priceType);
        //     App.requestView.getTaskRewardAmount(priceType,dataSource).then(function (amount) {
        //         $('#amountReward').html(amount.toString());
        //     });
        //     App.requestView.getTaskRewardToken(priceType,dataSource).then(function (rewardToken) {
        //         $('#tokenReward').html(rewardToken);
        //     });
        //     App.requestView.getTaskRewardRatio(priceType,dataSource).then(function (rewardRatio) {
        //         $('#ratioReward').html(rewardRatio.toString());
        //     });
        // });

        var arr = new Array();
        var temp = App.requestView.getTaskIdentifier(inNum).then(function (data) {
            arr.push(data);
        });
        console.log(temp);
        console.log(arr);
    },
};

$(function() {
    $(window).load(function() {
        //metamask账户改变
        ethereum.on('accountsChanged', function (accounts) {
            App.account = accounts[0];
            $("#wallet").html(accounts[0]);
        });
        App.init();
    });
});
