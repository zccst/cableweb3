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
        // $(document).on('click', '#getPrice', App.handleGetPrice);
        $(document).on('click', '#getTaskIdentifier', App.handleGetTask);
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

        App.requestView.addTask(priceType,dataSource,period,rewardToken,rewardAmount,rewardRatio,{from: App.account}).then(function () {
            // location.reload();
        });
    },

    // //获取价格
    // handleGetPrice: function() {
    //
    //     var priceType = $('#getType').val();
    //     var dataSource = $('#getSource').val();
    //     console.log(priceType);
    //     console.log(dataSource);
    //
    //     App.requestView.getPrice(priceType,dataSource).then(function (data) {
    //         console.log(data[0]);
    //         $('#getValue').html(data[0].toString());
    //     });
    // },

    // 查询任务
    handleGetTask: function () {

        var totalNum = 9;

        var arr = new Array();
        for (var i = 0; i < totalNum; i++) {
            (function (innerNum) {
                App.requestView.getTaskIdentifier(innerNum).then(function (data) {
                    data['index'] = innerNum;
                    arr.push(data);
                    var priceType = data[0];
                    var dataSource = data[1];
                    let innerHandler = setInterval(function () {
                        if ($('#tasksView').html()) {
                            App.requestView.getTaskRewardAmount(priceType,dataSource).then(function (amount) {
                                console.log(innerNum, priceType, dataSource, 'amount', amount)
                                $(".tasklist-" + innerNum).find(".amount").html(amount.toString() / 1000000);
                            });
                            App.requestView.getTaskRewardToken(priceType,dataSource).then(function (rewardToken) {
                                console.log(innerNum, priceType, dataSource, 'rewardToken', rewardToken)
                                $(".tasklist-" + innerNum).find(".rewardToken").html(rewardToken);
                            });
                            App.requestView.getTaskRewardRatio(priceType,dataSource).then(function (rewardRatio) {
                                console.log(innerNum, priceType, dataSource, 'rewardRatio', rewardRatio)
                                $(".tasklist-" + innerNum).find(".rewardRatio").html(rewardRatio.toString() / 1000000);
                            });
                            clearInterval(innerHandler)
                        }
                    }, 1000)


                });
            })(i)
        }

        let handler = setInterval(function () {
            if (arr.length == totalNum) {
                clearInterval(handler)
                arr.sort(function (a, b) { return a.index - b.index;})
                App.getPriceData(arr);
            }
        }, 1000)
    },

    getPriceData: function (arr) {
        // 最终需要的结果
        console.log(arr);
        var arrTemp = new Array();
        var identifierArr = [];
        for (var i = 0; i < arr.length; i++) {
            identifierArr.push('<div style="margin-bottom: 4px;" class="tasklist-' + i + '"><span>'+ arr[i][0] +'</span>在OKEx上的价格，奖励金额：<span class="amount"></span>，奖励代币：<span class="rewardToken"></span>，分配比例：<span class="rewardRatio"></span><br/></div>');

            // (function (innerNum) {
            //     var priceType = arr[innerNum][0];
            //     var dataSource = arr[innerNum][1];
            //
            //     var amountGet = 0;
            //     var rewardTokenGet = "";
            //     var rewardRationGet = 0;
            //
            //     App.requestView.getTaskRewardAmount(priceType,dataSource).then(function (amount) {
            //         amountGet = amount;
            //     });
            //     App.requestView.getTaskRewardToken(priceType,dataSource).then(function (rewardToken) {
            //         rewardTokenGet = rewardToken;
            //     });
            //     App.requestView.getTaskRewardRatio(priceType,dataSource).then(function (rewardRatio) {
            //         rewardRationGet = rewardRatio;
            //     });
            //     identifierArr.push('<div><span>' + priceType + '</span>在OKEx上的价格：' + '，奖励金额：' + amountGet + '，奖励代币：' + rewardTokenGet + '，分配比例：' + rewardRationGet + '</div>')
            // })(i)
        }
        $('#tasksView').html(identifierArr.join(''));

    }
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

// $(function () {
//     var
// })
