/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-14
 * Time: 下午1:39
 * To change this template use File | Settings | File Templates.
 */

var g_server=null;

function init(s)
{
    g_server=s;
    load_formation_data_list();
}
exports.init=init;

//卡组中的阵型(用户五个队伍)
function FormationData()
{
    this.gid=0;
    this.grid=0;
    this.level=0;
    this.name='';
    this.vip=0;
    this.top_hurt=0;//最高伤害
    this.town_title=0;//玩家霸业的最高称号
    this.beauty_uid=0; //value FormationBeautyBase
    this.card_ls=[]; //卡组编号，value：FormationCardBase
}
exports.FormationData=FormationData;


//卡组中单个卡牌的属性（变化的数据放在数据库，能从json表中取的数据不放在库中）
function FormationCardBase()
{
    this.unique_id=0;
    this.card_id=0;   //卡牌ID
    this.level=0;   //等级
    this.b_level=0;   //转生等级
    this.e_list=[0,0,0]; //卡牌配戴的装备 value: FormationEquipData

}
exports.FormationCardBase=FormationCardBase;

//卡牌配戴的装备结构
function FormationEquipData()
{
    this.equip_id="";   //装备id
    //this.gem=[];   //装备宝石
}
exports.FormationEquipData=FormationEquipData;

//助阵美女数据
function FormationBeautyBase()
{
    this.unique_id=0;
    this.beauty_id=0;   //美女ID
}
exports.FormationBeautyBase=FormationBeautyBase;


//战斗运行中用户数据
var FightUserData=function()
{
    this.gid=0; //用户gid
    this.grid=0;  //用户grid
    this.nonce=0;//加密数据
    this.parent_id=0;//(城池id,活动id);
    this.gate_id=0;//关卡id
    this.score=0;//获取的积分
    this.is_friend=0;//是否是好友
    this.friend_uid=0;//好友ID
    this.drops=[];//掉落数据
};
exports.FightUserData=FightUserData;

//全局变量存放用户战斗数据
var fight_user_data_list={}; //key:用户grid,value: FightUserData
exports.fight_user_data_list=fight_user_data_list;

//全局变量存放所有用户阵型
var formation_list={}; //key:用户grid,value: FormationData
exports.formation_list=formation_list;


//最高伤害排行榜
var HurtRankData=function()
{
    this.gid=0;
    this.grid=0;
    this.hurt=0; //伤害
};
exports.HurtRankData=HurtRankData;

var top_hurt_rank=[];//value rank_hurt_data
exports.top_hurt_rank=top_hurt_rank; //value: HurtRankData 只保存真实用户数据

var compare=function(val_one,val_two)
{
    var key="hurt";
    if(val_one[key] < val_two[key])
    {
        return 1;
    }
    else if(val_one[key] > val_two[key])
    {
        return -1;
    }
    else
    {
        return 0;
    }
};

var load_formation_data_list=function()
{
    global.log("load_formation_data_list");
    g_server.db.find("t_formation_list",{},function(arr){
        if(arr.length!=0)
        {
            for(var i in arr)
            {
                var grid=arr[i].grid;
                formation_list[grid]=arr[i];

                var _rank_data=new HurtRankData();
                _rank_data.gid=arr[i].gid;
                _rank_data.grid=grid;
                _rank_data.hurt=arr[i].top_hurt;
                top_hurt_rank.push(_rank_data);
            }
            top_hurt_rank.sort(compare);
        }
    });
};





