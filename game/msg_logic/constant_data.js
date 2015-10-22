var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var ConstValue=function()
{
    /*需在Excel表中配置的常量*/
    //升级体力上限增加数量
    this.STAMINA_ADD = 0;
    //初始好友上限
    this.FRIEND_INIT_LIMIT = [];
    //单个好友每日使用次数限制
    this.FRIEND_USE_TIMES = 0;
    //武将空间初始上限
    this.CARD_BAG_LIMIT = 0;
    //每次扩充武将背包上限
    this.BAG_EXPEND_LIMIT=0;
    //扩充武将背包消耗元宝
    this.BAG_EXPAND_COST = 0;
    //体力恢复时间
    this.POINT_TICK = 0;
    //体力最大值
    this.STAMINA_MAX = 0;
    //战前邀请好友数量
    this.FIGHT_FRIEND_NUM = 0;
    //邀请好友人获得积分
    this.FRIEND_SCORE = 0;
    //邀请陌生人获得积分
    this.USER_SCORE = 0;
    //补满探索个数花费
    this.EXPLORE_COST = [];
    //初始探索上限
    this.EXPLORE_INIT_LIMIT = 0;
    //探索恢复时间
    this.EXPLORE_TICK=0;
    //十连抽折扣
    this.RECRUIT_DISCOUNT=0;
    //月卡
    this.CD_REWARD_TIME=0;


    //强化武将经验金钱参数
    this.Up_CARD_COST_MONEY_RATIO=0;
    //聊天免费次数
    this.CHAT_FREE_TIMES=0;
    //聊天花费RMB
    this.CHAT_COST=0;
    //吃鸡增加体力
    this.CHICK_ADD=0;
    //兑换店倒计时(毫秒值)
    this.EXCHANGE_MS=0;
    //兑换店刷新花费
    this.EXCHANGE_COST=0;
    //转生等级限制
    this.REBORN_LEVEL=[];
    //探索开启等级
    this.EXPLORE_LEVEL=0;
    //升级恢复体力
    this.UP_ADD_POWER=0;
    //摇钱树获取的铜钱
    this.MT_GOLD=0;
    //摇钱花费
    this.MT_COST=[];
    //摇钱树VIP次数
    this.MT_VIP_TIMES=[];
    //摇钱树低级暴击概率
    this.MT_Crit_LOW=0;
    //摇钱树高级暴击概率
    this.MT_Crit_HIGH=0;
    //霸业铜钱奖励
    this.TOWN_COIN_REWARD=0;
    //熊猫卡包ID
    this.PANDA_ITEM_ID=0;
    //肥猪卡包ID
    this.PIG_ITEM_ID=0;
    //熊猫卡牌ID
    this.PANDA_CARD_ID=0;
    //肥猪卡牌ID
    this.PIG_CARD_ID=0;
    //重置扫荡花费
    this.RESET_SWEEP_COST=[];
    //VIP对应的充值额度
    this.VIP=[];
    //战斗复活花费
    this.REVIVE_COST=[];
    //战斗复活VIP次数
    this.REVIVE_TIMES=[];
    //转生花费铜钱
    this.REBORN_COST=[];



    /*需在Excel表中配置的常量*/


    /*程序自定义常量*/

    //最大邮件数量
    this.MAIL_MAX=30;

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
    this.ITEM_TYPE_STAMINA=3;//包子
    this.ITEM_TYPE_EQUIP=4;//装备
    this.ITEM_TYPE_EQUIP_FRAG=5;//装备碎片

    //卡牌装备上限
    this.CARD_EQUIP_LIMIT=3;

    //关卡战斗分类
    this.FIGHT_TYPE_GATE=1; //普通关卡战斗
    this.FIGHT_TYPE_TOWN=2; //城池战斗（挑战）
    this.FIGHT_TYPE_BATTLE=3; //战场战斗（活动）

    //卡牌背包最大限制
    this.CARD_BAG_MAX_LIMIT=200;

    //成就类型
    this.ACHI_TYPE_GATE=1; //通关关卡
    //this.ACHI_TYPE_RECHARGE_TIMES=2; //充值次数
    //this.ACHI_TYPE_RECHARGE_SUM=3; //充值金额
    this.ACHI_TYPE_EXPLORE_TIMES=4; //探索次数
    //this.ACHI_TYPE_BUY_EXPLORE=5; //补充探索次数
    //this.ACHI_TYPE_LOGIN=7; //连续登录天数
    //this.ACHI_TYPE_SKILL_VAN=8; //先锋技能次数
    //this.ACHI_TYPE_NINE=10; //九连释放次数
    this.ACHI_TYPE_KILL_NUM=11; //击杀数量
    this.ACHI_TYPE_LEVEL=12; //玩家等级
    this.ACHI_TYPE_CARD_STAR=13; //5星级武将数量
    this.ACHI_TYPE_EQUIP_NUM=14; //装备获得数量
    this.ACHI_TYPE_CARD_EVOLVE_COUNT=15; //转生的武将个数
    this.ACHI_TYPE_CARD_EVOLVE_LEVEL=16; //转生的武将等级
    //this.ACHI_TYPE_GRIFFIN=17; //战斗中召唤神兽次数
    //this.ACHI_TYPE_TOWNS=18; //占领城池数量
    this.ACHI_TYPE_TOWNS_FIGHT=19; //霸业挑战次数


    this.EXCHANGE_LIST_NUM=5;//兑换列表数量

    //邮件类型
    this.MAIL_TYPE_REWARD=1;//可以领取奖励的邮件
    this.MAIL_TYPE_READ_SUCC=2;//我占领了城池,只读
    this.MAIL_TYPE_READ_FAIL=3;//我的城池被夺走，只读

    //城池状态
    this.TOWN_STATUS_INIT=1;//初始状态
    this.TOWN_STATUS_CARD=2;//关卡通关 武将未领取
    this.TOWN_STATUS_BEAUTY=3;//美女未领取
    this.TOWN_STATUS_OK=4;//通关

    //摇钱树低级暴击触发获得倍率
    this.MT_LOW_GAIN=1.5;
    //摇钱树高级暴击触发获得倍率
    this.MT_HIGH_GAIN=2;

    /*程序自定义常量*/

};

var const_value=new ConstValue();
exports.const_value=const_value;


function init()
{
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
        const_value.STAMINA_ADD=Number(data["CONST"][i].StaminaAdd);

        (data["CONST"][i].FriendInitLimit).split(',').forEach(function(e){
            const_value.FRIEND_INIT_LIMIT.push(Number(e));
        });

        const_value.FRIEND_USE_TIMES=Number(data["CONST"][i].EveryFirendUseTimes);
        const_value.CARD_BAG_LIMIT=Number(data["CONST"][i].CardBagLimit);
        const_value.BAG_EXPEND_LIMIT=Number(data["CONST"][i].BagExpandLimit);
        const_value.BAG_EXPAND_COST=Number(data["CONST"][i].BagExpandCost);
        const_value.POINT_TICK= Number(data["CONST"][i].Point_Tick);
        const_value.STAMINA_MAX= Number(data["CONST"][i].StaminaMax);
        const_value.FIGHT_FRIEND_NUM= Number(data["CONST"][i].FightFriendNum);
        const_value.FRIEND_SCORE= Number(data["CONST"][i].FriendScore);
        const_value.USER_SCORE= Number(data["CONST"][i].UserScore);
        const_value.TOWN_COIN_REWARD= Number(data["CONST"][i].TownRewardCoin);
        (data["CONST"][i].ExploreCost).split(',').forEach(function(e){
            const_value.EXPLORE_COST.push(Number(e));
        });
        const_value.EXPLORE_INIT_LIMIT= Number(data["CONST"][i].ExploreInitLimit);
        const_value.EXPLORE_TICK= Number(data["CONST"][i].ExploreTick);
        const_value.RECRUIT_DISCOUNT= Number(data["CONST"][i].RecruitDiscount);
        const_value.CD_REWARD_TIME= Number(data["CONST"][i].CdRewardTime);
        const_value.Up_CARD_COST_MONEY_RATIO= Number(data["CONST"][i].UpWarriorCostMoneyRatio);
        const_value.CHAT_FREE_TIMES= Number(data["CONST"][i].ChatFreeTimes);
        const_value.CHAT_COST= Number(data["CONST"][i].ChatCost);
        const_value.CHICK_ADD= Number(data["CONST"][i].ChickAdd);
        const_value.EXCHANGE_MS= Number(data["CONST"][i].ExchangeHour)*60*60*1000;
        const_value.EXCHANGE_COST= Number(data["CONST"][i].ExchangeCost);


        (data["CONST"][i].RebornLevel).split(',').forEach(function(e){
            const_value.REBORN_LEVEL.push(Number(e));
        });
        const_value.EXPLORE_LEVEL= Number(data["CONST"][i].ExploreLv);
        const_value.UP_ADD_POWER= Number(data["CONST"][i].UpGradePower);
        const_value.MT_GOLD= Number(data["CONST"][i].MTGold);
        (data["CONST"][i].MTCost).split(',').forEach(function(e){
            const_value.MT_COST.push(Number(e));
        });

        (data["CONST"][i].MTVipTimes).split(',').forEach(function(e){
            const_value.MT_VIP_TIMES.push(Number(e));
        });
        const_value.MT_Crit_LOW= Number(data["CONST"][i].MTCritLow)*10;
        const_value.MT_Crit_HIGH= Number(data["CONST"][i].MTCritHigh)*10+const_value.MT_Crit_LOW;
        const_value.PANDA_ITEM_ID= data["CONST"][i].PandaItemId;
        const_value.PIG_ITEM_ID= data["CONST"][i].PigItemId;
        const_value.PANDA_CARD_ID= data["CONST"][i].PandaCardId;
        const_value.PIG_CARD_ID= data["CONST"][i].PigCardId;

        (data["CONST"][i].ResetSweepCost).split(',').forEach(function(e){
            const_value.RESET_SWEEP_COST.push(Number(e));
        });

        (data["CONST"][i].Vip).split(',').forEach(function(e){
            const_value.VIP.push(Number(e));
        });

        (data["CONST"][i].ReviveCost).split(',').forEach(function(e){
            const_value.REVIVE_COST.push(Number(e));
        });

        (data["CONST"][i].ReviveTimes).split(',').forEach(function(e){
            const_value.REVIVE_TIMES.push(Number(e));
        });

        (data["CONST"][i].RebornCost).split(',').forEach(function(e){
            const_value.REBORN_COST.push(Number(e));
        });

        break;
    }

    var log_content={"count":count,"const_value":const_value};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_constant_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

