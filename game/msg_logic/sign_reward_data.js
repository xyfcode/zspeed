var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var SignRewardData=function()
{
    this.id=0;
    this.rmb=0;
    this.gold=0;
    this.exp=0;
    this.reward_arr=[]; //value:RewardData
};

var sign_reward_data_list={}; //
exports.sign_reward_data_list=sign_reward_data_list;


var RewardData=function()
{
    this.type=0;
    this.id=0;
    this.num=0;
};

var g_server=null;

function init(s)
{
    g_server=s;
    load_sign_reward_data();
}
exports.init=init;

function load_sign_reward_data()
{
    global.log("load_sign_reward_data");
    var file="sign_reward.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["SIGN_REWARD"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var si_reward_data=new SignRewardData();

        si_reward_data.id=data["SIGN_REWARD"][i].Id;
        si_reward_data.rmb=Number(data["SIGN_REWARD"][i].Rmb);
        si_reward_data.gold=Number(data["SIGN_REWARD"][i].Gold);
        si_reward_data.exp=Number(data["SIGN_REWARD"][i].Exp);

        if(Number(data["SIGN_REWARD"][i].Num1)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["SIGN_REWARD"][i].Xid1;
            reward_data.num=Number(data["SIGN_REWARD"][i].Num1);
            reward_data.type=Number(data["SIGN_REWARD"][i].Type1);
            si_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            si_reward_data.reward_arr.push(0);
        }

        if(Number(data["SIGN_REWARD"][i].Num2)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["SIGN_REWARD"][i].Xid2;
            reward_data.num=Number(data["SIGN_REWARD"][i].Num2);
            reward_data.type=Number(data["SIGN_REWARD"][i].Type2);
            si_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            si_reward_data.reward_arr.push(0);
        }

        if(Number(data["SIGN_REWARD"][i].Num3)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["SIGN_REWARD"][i].Xid3;
            reward_data.num=Number(data["SIGN_REWARD"][i].Num3);
            reward_data.type=Number(data["SIGN_REWARD"][i].Type3);
            si_reward_data.reward_arr.push(reward_data);
        }
        else
        {
            si_reward_data.reward_arr.push(0);
        }

        sign_reward_data_list[si_reward_data.id]=si_reward_data;
    }

    var log_content={"count":count,"sign_reward_data_list":sign_reward_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_sign_reward_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
