var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var const_value =require("./constant_data").const_value;

var ExploreEventData=function()
{
    this.event_id=0;
    this.event_type=0;
    this.reward=[]; //value RewardData
    this.cost_type=0;
    this.cost_num=0;
    this.proba_assemble=[];
    this.score=0;
};

var RewardData=function()
{
    this.type=0;
    this.id=0;
    this.num=0;
};

var explore_event_data_list={};
exports.explore_event_data_list=explore_event_data_list;


var g_server=null;

function init(s)
{
    g_server=s;
    load_explore_event_data();
}
exports.init=init;

function load_explore_event_data()
{
    global.log("load_explore_event_data");
    var file="explore_event.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["EXPLORE_EVENT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var explore_event_data=new ExploreEventData();

        explore_event_data.event_id=data["EXPLORE_EVENT"][i].EventId;
        explore_event_data.event_type=Number(data["EXPLORE_EVENT"][i].EventType);
        if(Number(data["EXPLORE_EVENT"][i].Gold))
        {
            var reward_data=new RewardData();
            reward_data.type=const_value.REWARD_TYPE_MONEY;
            reward_data.num=Number(data["EXPLORE_EVENT"][i].Gold);

            explore_event_data.reward.push(reward_data);
        }
        if(Number(data["EXPLORE_EVENT"][i].Exp))
        {
            var reward_data=new RewardData();
            reward_data.type=const_value.REWARD_TYPE_EXP;
            reward_data.num=Number(data["EXPLORE_EVENT"][i].Exp);
            explore_event_data.reward.push(reward_data);
        }

        if(data["EXPLORE_EVENT"][i].ItemId)
        {
            var reward_data=new RewardData();
            reward_data.type=const_value.REWARD_TYPE_ITEM;
            reward_data.id=data["EXPLORE_EVENT"][i].ItemId;
            reward_data.num=1;
            explore_event_data.reward.push(reward_data);
        }
        if(data["EXPLORE_EVENT"][i].CardId)
        {
            var reward_data=new RewardData();
            reward_data.type=const_value.REWARD_TYPE_CARD;
            reward_data.id=data["EXPLORE_EVENT"][i].CardId;
            reward_data.num=1;
            explore_event_data.reward.push(reward_data);
        }
        if(data["EXPLORE_EVENT"][i].CardFragId)
        {
            var reward_data=new RewardData();
            reward_data.type=const_value.REWARD_TYPE_SOUL;
            reward_data.id=data["EXPLORE_EVENT"][i].CardFragId;
            reward_data.num=1;
            explore_event_data.reward.push(reward_data);
        }

        explore_event_data.cost_type=Number(data["EXPLORE_EVENT"][i].CostType);
        explore_event_data.cost_num=Number(data["EXPLORE_EVENT"][i].CostNum);

        explore_event_data.proba_one=Number(data["EXPLORE_EVENT"][i].ProbabilityOne);
        explore_event_data.proba_two=Number(data["EXPLORE_EVENT"][i].ProbabilityTwo)+explore_event_data.proba_one;
        explore_event_data.proba_three=Number(data["EXPLORE_EVENT"][i].ProbabilityThree)+explore_event_data.proba_two;
        explore_event_data.proba_four=Number(data["EXPLORE_EVENT"][i].ProbabilityFour)+explore_event_data.proba_three;
        explore_event_data.proba_five=Number(data["EXPLORE_EVENT"][i].ProbabilityFive)+explore_event_data.proba_four;

        explore_event_data.score=Number(data["EXPLORE_EVENT"][i].Score);

        explore_event_data_list[explore_event_data.event_id]=explore_event_data;
    }

    var log_content={"count":count,"explore_event_data_list":explore_event_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_explore_event_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
