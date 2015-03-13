var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var TownData=function()
{
    this.tid=0;
    this.next_tid=0;
    this.town_name=0;
    this.lv_limit=0;
    this.basic_money=0;
    this.add_money=0;
    this.add_rmb=0;
    this.gate=[];
    this.rewards=[];
    this.type1=0;
    this.id1=0;
    this.num1=0;
    this.type2=0;
    this.id2=0;
    this.num2=0;
    this.type3=0;
    this.id3=0;
    this.num3=0;

};

var TownRewardData=function()
{
    this.type=0;
    this.id=0;
    this.num=0;
};

var town_data_list={};
exports.town_data_list=town_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_town_data();
    load_town_data_list();
}
exports.init=init;

function load_town_data()
{
    global.log("load_town_data");
    var file="town.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["TOWN"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var tn_data=new TownData();

        tn_data.tid= data["TOWN"][i].TId;
        tn_data.next_tid= data["TOWN"][i].NextTId;
        tn_data.town_name= data["TOWN"][i].TownName;
        tn_data.lv_limit= Number(data["TOWN"][i].LvLimited);
        tn_data.basic_money= Number(data["TOWN"][i].BasicMoney);
        tn_data.add_money= Number(data["TOWN"][i].ArithmeticProgression);
        tn_data.add_rmb= Number(data["TOWN"][i].Gold);
        tn_data.gate= (data["TOWN"][i].Gate).split(',');

        if(data["TOWN"][i].Num1>0)
        {
            var tn_reward_data=new TownRewardData();
            tn_reward_data.type=Number(data["TOWN"][i].Type1);
            tn_reward_data.id=data["TOWN"][i].Id1;
            tn_reward_data.num=Number(data["TOWN"][i].Num1);
            tn_data.rewards.push(tn_reward_data);
        }

        if(data["TOWN"][i].Num2>0)
        {
            var tn_reward_data=new TownRewardData();
            tn_reward_data.type=Number(data["TOWN"][i].Type2);
            tn_reward_data.id=data["TOWN"][i].Id2;
            tn_reward_data.num=Number(data["TOWN"][i].Num2);
            tn_data.rewards.push(tn_reward_data);
        }

        if(data["TOWN"][i].Num3>0)
        {
            var tn_reward_data=new TownRewardData();
            tn_reward_data.type=Number(data["TOWN"][i].Type3);
            tn_reward_data.id=data["TOWN"][i].Id3;
            tn_reward_data.num=Number(data["TOWN"][i].Num3);
            tn_data.rewards.push(tn_reward_data);
        }

        town_data_list[tn_data.tid]=tn_data;
    }

    var log_content={"count":count,"town_data_list":town_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_town_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

var Guard_Data=function()
{
    this.unique_id=0;//  守城武将UID
    this.card_id=0;//守城武将
    this.level=0;//等级
    this.b_level=0;//转生等级
    this.equips=[];//配戴的装备
};
exports.Guard_Data=Guard_Data;


function GuardEquipData()
{
    this.equip_id="";   //装备id
    //this.gem=[];   //装备宝石
}
exports.GuardEquipData=GuardEquipData;

var TownDbData=function()
{
    this.tid=0; //城池ID
    this.owner_gid=0;//城主gid
    this.owner_grid=0; //城主grid
    this.owner_hurt=0;//城主总伤害
    this.guard_data=new Guard_Data();//守城武将数据
    this.second_grid=0;//第二名grid
    this.second_hurt=0;//第二名总伤害
    this.third_grid=0;//第三名grid
    this.third_hurt=0;//第三名总伤害
    this.guard_time=0;//设置城守的时间
    this.guard_t_time=0;//旧城守累计时间（更换城守时记录）
    this.pick_time=0;//领取奖励时间（初始化为0，表示可以领取最多24的城池单独收益）
};
exports.TownDbData=TownDbData;

var town_db_data_list={};  //key tid value: TownDbData
exports.town_db_data_list=town_db_data_list;

//全局变量存放城池需要更新入库的邮件的用户tid
var town_update_db_list=[]; //tid
exports.town_update_db_list=town_update_db_list;

var load_town_data_list=function()
{
    global.log("load_town_data_list");
    g_server.db.find("t_town_list",{},function(arr){
        if(arr.length>0)
        {
            for(var i in arr)
            {
                var tid=arr[i].tid;
                town_db_data_list[tid]=arr[i];
            }
        }
    });
};

