var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

function init()
{
    load_town_reward_data();
}
exports.init=init;

var TownRewardData=function()
{
    this.id=0;
    this.total_reward=0;
    this.reward_one=0;
    this.reward_two=0;
    this.reward_three=0;
    this.reward_four=0;
    this.lucky_base=0;
    this.lucky_float=0;
    this.town_cycle=0;
    this.reward_time=0;
};


var town_reward_data_list={};
exports.town_reward_data_list=town_reward_data_list;


function load_town_reward_data()
{
    global.log("load_town_reward_data");
    var file="town_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["TOWN_REWARD"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var town_reward_data=new TownRewardData();
        town_reward_data.id=data["TOWN_REWARD"][i].Id;
        town_reward_data.total_reward=Number(data["TOWN_REWARD"][i].TotalReward);
        town_reward_data.reward_one=Number(data["TOWN_REWARD"][i].RewardOne);
        town_reward_data.reward_two=Number(data["TOWN_REWARD"][i].RewardTwo);
        town_reward_data.reward_three=Number(data["TOWN_REWARD"][i].RewardThree);
        town_reward_data.reward_four=Number(data["TOWN_REWARD"][i].RewardFour);
        town_reward_data.lucky_base=Number(data["TOWN_REWARD"][i].LuckyBase);
        town_reward_data.lucky_float=Number(data["TOWN_REWARD"][i].LuckFloat);
        town_reward_data.town_cycle=Number(data["TOWN_REWARD"][i].TownCycle);
        town_reward_data.reward_time=Number(data["TOWN_REWARD"][i].RewardTime);

        town_reward_data_list[town_reward_data.id]=town_reward_data;
    }

    var log_content={"count":count,"town_reward_data_list":town_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_town_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}















