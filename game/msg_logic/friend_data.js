var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var define_code=require("./define_code");
var const_value=define_code.const_value;
var g_server=null;

//好友信息
var FriendData=function()
{
    this.gid=0;
    this.grid=0;
    this.extend_num=0;//扩充数量
    this.friends=[]; //好友列表  value:FriendBaseData
    this.asks=[];//申请列表 value:grid
};
exports.FriendData=FriendData;

//好友信息
var FriendBaseData=function()
{
    this.grid=0;
    this.f_time=0; //战斗好友受邀时间
    this.times=0;//好友今日受邀次数
};
exports.FriendBaseData=FriendBaseData;

function init(s)
{
    g_server=s;
    load_friend_data_list();
}
exports.init=init;


//全局变量存放用户需要更新入库的好友的用户grid
var friend_update_db_list=[]; //grid
exports.friend_update_db_list=friend_update_db_list;


//全局变量存放好友数据
var friend_data_list={}; //key:grid,value: FriendData,只保存真实用户数据
exports.friend_data_list=friend_data_list;

//全局变量存放玩家战前邀请好友列表
var FightFriendData=function()
{
    this.grid=0;  //用户grid
    this.date=0;  //更新时间
    this.friends=[];//战前邀请好友列表
    this.strangers=[];//战前邀请陌生人列表
};
exports.FightFriendData=FightFriendData;

//全局变量存放用户战斗数据
var fight_friend_data_list={}; //key:用户grid,value: FightFriendData
exports.fight_friend_data_list=fight_friend_data_list;


var load_friend_data_list=function()
{
    global.log("load_friend_data_list");
    g_server.db.find("t_friend_list",{},function(arr){
        if(arr.length)
        {
            for(var i in arr)
            {
                friend_data_list[arr[i].grid]=arr[i];
            }
        }
    })
};


