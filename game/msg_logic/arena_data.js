var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var define_code=require("./define_code");
var const_value=define_code.const_value;
var g_server=null;


var RewardData=function()
{
    this.id=0;
    this.num=0;
    this.type=0;
};

//普通奖励结构
var RankRewardData=function()
{
    this.id=0;
    this.damage_record=0;
    this.reward_array=[]; //value:RewardData
};

//排行榜普通奖励
var rank_reward_data_list={};
exports.rank_reward_data_list=rank_reward_data_list;

//定时奖励结构
var RankTimeRewardData=function()
{
    this.id=0;
    this.rand_low_limit=0;
    this.rand_high_limit=0;
    this.reward=new RewardData();
};

//排行榜定时奖励
var rank_time_reward_data_list={};
exports.rank_time_reward_data_list=rank_time_reward_data_list;


function init(s)
{
    g_server=s;
    load_rank_reward_data();
    load_rank_time_reward_data();
}
exports.init=init;


function load_rank_reward_data()
{
    global.log("load_rank_reward_data");
    var file="rank_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["RANK_REWARD"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var rank_reward_data=new RankRewardData();

        rank_reward_data.id=data["RANK_REWARD"][i].Id;
        rank_reward_data.damage_record=Number(data["RANK_REWARD"][i].DamageRecord);

        if(data["RANK_REWARD"][i].Reward1)
        {
            var rewards=(data["RANK_REWARD"][i].Reward1).split(',');
            var reward_data=new RewardData();
            reward_data.type=Number(rewards[0]);
            reward_data.id=rewards[1];
            reward_data.num=Number(rewards[2]);

            rank_reward_data.reward_array.push(reward_data);
        }

        if(data["RANK_REWARD"][i].Reward2)
        {
            var rewards=(data["RANK_REWARD"][i].Reward2).split(',');
            var reward_data=new RewardData();
            reward_data.type=Number(rewards[0]);
            reward_data.id=rewards[1];
            reward_data.num=Number(rewards[2]);

            rank_reward_data.reward_array.push(reward_data);
        }

        if(data["RANK_REWARD"][i].Reward3)
        {
            var rewards=(data["RANK_REWARD"][i].Reward3).split(',');
            var reward_data=new RewardData();
            reward_data.type=Number(rewards[0]);
            reward_data.id=rewards[1];
            reward_data.num=Number(rewards[2]);

            rank_reward_data.reward_array.push(reward_data);
        }

        rank_reward_data_list[rank_reward_data.id]=rank_reward_data;
    }

    var log_content={"count":count,"rank_reward_data_list":rank_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_rank_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

function load_rank_time_reward_data()
{
    global.log("load_rank_time_reward_data");
    var file="rank_time_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["RANK_TIME_REWARD"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var rank_time_reward_data=new RankTimeRewardData();

        rank_time_reward_data.id=data["RANK_TIME_REWARD"][i].Id;
        rank_time_reward_data.rand_low_limit=Number(data["RANK_TIME_REWARD"][i].RandLowLimit);
        rank_time_reward_data.rand_high_limit=Number(data["RANK_TIME_REWARD"][i].RandHighLimit);
        if(data["RANK_TIME_REWARD"][i].Reward)
        {
            var reward_arr=(data["RANK_TIME_REWARD"][i].Reward).split(",");
            rank_time_reward_data.reward.type=Number(reward_arr[0]);
            rank_time_reward_data.reward.id=reward_arr[1];
            rank_time_reward_data.reward.num=Number(reward_arr[2]);
        }

        rank_time_reward_data_list[rank_time_reward_data.id]=rank_time_reward_data;
    }

    var log_content={"count":count,"rank_time_reward_data_list":rank_time_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_rank_time_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}












