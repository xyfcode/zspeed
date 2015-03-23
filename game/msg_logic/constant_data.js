var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var ConstValue=function()
{
    /*需在Excel表中配置的常量*/
    //初始好友上限
    this.FRIEND_INIT_LIMIT = 0;
    //好友上限增长/2级
    this.FRIEND_ADD = 0;
    //好友申请上限
    this.FRIEND_ASK_LIMIT = 0;
    //好友申请上限增长/2级
    this.FRIEND_ASK_ADD = 0;
    //每次扩充好友上限数量
    this.FRIEND_EXPEND_LIMIT=0;
    //扩充好友上限消耗元宝
    this.FRIEND_EXPAND_COST = 0;
    //武将空间初始上限
    this.CARD_BAG_LIMIT = 0;
    //每次扩充武将背包上限
    this.BAG_EXPEND_LIMIT=0;
    //扩充武将背包消耗元宝
    this.BAG_EXPAND_COST = 0;
    //战斗复活消耗元宝
    this.FIGHT_RELIVE_COST = 0;
    //体力恢复时间
    this.POINT_TICK = 0;
    //体力最大值
    this.STAMINA_MAX = 0;
    //替代武将id
    this.REPLACE_CARD = 0;
    //战前邀请好友数量
    this.FIGHT_FRIEND_NUM = 0;
    //邀请好友人获得积分
    this.FRIEND_SCORE = 0;
    //邀请陌生人获得积分
    this.USER_SCORE = 0;
    //补满探索个数花费
    this.EXPLORE_COST = 0;
    //初始探索上限
    this.EXPLORE_INIT_LIMIT = 0;
    //探索恢复时间
    this.EXPLORE_TICK=0;
    //十连抽折扣
    this.RECRUIT_DISCOUNT=0;
    //月卡
    this.CD_REWARD_TIME=0;
    //强化装备经验金钱参数
    this.Up_EQUIP_COST_MONEY_RATIO=0;
    //装备经验增幅比例
    this.Up_EQUIP_EXP_RATIO=0;
    //强化武将经验金钱参数
    this.Up_CARD_COST_MONEY_RATIO=0;
    //聊天免费次数
    this.CHAT_FREE_TIMES=0;
    //聊天花费RMB
    this.CHAT_COST=0;
    //吃鸡增加体力
    this.CHICK_ADD=0;
    //兑换店倒计时
    this.EXCHANGE_HOUR=0;
    //兑换店刷新花费
    this.EXCHANGE_COST=0;
    //武将超出角色等级限制
    this.CARD_EXCEED_ROLE_LIMIT=0;
    //转生等级限制
    this.REBORN_LEVEL=0;
    //招募开启等级
    this.RECRUIT_LEVEL=0;
    //强化开启等级
    this.STRENGTH_LEVEL=0;
    //每日登陆开启等级
    this.LOGIN_LEVEL=0;
    //每日签到开启等级
    this.SIGN_LEVEL=0;
    //参拜开启等级
    this.SACRIFICE_LEVEL=0;
    //转生开启等级
    this.EVOLVE_LEVEL=0;
    //成就开启等级
    this.ACHIEVE_LEVEL=0;
    //探索开启等级
    this.EXPLORE_LEVEL=0;
    //邀请好友开启等级
    this.FRIEND_LEVEL=0;
    //兑换店开启等级
    this.EXCHANGE_LEVEL=0;
    //排行榜开启等级
    this.RANK_LEVEL=0;
    //兵器战场开启等级
    this.EQUIP_BATTLE_LEVE=0;
    //名将战场开启等级
    this.WARR_BATTLE_LEVEL=0;
    //霸业开启等级
    this.CASTELLAN_LEVEL=0;
    //霸业铜钱产出时间
    this.TOWN_MONEY_HOUR=0;
    //霸业人民币产出时间
    this.TOWN_RMB_HOUR=0;
    //城池收益持续时间24小时
    this.TOWN_EFFECTIVE_HOUR=0;





    /*需在Excel表中配置的常量*/


    /*程序自定义常量*/

    //最大邮件数量
    this.MAIN_MAX=30;

    //武将状态
    this.CARD_STATUS_OFF=1;//下阵
    this.CARD_STATUS_ON=2;//上阵
    this.CARD_STATUS_LEADER=3;//统帅
    this.CARD_STATUS_VAN=4;//先锋
    this.CARD_STATUS_GUARD=5;//城守

    //奖励分类
    this.REWARD_TYPE_CARD=1;//卡牌
    this.REWARD_TYPE_SOUL=2;//魂魄
    this.REWARD_TYPE_ITEM=3;//道具
    this.REWARD_TYPE_RMB=4;//人民币
    this.REWARD_TYPE_MONEY=5;//游戏币
    this.REWARD_TYPE_SCORE=6;//积分
    this.REWARD_TYPE_EXP=7;//经验
    this.REWARD_TYPE_POINT=8;//体力

    //道具分类
    this.ITEM_TYPE_BOX=1;//宝箱
    this.ITEM_TYPE_KEY=2;//钥匙
    this.ITEM_TYPE_WATER=3;//药水
    this.ITEM_TYPE_EQUIP=4;//装备
    this.ITEM_TYPE_EQUIP_FRAG=5;//装备碎片

    //卡牌装备上限
    this.CARD_EQUIP_LIMIT=3;

    //活动时间模式
    this.ACTIVITY_MODE_FIX=1; //固定周期
    this.ACTIVITY_MODE_LOOP=2; //循环周期()
    this.ACTIVITY_MODE_ALWAYS=3; //无限周期(一直开启)
    //活动类型
    this.ACTIVITY_TYPE_DUEL=1; //决战
    this.ACTIVITY_TYPE_COMMON=2; //常规
    this.ACTIVITY_TYPE_EQUIP=3; //装备
    this.ACTIVITY_TYPE_MATERIAL=4; //材料
    //活动次数类型
    this.ACTIVITY_COUNT_INFINITY=1; //不限次数
    this.ACTIVITY_COUNT_LIMITED=2; //有限次数

    //关卡战斗分类
    this.FIGHT_TYPE_GATE=1; //普通关卡战斗
    this.FIGHT_TYPE_TOWN=2; //城池战斗（挑战）
    this.FIGHT_TYPE_BATTLE=3; //战场战斗（活动）


    //武将强化同职业倍率
    this.CARD_RACE_ADD=2; //

    //卡牌背包最大限制
    this.CARD_BAG_MAX_LIMIT=200;

    //成就类型
    this.ACHI_TYPE_GATE=1; //通关关卡
    this.ACHI_TYPE_RECHARGE_TIMES=2; //充值次数
    this.ACHI_TYPE_RECHARGE_SUM=3; //充值金额
    this.ACHI_TYPE_EXPLORE_TIMES=4; //探索次数
    this.ACHI_TYPE_BUY_EXPLORE=5; //补充探索次数
    this.ACHI_TYPE_LOGIN=7; //连续登录天数
    this.ACHI_TYPE_SKILL_VAN=8; //先锋技能次数
    this.ACHI_TYPE_NINE=10; //九连释放次数
    this.ACHI_TYPE_KILL_NUM=11; //击杀数量
    this.ACHI_TYPE_LEVEL=12; //玩家等级
    this.ACHI_TYPE_CARD_STAR=13; //5星级武将数量
    this.ACHI_TYPE_EQUIP_NUM=14; //装备获得数量
    this.ACHI_TYPE_CARD_EVOLVE_COUNT=15; //转生的武将个数
    this.ACHI_TYPE_CARD_EVOLVE_LEVEL=16; //转生的武将等级
    this.ACHI_TYPE_GRIFFIN=17; //战斗中召唤神兽次数
    this.ACHI_TYPE_TOWNS=18; //占领城池数量
    this.ACHI_TYPE_TOWNS_FIGHT=19; //霸业挑战次数


    this.EXCHANGE_LIST_NUM=5;//兑换列表数量

    //邮件类型
    this.MAIL_TYPE_REWARD=1;//可以领取奖励的邮件
    this.MAIL_TYPE_READ_SUCC=2;//我占领了城池,只读
    this.MAIL_TYPE_READ_FAIL=3;//我的城池被夺走，只读




    /*程序自定义常量*/

};

var const_value=new ConstValue();
exports.const_value=const_value;


var g_server=null;

function init(s)
{
    g_server=s;
    load_constant_data();
}
exports.init=init;

function load_constant_data()
{
    global.log("load_constant_data");
    var file="const.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["CONST"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        const_value.FRIEND_INIT_LIMIT=Number(data["CONST"][i].FriendInitLimit);
        const_value.FRIEND_ADD=Number(data["CONST"][i].FriendAdd);
        const_value.FRIEND_ASK_LIMIT=Number(data["CONST"][i].FriendAskLimit);
        const_value.FRIEND_ASK_ADD= Number(data["CONST"][i].FriendAskAdd);
        const_value.FRIEND_EXPEND_LIMIT=Number(data["CONST"][i].FriendExpandLimit);
        const_value.FRIEND_EXPAND_COST= Number(data["CONST"][i].FriendExpandCost);
        const_value.CARD_BAG_LIMIT=Number(data["CONST"][i].CardBagLimit);
        const_value.BAG_EXPEND_LIMIT=Number(data["CONST"][i].BagExpandLimit);
        const_value.BAG_EXPAND_COST=Number(data["CONST"][i].BagExpandCost);
        const_value.FIGHT_RELIVE_COST= Number(data["CONST"][i].FightReliveCost);
        const_value.POINT_TICK= Number(data["CONST"][i].Point_Tick);
        const_value.STAMINA_MAX= Number(data["CONST"][i].StaminaMax);
        const_value.REPLACE_CARD= Number(data["CONST"][i].ReplaceCard);
        const_value.FIGHT_FRIEND_NUM= Number(data["CONST"][i].FightFriendNum);
        const_value.FRIEND_SCORE= Number(data["CONST"][i].FriendScore);
        const_value.USER_SCORE= Number(data["CONST"][i].UserScore);
        const_value.EXPLORE_COST= (data["CONST"][i].ExploreCost).split(',');
        const_value.EXPLORE_INIT_LIMIT= Number(data["CONST"][i].ExploreInitLimit);
        const_value.EXPLORE_TICK= Number(data["CONST"][i].ExploreTick);
        const_value.RECRUIT_DISCOUNT= Number(data["CONST"][i].RecruitDiscount);
        const_value.CD_REWARD_TIME= Number(data["CONST"][i].CdRewardTime);
        const_value.Up_EQUIP_COST_MONEY_RATIO= Number(data["CONST"][i].UpEquipCostMoneyRatio);
        const_value.Up_EQUIP_EXP_RATIO= Number(data["CONST"][i].UpEquipExpRatio);
        const_value.Up_CARD_COST_MONEY_RATIO= Number(data["CONST"][i].UpWarriorCostMoneyRatio);
        const_value.CHAT_FREE_TIMES= Number(data["CONST"][i].ChatFreeTimes);
        const_value.CHAT_COST= Number(data["CONST"][i].ChatCost);
        const_value.CHICK_ADD= Number(data["CONST"][i].ChickAdd);
        const_value.EXCHANGE_HOUR= Number(data["CONST"][i].ExchangeHour);
        const_value.EXCHANGE_COST= Number(data["CONST"][i].ExchangeCost);
        const_value.CARD_EXCEED_ROLE_LIMIT= Number(data["CONST"][i].CardExceedRoleLimit);
        const_value.REBORN_LEVEL= (data["CONST"][i].RebornLevel).split(',');
        const_value.RECRUIT_LEVEL= Number(data["CONST"][i].RecruitLv);
        const_value.STRENGTH_LEVEL= Number(data["CONST"][i].StrengthenLv);
        const_value.LOGIN_LEVEL= Number(data["CONST"][i].LoginLv);
        const_value.SIGN_LEVEL= Number(data["CONST"][i].SignLv);
        const_value.SACRIFICE_LEVEL= Number(data["CONST"][i].SacrificeLv);
        const_value.EVOLVE_LEVEL= Number(data["CONST"][i].EvolveLv);
        const_value.ACHIEVE_LEVEL= Number(data["CONST"][i].AchieveLv);
        const_value.EXPLORE_LEVEL= Number(data["CONST"][i].ExploreLv);
        const_value.FRIEND_LEVEL= Number(data["CONST"][i].FriendLv);
        const_value.EXCHANGE_LEVEL= Number(data["CONST"][i].ExchangeLv);
        const_value.RANK_LEVEL= Number(data["CONST"][i].RankLv);
        const_value.EQUIP_BATTLE_LEVE= Number(data["CONST"][i].EquipBattleLv);
        const_value.WARR_BATTLE_LEVEL= Number(data["CONST"][i].WarrBattleLv);
        const_value.CASTELLAN_LEVEL= Number(data["CONST"][i].CastellanLv);
        const_value.TOWN_MONEY_HOUR= Number(data["CONST"][i].TownMoneyHour);
        const_value.TOWN_RMB_HOUR= Number(data["CONST"][i].TownRmbHour);
        const_value.TOWN_EFFECTIVE_HOUR= Number(data["CONST"][i].TownEffecHour);

        break;
    }

    var log_content={"count":count,"const_value":const_value};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_constant_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

