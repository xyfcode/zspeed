var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

function init()
{
    load_t_reward_data();
}
exports.init=init;

var TRewardData=function()
{
    this.id=0;
    this.reward_first=0;
    this.reward_second=0;
    this.reward_third=0;
    this.reward_tai_shou=0;
    this.reward_shou_bei=0;
};


var t_reward_data_list={};
exports.t_reward_data_list=t_reward_data_list;


function load_t_reward_data()
{
    global.log("load_t_reward_data");
    var file="town_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["TOWN_REWARD"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var town_reward_data=new TRewardData();
        town_reward_data.id=data["TOWN_REWARD"][i].Id;
        town_reward_data.reward_first=Number(data["TOWN_REWARD"][i].RewardFirst);
        town_reward_data.reward_second=Number(data["TOWN_REWARD"][i].RewardSecond);
        town_reward_data.reward_third=Number(data["TOWN_REWARD"][i].RewardThird);
        town_reward_data.reward_tai_shou=Number(data["TOWN_REWARD"][i].RewardTaiShou);
        town_reward_data.reward_shou_bei=Number(data["TOWN_REWARD"][i].RewardForShoubei);

        t_reward_data_list[town_reward_data.id]=town_reward_data;
    }

    var log_content={"count":count,"t_reward_data_list":t_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_t_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}















