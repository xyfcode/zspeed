var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var AchievementData=function()
{
    this.id=0;
    this.type=0;
    this.is_show=0;
    this.pre_achievement=0;
    this.next_achievement=0;
    this.times=0;
    this.int_param=0;
    this.s_param1=0;
    this.s_param2=0;
    this.reward_arr=[]; //value:RewardData

};

var achievement_data_list={};
exports.achievement_data_list=achievement_data_list;

var RewardData=function()
{
    this.type=0;
    this.id=0;
    this.num=0;
}

var g_server=null;

function init(s)
{
    g_server=s;
    load_achievement_data();
}
exports.init=init;

function load_achievement_data()
{
    global.log("load_achievement_data");
    var file="achievement.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["ACHIEVEMENT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var achievement_data=new AchievementData();

        achievement_data.id=data["ACHIEVEMENT"][i].Id;
        achievement_data.type=Number(data["ACHIEVEMENT"][i].Type);
        achievement_data.is_show=Number(data["ACHIEVEMENT"][i].IsShow);
        achievement_data.pre_achievement=data["ACHIEVEMENT"][i].PreAchievement;
        achievement_data.next_achievement=data["ACHIEVEMENT"][i].NextAchievement;
        achievement_data.times=Number(data["ACHIEVEMENT"][i].Times);
        achievement_data.int_param=Number(data["ACHIEVEMENT"][i].IntParam);
        achievement_data.s_param1=data["ACHIEVEMENT"][i].SParam1;
        achievement_data.s_param2=data["ACHIEVEMENT"][i].SParam2;

        if(Number(data["ACHIEVEMENT"][i].RewardNum1)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["ACHIEVEMENT"][i].RewardId1;
            reward_data.num=Number(data["ACHIEVEMENT"][i].RewardNum1);
            reward_data.type=Number(data["ACHIEVEMENT"][i].RewardType1);
            achievement_data.reward_arr.push(reward_data);
        }

        if(Number(data["ACHIEVEMENT"][i].RewardNum2)>=1)
        {
            var reward_data=new RewardData();
            reward_data.id=data["ACHIEVEMENT"][i].RewardId2;
            reward_data.num=Number(data["ACHIEVEMENT"][i].RewardNum2);
            reward_data.type=Number(data["ACHIEVEMENT"][i].RewardType2);
            achievement_data.reward_arr.push(reward_data);
        }

        achievement_data_list[achievement_data.id]=achievement_data;
    }

    var log_content={"count":count,"achievement_data_list":achievement_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_achievement_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
