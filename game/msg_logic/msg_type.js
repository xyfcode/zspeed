//消息ID与客户端ID值对应

function MsgID()
{
    this.NM_CONNECT=1;
    this.NM_RECONNECT = 2;
    this.NM_ALIVED = 3; //客户端连接成功后的心跳协议
    this.NM_MUTIL_LOGIN = 4;//有相同帐号登录
    this.NM_UPDATE_SERVER_STATUS = 6;  //上传游戏服信息到billing服务器
    this.NM_USER_RECONNECT_TO_BILLING = 7;//重连GS后通知billing
    this.NM_BL_USER_OFFLINE = 8;
    this.NM_USER_NOTICE = 9; //GM发送用户公告 推送
    this.NM_USER_DATA = 10; //用户基础数据推送
    this.NM_ROLE_LIST=20;
    this.NM_MAIL_DATA=21; //服务器推送客户端单个邮件
    this.NM_BL_GS_USER_LOGIN = 26;   //billing 登录确认
    this.NM_SERVER_STATUS = 27; // 运行状态上传 billing
    this.NM_BL_KICK_USER = 28; //从BILLING 传来踢玩家下线
    this.NM_BL_ACCOUNT_BIND = 29; //快速登录账号绑定billing
    this.NM_BL_VERIFY_CODE = 30; //BILLING 兑换码确认

    this.NM_FRIEND_DATA_LIST=50; //查看好友列表
    this.NM_ADD_FRIEND=51; //申请添加好友
    this.NM_DELETE_FRIEND=52; //删除好友
    this.NM_FRIEND_REQUEST_LIST=53; //查看申请列表
    this.NM_CLEAR_FRIEND_LIST=54;  //清空申请列表
    this.NM_AGREE_REQUEST=55; //同意好友请求
    this.NM_REFUSE_REQUEST=56;//拒绝好友请求
    this.NM_SEARCH_FRIEND=57;//好友搜索
    this.NM_FRIEND_DETAIL=58;//好友详情

    this.NM_USER_PURC_DATA=80;//用户商城充值信息
    this.NM_APPLE_USER_PURCHASE=81;//正式苹果用户支付
    this.NM_USER_PURCHASE=88;//用户充值结果(目前是PP助手的推送充值结果，可以换成82号协议)


    this.NM_GET_NOTICE_COUNT=198; //获得通知数量
    this.NM_ADD_STAMINA=197; //增加体力



    this.NM_LOGIN=201; //登录
    this.NM_LOGIN_REWARD = 202;//登录奖励
    this.NM_RANDOM_NAME=203; //随机名
    this.NM_CREATE_ROLE = 205;//创建角色
    this.NM_ENTER_GAME = 207; //进入游戏

    this.NM_TOWN_DATA=299; //城池信息
    this.NM_GATE_DATA = 298;//关卡信息
    this.NM_CARD_BGA_DATA = 297;//卡牌背包信息
    this.NM_EQUIP_BGA_DATA = 296;//装备背包信息
    this.NM_FORMATION_DATA=295;//获取用户阵型信息
    this.NM_FIGHT_FRIEND_DATA=294;//邀请战斗好友列表
    this.NM_SELECT_FIGHT_FRIEND=293;//选择邀请好友
    this.NM_EXTEND_BAG=292;//扩充武将装备背包
    this.NM_EXTEND_FRIEND_BAG=291;//扩充好友背包
    this.NM_CARD_STRENGTH=283;//武将强化
    this.NM_CARD_REBORN=282;//武将转生
    this.NM_FORMATION_EDIT=281;//阵型编辑
    this.NM_EQUIP_UPLOAD=280;//装备装载
    this.NM_GAIN_TOWN_REWARD=277;//领取副本奖励
    this.NM_WAR_REWARD_DATA=276;//预先计算关卡掉落
    this.NM_GATE_FIGHT_RESULT=275;//关卡战斗结果数据
    this.NM_ITEM_SELL=274;//道具出售
    this.NM_CARD_SELL=273;//武将出售
    this.NM_SWEEP_GATE=272;//关卡扫荡
    this.NM_RESET_SWEEP=271;//重置扫荡
    this.NM_BUY_EXPLORE_COUNT=267;//购买用户探索次数
    this.NM_USER_RECRUIT_DATA=266;//用户招募信息
    this.NM_TAKE_CARD=265;//抽卡
    this.NM_GET_ACTIVE_ACTIVITIES=262;//获取活动开启状态
    this.NM_ACTIVITY_DATA=261;//活动数据
    this.NM_ACTIVITY_GATE_DATA=260;//活动关卡数据
    this.NM_ROLE_MAIL_LIST=259;//发送用户邮件列表
    this.NM_GAIN_MAIL_REWARD=258;//领取邮件奖励
    this.NM_FINISH_ROOKIE_GUIDE=257; //完成的新手引导步骤号
    this.NM_UI_VISITED=256; //背包打开操作
    this.NM_FIGHT_REVIVE=255; //战斗复活
    this.NM_EQUIP_COMPOSE=253; //装备合成
    this.NM_CAED_PIECE_COMPOSE=252; //卡牌碎片合成
    this.NM_EQUIP_PIECE_COMPOSE=251; //装备碎片合成
    this.NM_ADD_EXPLORATION=249; //增加探索次数
    this.NM_EXPLORE=248; //探索
    this.NM_BUY_EXPLORE=247; //购买探索结果
    this.NM_GET_ACHIEVEMENT_DATA=246; //获取成就数据
    this.NM_GET_ACHIEVEMENT_REWARD=245; //获取成就奖励
    this.NM_REPORT_ACHIEVEMENT=244; //提交成就进度
    this.NM_GET_SEVEN_DATA=243; //获取7日登录信息
    this.NM_GET_SEVEN_REWARD=242; //领取7日登录奖励
    this.NM_GET_SIGN_DATA=241; //获取30日签到数据
    this.NM_SIGN_IN=240; //30日签到
    this.NM_EXCHANGE_GIFT=239; //兑换礼包
    this.NM_USER_CHAT_DATA=238; //用户发送聊天消息
    this.NM_NOTICE_CHAT_DATA=237; //通知用户聊天内容
    this.NM_GET_USER_INFO=236; //获取用户信息
    this.NM_GET_ACTIVITY_STATES=235; //获取活动状态
    this.NM_EAT_CHICK=234; //吃鸡
    this.NM_REFRESH_EXLIST=233; //刷新兑换列表
    this.NM_EXCHANGE=232; //兑换物品
    this.NM_SACRIFICE=231; //参拜
    this.NM_TOWN_CHALLENGE=230; //挑战城池信息
    this.NM_SET_TOWN_GUARD=229;//设置城守
    this.NM_GAIN_GUARD_TOWN_REWARD=228;//领取守城奖励
    this.NM_USE_ITEM=227; //使用道具
    this.NM_CARDFRAGMENT_SELL=225;//武将碎片出售
    this.NM_ARENA_DATA=224;//查看竞技场中玩家本人的信息
    this.NM_GAIN_ARENA_REWARD=222;//领取排行榜奖励
    this.NM_ARENA_ROLE_DETAIL=221;//获取排行榜玩家信息
    this.NM_ARENA_RANK_REWARD_DATA=220;//获取排行榜玩家奖励信息
    this.NM_SHOP_DATA=219;//获取商城数据
    this.NM_SHOP_BUY=218;//商城购买
    this.NM_ACCOUNT_REBIND=217;//账号重新绑定
    this.NM_GET_EXCHANGE_LIST=216; //获取兑换店列表
    this.NM_MONEY_TREE=215; //招财
    this.NM_CARD_FORGE=214; //卡牌熔炼
    this.NM_TEST_TOWN=3000; //城池全部打开
}
exports.MsgID=MsgID;
