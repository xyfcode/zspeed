/*
* 用户整体数据结构
* */

//用户数据结构
function TempUserInfo()
{
    this.account = "";
    this.pwd = "";
    this.key = ""; //唯一标示
    this.login_type = 0;
    this.version = "";
    this.socket = null;
    this.send = null;
    this.pft="";//平台类别
    this.uid = 0;
}
exports.TempUserInfo = TempUserInfo;

//玩家帐号数据
function AccountData()
{
    this.gid = 0;//帐号唯一ID
    this.account = "";//帐号
    this.login_type = 0;//登录类别
    this.c_date = 0;//创建日期
    this.lock = 0;//锁定状态 0:unlock 1:locked
    this.cur_sid = 0;//当前登录的服务器ID
    this.pft="";//平台类别
    this.s_ls = {};//服务器与角色对应关系
}
exports.AccountData = AccountData;

//服务器与角色关系数据
function ServerData()
{
    this.sid = 0;//服务器ID
    this.r_ls = {};//用于存储角色数据ID key = rid,value = grid;
}

exports.ServerData = ServerData;

//角色数据
function RoleDataDB()
{
    this.gid = 0;//帐号唯一ID
    this.grid = 0;//角色唯一ID
    this.data = new RoleData();
}
exports.RoleDataDB = RoleDataDB;

//角色数据结构
function RoleData()
{
    this.gid = 0;//帐号唯一ID
    this.grid = 0;//角色唯一ID
    this.account=0;//用户账号
    this.pft=0;//平台类别
    this.name = 0;//名称
    this.gold = 0;//游戏币
    this.rmb = 0;  //元宝
    this.level = 0;//等级
    this.exp = 0;//经验
    this.vip = 0;//vip等级
    this.score=0;// 积分
    this.c_date = 0;//角色创建日期
    this.stamina = 0;//体力值
    this.time_stamina = 0;//体力回复时间
    this.explore=0;//探索次数
    this.time_explore = 0;//探索次数回复时间
    this.explore_date = 0;//探索购买日期
    this.explore_times=0;//探索购买次数
    this.trees = 0;//今日招财次数
    this.tree_date=0;//招财时间
    this.revives = 0;//今日复活次数
    this.revive_date=0;//复活时间

    this.guide_step=0;//新手引导编号
    this.is_cd_exist=0;//是否存在月卡
    this.purchase_rmb=0; //充值获得的金额
    this.purchase_record={};//key:商品id,value:  Purchase_Record_Data
    this.chat_date=0;//一天第一次聊天的时间
    this.chat_time=0;//发表聊天次数
    this.sign_days=0;//签到天数
    this.sign_date=0;//签到时间
    this.login_days=0;//登录天数(7日)
    this.lg_reward=[];//7登录奖励 0:代表未领取，1：代表已经领取
    this.achievement={};//成就 key:type，value:Achievement_Data
    this.recruit = {};//单抽招募数据 key: recruit_id, value:Role_Recruit_Data
    this.ten_recruit = {};//10连抽招募数据
    this.town_bag = {}; // 城池背包 key tid，value:Role_Town_Data

    this.offline_time = 0;//离线时间
    this.login_time = 0;//登录时间
    this.online_time = 0;//在线时长
    this.card_bag = {};//卡牌背包 key:unique_id value:Role_Card_Data
    this.cbag_limit = 0;//卡牌背包限制
    this.cbag_time =0; //卡牌背包打开时间
    this.card_piece = {};//卡牌碎片背包 key:card_id value:Role_Card_Piece_Data

    this.item_bag = {};//道具背包 key:item_id,value:Role_Item_Data
    this.ibag_time =0; //装备背包打开时间
    this.battle_bag={};//战场背包  key:battle_id value  Role_Battle_Data

    this.chick_time=0;//吃鸡时间
    this.sacrifice={}; //参拜  Sacrifice_Data
    this.exchange={};  //兑换列表  Exchange_Data

    this.shop_bag={};//商城数据 key:id,value:Role_Shop_Data

    this.rank_reward=[];//已经领取的排行榜奖励，value id
}
exports.RoleData = RoleData;

//商城数据机构
function Role_Shop_Data()
{
    this.id=0;//商品ID
    this.date=0;//购买时间
    this.times=0;//今日购买次数
}
exports.Role_Shop_Data = Role_Shop_Data;

//招募数据结构
function Role_Recruit_Data()
{
    this.count=0;//抽卡总次数
    this.t_count=0;//今日免费抽卡次数
    this.time=0;//上次免费抽卡时间
    this.l_pro = 0;//低级概率
    this.m_count = 0;//中级增长次数
    this.m_pro = 0;//中级概率
    this.h_count = 0;//高级增长次数
    this.h_pro = 0;//高级概率

}
exports.Role_Recruit_Data = Role_Recruit_Data;

//参拜数据结构
function Sacrifice_Data()
{
    this.date = "";//祭祀日期
    this.times = 0;//次数
    this.id="";//祭祀id
}
exports.Sacrifice_Data = Sacrifice_Data;

//兑换数据
function Exchange_Data()
{
    this.date = "";//上次刷新时间
    this.ex_list=[];//兑换列表  {exid:1,state:1}
}
exports.Exchange_Data = Exchange_Data;

//用户充值记录数据结构
function Purchase_Record_Data()
{
    this.id = 0;//商品id
    this.date = "";//充值日期
    this.count = 0;//购买次数
    this.cd_left=0;//月卡剩余次数（只针对月卡）
}
exports.Purchase_Record_Data = Purchase_Record_Data;

//卡牌数据
function Role_Card_Data()
{
    this.unique_id = 0;//唯一ID
    this.card_id = 0;//卡牌唯一ID
    this.exp=0;//卡牌经验
    this.level = 0;//卡牌等级
    this.b_level=0;//转生等级
    this.e_list=[0,0,0]; //装备列表 Card_Equip_Data
    this.used = 0;//是否在阵上
    this.guard=0;//是否是城守
    this.gain_time=0;//获取时间

}
exports.Role_Card_Data = Role_Card_Data;

//武将身上的装备数据结构
function Card_Equip_Data()
{
    this.equip_id = 0;//装备ID
    //this.gem = [];//装备附魔
}
exports.Card_Equip_Data = Card_Equip_Data;


//卡牌碎片数据结构
function Role_Card_Piece_Data()
{
    this.card_id = 0;//卡牌XID
    this.num = 0;//数量
}
exports.Role_Card_Piece_Data = Role_Card_Piece_Data;

//道具数据结构
function Role_Item_Data()
{
    this.item_id = 0;//道具ID
    this.num=0; //道具数量
    this.gain_time=0;//获取时间
}
exports.Role_Item_Data = Role_Item_Data;

//城池数据结构
function Role_Town_Data()
{
    this.tid=0;//城池ID
    this.passed=0;//是否通关 0:否，1是
    this.rewarded=0;//是否已经领取通关奖励 0:否，1是
    this.gate = [];//Role_Gate_Data
}
exports.Role_Town_Data = Role_Town_Data;

//关卡数据结构
function Role_Gate_Data()
{
    this.gate_id = 0;//关卡ID
    this.is_first=0;//是否第一次进入该关卡 0:否，1是
    this.passed=0; //是否过关 0:否，1是
    this.sweep=0;//今日扫荡次数
    this.s_date=0;//上次扫荡时间
    this.s_reset=0;//今日扫荡重置次数
}
exports.Role_Gate_Data = Role_Gate_Data;

//成就数据结构
function Achievement_Data()
{
    this.id="";//成就id
    this.times=0;//成就次数
    this.finished=0;//成就是否完成，领取完奖励算完成 0:否,1是
}
exports.Achievement_Data = Achievement_Data;

//活动战场数据结构
function Role_Battle_Data()
{
    this.battle_id=0;//战场ID
    this.gate=[]; //Role_Battle_Gate_Data
}
exports.Role_Battle_Data = Role_Battle_Data;

//活动战场关卡数据结构
function Role_Battle_Gate_Data()
{
    this.gate_id=0;//关卡ID
    this.times = 0;//挑战的次数
    this.date=0; //挑战的日期
}
exports.Role_Battle_Gate_Data = Role_Battle_Gate_Data;

//运行时玩家数据结构
function UserInfo()
{
    this.account_data = new AccountData();
    this.role_data = {};//key :grid,value = RoleDataDb
    this.send = null;//
    this.socket = null;
    this.rand_name = null;
    this.online = 0; //是否在线，0：离线，1：在线
    this.nNeedSave = 0; //是否需要定时保存数据入库
    this.offline_time = 0;//下线时间
    this.nSaveDBTime=0; //用户保存DB时间
}
exports.UserInfo = UserInfo;

//在线用户容器
var user_list = {};  //key:gid，value :UserInfo
exports.user_list = user_list;

//在线用户容器
var user_account_list = {}; //key:account，value :UserInfo
exports.user_account_list = user_account_list;

//临时用户容器
var temp_user_account_list = {};
exports.temp_user_account_list = temp_user_account_list;

//兑换码验证用户容器
var cd_verify_account_list = {}; //key:account，value :UserInfo
exports.cd_verify_account_list = cd_verify_account_list;

//临时断线重连用户数据
var temp_reconn_user_list={}; //key:account ，value :UserInfo
exports.temp_reconn_user_list = temp_reconn_user_list;

//处理用户服务器登录列表
function check_server_role_list(user,sid)
{
    var s_data = user.account_data.s_ls[sid];
    if(s_data == undefined)
    {
        s_data = new ServerData();
        s_data.sid = sid;
        user.account_data.s_ls[s_data.sid] = s_data;
    }
}
exports.check_server_role_list = check_server_role_list;

//获取角色数据
function get_cur_role(user)
{
    var role;
    if(user.account_data == undefined)
    {
        global.log("user.account_data == undefined");
        return role;
    }
    var sid = user.account_data.cur_sid;
    var rid = user.account_data.cur_rid;

    var s_data = user.account_data.s_ls[sid];
    if(s_data != undefined)
    {
        var grid = s_data.r_ls[rid];
        var role_data = user.role_data[grid];
        if(role_data != undefined)
        {
            role = role_data.data;
        }
    }
    else
    {
        //只创建user,未创建role时
        global.log("s_data == undefined");
    }
    return role;
}
exports.get_cur_role = get_cur_role;



