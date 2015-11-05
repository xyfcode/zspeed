var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var define_code=require("./define_code");
var const_value=define_code.const_value;

var g_server=null;
function init(s)
{
    g_server=s;
    load_town_title_data();
    load_town_title_db_data();
}
exports.init=init;

var TownTitleData=function()
{
    this.title_id=0;
    this.level=0;
    this.children=0;
    this.title_name=0;
    this.reward=0;
};


var town_title_data_list={};
exports.town_title_data_list=town_title_data_list;


var TownTitleFightData=function()
{
    this.t_times=0; //总次数
    this.c_times=0; //连续攻占次数
    this.period=0; //上次排名所在周期
};
exports.TownTitleFightData=TownTitleFightData;

var TitleData=function()
{
    this.id=0; //称号ID
    this.date=0; //称号获得时间
};
exports.TitleData=TitleData;


var TownTitleDbData=function()
{
    this.grid=0; //玩家id
    this.date=0;// 获取最高称号时间
    this.town_fight={};//单个城池数据 key tid value TownTitleFightData
    this.garrison=[]; //守备 2次 TitleData
    this.satrap=[]; //太守 3次 TitleData
    this.governor=[]; //都督 TitleData
    this.general=[]; //将军 TitleData
    this.king=[]; //王 TitleData
    this.first_king=[]; // 秦始皇 TitleData
};
exports.TownTitleDbData=TownTitleDbData;

var town_title_db_data_list={};  //key grid value: TownTitleDbData
exports.town_title_db_data_list=town_title_db_data_list;


//全局变量存放称号需要更新入库的用户grid
var town_title_update_db_arr=[]; //grid
exports.town_title_update_db_arr=town_title_update_db_arr;


function load_town_title_data()
{
    global.log("load_town_title_data");
    var file="town_title.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["TOWN_TITLE"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var town_title_data=new TownTitleData();

        town_title_data.title_id=data["TOWN_TITLE"][i].TitleID;
        town_title_data.level=Number(data["TOWN_TITLE"][i].Level);
        town_title_data.children=(data["TOWN_TITLE"][i].Children).split(',');
        town_title_data.title_name=Number(data["TOWN_TITLE"][i].TitleName);
        town_title_data.reward=Number(data["TOWN_TITLE"][i].RewardFortitle);

        town_title_data_list[town_title_data.title_id]=town_title_data;
    }

    var log_content={"count":count,"town_title_data_list":town_title_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","town_title_data_list",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

var load_town_title_db_data=function()
{
    global.log("load_town_title_db_data");
    g_server.db.find("t_town_title_list",{},function(arr){
        if(arr.length>0)
        {
            for(var i in arr)
            {
                var grid=arr[i].grid;
                town_title_db_data_list[grid]=arr[i];
            }
        }
    });
};














