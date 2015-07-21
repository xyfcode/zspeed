var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var RechargeRewardData=function()
{
    this.id=0;
    this.item_type=0;
    this.item_id=0;
    this.item_num=0;
};

var recharge_reward_data_list={};
exports.recharge_reward_data_list=recharge_reward_data_list;

function init()
{
    load_recharge_reward_data();
}
exports.init=init;

function load_recharge_reward_data()
{
    global.log("load_recharge_reward_data");
    var file="recharge_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["RECHARGE_REWARD"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var recharge_reward_data=new RechargeRewardData();

        recharge_reward_data.id=data["RECHARGE_REWARD"][i].Id;
        recharge_reward_data.item_type=Number(data["RECHARGE_REWARD"][i].ItemType);
        recharge_reward_data.item_id=data["RECHARGE_REWARD"][i].ItemId;
        recharge_reward_data.item_num=Number(data["RECHARGE_REWARD"][i].ItemNum);

        recharge_reward_data_list[recharge_reward_data.id]=recharge_reward_data;
    }

    var log_content={"count":count,"recharge_reward_data_list":recharge_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_recharge_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
