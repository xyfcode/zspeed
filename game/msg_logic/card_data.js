var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var CardData=function()
{
    this.card_id=0;
    this.race=0;
    this.star=0;
    this.level=0;
    this.level_limit=0;
    this.reborn_limit=0;
    this.leader_skill=0;
    this.equip_list=[];
    this.exp=0;
    this.exp_param=0;
    this.money=0;
    this.money_add=0;
    this.card_score=0;
};


var card_data_list={};
exports.card_data_list=card_data_list;


var BeautyData=function()
{
    this.beauty_id=0;
    this.star=0;
    this.gift_gold=0;
};


var beauty_data_list={};
exports.beauty_data_list=beauty_data_list;


function init()
{
    load_card_data();
    load_beauty_data();
}
exports.init=init;

function load_card_data()
{
    global.log("load_card_data");
    var file="card.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["CARD"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var card_data=new CardData();

        card_data.card_id=data["CARD"][i].CardId;
        card_data.race=Number(data["CARD"][i].Race);
        card_data.star=Number(data["CARD"][i].Star);
        card_data.level=Number(data["CARD"][i].Level);
        card_data.level_limit=Number(data["CARD"][i].LevelLimit);
        card_data.reborn_limit=Number(data["CARD"][i].RebornLimit);
        card_data.leader_skill=data["CARD"][i].LeaderSkill;
        if(data["CARD"][i].EquipListReborn)
        {
            card_data.equip_list=(data["CARD"][i].EquipListReborn).split(',');
        }

        card_data.money=Number(data["CARD"][i].Coin);
        card_data.money_add=Number(data["CARD"][i].CoinGrowth);

        card_data.exp=Number(data["CARD"][i].Exp);
        card_data.exp_param=Number(data["CARD"][i].ExpParameters);
        card_data.card_score=Number(data["CARD"][i].WarriorScore);

        card_data_list[card_data.card_id]=card_data;
    }

    var log_content={"count":count,"card_data_list":card_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_card_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}


function load_beauty_data()
{
    global.log("load_beauty_data");
    var file="beauty.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["BEAUTY"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var beauty_data=new BeautyData();

        beauty_data.beauty_id=data["BEAUTY"][i].BeautyId;
        beauty_data.star=Number(data["BEAUTY"][i].Star);
        beauty_data.gift_gold=Number(data["BEAUTY"][i].GiftCoin);


        beauty_data_list[beauty_data.beauty_id]=beauty_data;
    }

    var log_content={"count":count,"beauty_data_list":beauty_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_beauty_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}