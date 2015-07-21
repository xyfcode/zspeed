var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var BattleData=function()
{
    this.battle_id=0;
    this.type=0;
    this.gate=[];
    this.lv_limit=[];
    this.count_limit=[];
};

var battle_field_data_list={};
exports.battle_field_data_list=battle_field_data_list;

function init()
{
    load_battle_field_data();
}
exports.init=init;

function load_battle_field_data()
{
    global.log("load_battle_field_data");
    var file="battle_field.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["BATTLE_FIELD"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var battle_data=new BattleData();

        battle_data.battle_id=data["BATTLE_FIELD"][i].BattleId;
        battle_data.type=Number(data["BATTLE_FIELD"][i].Type);
        battle_data.gate=(data["BATTLE_FIELD"][i].Gate).split(",");
        battle_data.lv_limit=(data["BATTLE_FIELD"][i].LvLimited).split(",");
        battle_data.count_limit=(data["BATTLE_FIELD"][i].CountLimited).split(",");

        battle_field_data_list[battle_data.battle_id]=battle_data;
    }

    var log_content={"count":count,"battle_field_data_list":battle_field_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_battle_field_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
