var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

//参拜
var SacrificeData=function()
{
    this.id=0;
    this.next_id=0;
    this.times=0;
    this.gold=0;
    this.drop_id=0;
};

var sacrifice_data_list={};
exports.sacrifice_data_list=sacrifice_data_list;

//兑换
var ExchangeData=function()
{
    this.id=0;
    this.item_type=0;
    this.item_id=0;
    this.num=0;
    this.cost=0;
};

var exchange_data_list={};
exports.exchange_data_list=exchange_data_list;


var ExchangeWData=function()
{
    this.id=0;
    this.weight=0;
};
var exchange_data_arr=[];
exports.exchange_data_arr=exchange_data_arr;

var g_server=null;

function init(s)
{
    g_server=s;
    load_sacrifice_data();
    load_exchange_data();
}
exports.init=init;

function load_sacrifice_data()
{
    global.log("load_sacrifice_data");
    var file="sacrifice.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["SACRIFICE"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var sacrifice_data=new SacrificeData();

        sacrifice_data.id= data["SACRIFICE"][i].Id;
        sacrifice_data.next_id=data["SACRIFICE"][i].NextId;
        sacrifice_data.times=Number(data["SACRIFICE"][i].Times);
        sacrifice_data.gold=Number(data["SACRIFICE"][i].Gold);
        sacrifice_data.drop_id=data["SACRIFICE"][i].DropId;

        sacrifice_data_list[sacrifice_data.id] = sacrifice_data;
    }

    var log_content={"count":count,"sacrifice_data_list":sacrifice_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_sacrifice_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

function load_exchange_data()
{
    global.log("load_exchange_data");
    var file="exchange.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["EXCHANGE"]);
    var count=ks.length;

    var weight=0;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var exchange_data=new ExchangeData();
        var exchange_w_data=new ExchangeWData();

        exchange_data.id= data["EXCHANGE"][i].Id;
        exchange_data.item_type=Number(data["EXCHANGE"][i].ItemType);
        exchange_data.item_id=data["EXCHANGE"][i].ItemId;
        exchange_data.num=Number(data["EXCHANGE"][i].Num);
        exchange_data.cost=Number(data["EXCHANGE"][i].Cost);
        weight+=Number(data["EXCHANGE"][i].Weight);

        exchange_data_list[exchange_data.id] = exchange_data;

        exchange_w_data.id=exchange_data.id;
        exchange_w_data.weight=weight;
        exchange_data_arr.push(exchange_w_data);
    }

    if(weight!=10000)
    {
        global.err("weight!=10000");
        return;
    }

    var log_content={"count":count,"exchange_data_list":exchange_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_exchange_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}