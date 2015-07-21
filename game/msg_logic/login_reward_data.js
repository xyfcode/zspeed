var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var LoginRewardData=function()
{
    this.id=0;
    this.reward_arr=[]; //value:RewardData
};

var login_reward_data_list={}; //
exports.login_reward_data_list=login_reward_data_list;


var RewardData=function()
{
    this.type=0;
    this.id=0;
    this.num=0;
};


function init()
{
    load_login_reward_data();
}
exports.init=init;

function load_login_reward_data()
{
    global.log("load_login_reward_data");
    var file="login_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["LOGIN_REWARD"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var lg_reward_data=new LoginRewardData();

        lg_reward_data.id=data["LOGIN_REWARD"][i].Id;

        if(Number(data["LOGIN_REWARD"][i].Num1)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["LOGIN_REWARD"][i].Xid1;
            reward_data.num=Number(data["LOGIN_REWARD"][i].Num1);
            reward_data.type=Number(data["LOGIN_REWARD"][i].Type1);
            lg_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            lg_reward_data.reward_arr.push(0);
        }

        if(Number(data["LOGIN_REWARD"][i].Num2)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["LOGIN_REWARD"][i].Xid2;
            reward_data.num=Number(data["LOGIN_REWARD"][i].Num2);
            reward_data.type=Number(data["LOGIN_REWARD"][i].Type2);
            lg_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            lg_reward_data.reward_arr.push(0);
        }

        if(Number(data["LOGIN_REWARD"][i].Num3)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["LOGIN_REWARD"][i].Xid3;
            reward_data.num=Number(data["LOGIN_REWARD"][i].Num3);
            reward_data.type=Number(data["LOGIN_REWARD"][i].Type3);
            lg_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            lg_reward_data.reward_arr.push(0);
        }

        login_reward_data_list[lg_reward_data.id]=lg_reward_data;
    }

    var log_content={"count":count,"login_reward_data_list":login_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_activity_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
