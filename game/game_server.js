var make_db=require("./msg_logic/make_db") ;
var json_config_file=require("./msg_logic/json_config_file");

//数据
var initialization_data=require("./msg_logic/initialization_data");
var server_config_data = require("./msg_logic/server_config_data");
var constant_data = require("./msg_logic/constant_data");
var card_data=require("./msg_logic/card_data");
var mail_data=require("./msg_logic/mail_data");
var play_name=require("./msg_logic/play_name");
var formation_data=require("./msg_logic/formation_data");
var gate_data=require("./msg_logic/gate_data");
var town_data=require("./msg_logic/town_data");
var town_title_data=require("./msg_logic/town_title_data");
var item_data=require("./msg_logic/item_data");
var friend_data=require("./msg_logic/friend_data");
var drop_data=require("./msg_logic/drop_data");
var role_exp_data=require("./msg_logic/role_exp_data");
var card_exp_data=require("./msg_logic/card_exp_data");
var recruit_data=require("./msg_logic/recruit_data");
var activity_data=require("./msg_logic/activity_data");
var key_words_data=require("./msg_logic/key_words_data");
var card_frag_data=require("./msg_logic/card_frag_data");
var explore_data=require("./msg_logic/explore_data");
var explore_event_data=require("./msg_logic/explore_event_data");
var purchase_shop_data=require("./msg_logic/purchase_shop_data");
var recharge_reward_data=require("./msg_logic/recharge_reward_data");
var login_reward_data=require("./msg_logic/login_reward_data");
var sign_reward_data=require("./msg_logic/sign_reward_data");
var achievement_data=require("./msg_logic/achievement_data");
var robot_data=require("./msg_logic/robot_data");
var gift_data=require("./msg_logic/gift_data");
var battle_field_data=require("./msg_logic/battle_field_data");
var arena_data=require("./msg_logic/arena_data");
var shop_data=require("./msg_logic/shop_data");
var share_data=require("./msg_logic/share_data");

//逻辑
var billing_logic = require("./msg_logic/help_billing_logic");
var role_data_logic = require("./msg_logic/help_role_data_logic");
var card_logic = require("./msg_logic/help_card_logic");
var mail_logic=require("./msg_logic/help_mail_logic");
var gate_logic=require("./msg_logic/help_gate_logic");
var formation_logic=require("./msg_logic/help_formation_logic");
var town_logic = require("./msg_logic/help_town_logic");
var item_logic = require("./msg_logic/help_item_logic");
var friend_logic = require("./msg_logic/help_friend_logic");
var shop_logic = require("./msg_logic/help_shop_logic");
var recruit_logic=require("./msg_logic/help_recruit_logic");
var activity_logic=require("./msg_logic/help_activity_logic");
var explore_logic=require("./msg_logic/help_explore_logic");
var purchase_shop_logic=require("./msg_logic/help_purchase_shop_logic");
var gift_logic=require("./msg_logic/help_gift_logic");
var arena_logic=require("./msg_logic/help_arena_logic");
var chat_logic=require("./msg_logic/help_chat_logic");
var login_logic = require("./msg_logic/help_login_logic");
var share_logic = require("./msg_logic/help_share_logic");

var tick_logic=require("./msg_logic/help_tick_logic");
var gm_billing_logic=require("./msg_logic/help_gm_billing_logic");
var client_error_logic=require("./msg_logic/help_client_error_logic");


var test = require("./msg_logic/test");

var handler = {
	"___connect___" : new on_user_socket_connect(),
	"___close___"  : new on_user_socket_close(),

    "2" : new on_user_reconnect(),
    "3" : new on_alive(),
    "11" : new on_client_error(),

    "50": new on_friend_data_list(),//查看好友列表
    "51": new on_add_friend(),//申请添加好友
    "52": new on_delete_friend(),//删除好友
    "53": new on_friend_request_list(),//查看申请列表
    "54": new on_clear_request_list(),//清空申请列表
    "55": new on_agree_request(),//同意好友请求
    "56": new on_refuse_request(),//拒绝好友请求
    "57": new on_search_friend(),//好友搜索
    "58": new on_friend_detail(),//好友详情

    "80" : new on_user_purchase_data(), //查看用户充值信息
    "81" :new on_apple_user_purchase(),//正式苹果用户支付
    "82" :new on_gp_user_purchase(),//正式google play用户支付

    "198": new on_get_notice_count(),//获得通知数量
    "197": new on_add_stamina(),//增加体力

    "201" : new on_user_login(), //玩家登录
    "203" : new on_random_name(), //随机名
    "205" : new on_create_role(), //创建角色
    "207" : new on_enter_game(),   //进入游戏
    "299" : new on_town_data_list(),// 获取城池信息
    "298" : new on_gate_data(), //获取单个城池的关卡信息
    "297" : new on_card_bag_data(), //获取卡牌背包信息
    "296" : new on_item_bag_data(), //获取道具背包信息
    "295" : new on_formation_data(), //获取用户阵型信息
    "294" : new on_fight_friend_data(), //邀请战斗好友列表
    "293" : new on_select_fight_friend(), //选择邀请好友
    "292" : new on_extend_bag(), //扩充武将背包
    "283" : new on_card_strengthen(), //武将强化
    "282" : new on_card_reborn(), //武将转生
    "281" : new on_formation_edit(), //队伍编辑
    "280" : new on_equip_upload(), //装备装载
    "277" : new on_gain_town_reward(), //领取城池通关奖励
    "276" : new on_gate_reward_data(), //预先计算关卡掉落
    "275" : new on_gate_fight_result(), //战斗结果数据
    "274" : new on_sell_items(), //出售道具
    "273" : new on_sell_cards(), //出售武将
    "272" : new on_sweep_gate(), //关卡扫荡
    "271" : new on_reset_sweep(), //恢复扫荡
    "267" : new on_buy_explore_count(), //购买探索次数
    "266" : new on_user_recruit_data(), //用户招募信息
    "265" : new on_take_card(), //抽卡
    "259" : new on_role_mail_list(), //发送用户邮件列表
    "258" : new on_gain_mail_reward(), //领取邮件奖励
    "257" : new on_finish_rookie_guide(), //完成的新手引导步骤号
    "256" : new on_ui_visited(), //背包打开操作
    "255" : new on_fight_revive(), //战斗复活
    "253" : new on_equip_compose(), //装备合成
    "252" : new on_card_piece_compose(), //卡牌碎片合成
    "251" : new on_equip_piece_compose(), //装备碎片合成
    "249" : new on_add_exploration(), //增加探索次数
    "248" : new on_explore(), //探索
    "247" : new on_buy_explore(), //购买探索结果
    "246" : new on_get_achievement_data(), //获取成就数据
    "245" : new on_get_achievement_reward(), //获取成就奖励
    "244" : new on_report_achievement(), //客户端发送成就消息
    "243" : new on_get_seven_data(), //获取7日登录信息
    "242" : new on_get_seven_reward(), //领取7日登录奖励
    "241" : new on_get_sign_data(), //获取30日签到数据
    "240" : new on_sign_in(), //30日签到
    "239" : new on_exchange_gift(), //兑换码兑换礼包
    "238" : new on_user_chat_data(), //用户发送聊天消息
    "236" : new on_get_user_info(), //获得用户信息
    "235" : new on_get_activity_states(), //获取活动状态
    "234" : new on_eat_chick(), //吃鸡
    "233" : new on_refresh_exlist(), //刷新兑换列表
    "232" : new on_exchange(), //兑换物品
    "231" : new on_sacrifice(), //参拜
    "230" : new on_get_challenge_town(), //获取挑战城池信息
    "229" : new on_set_town_guard(), //设置守城武将
    "228" : new on_gain_guard_town_reward(), //领取守城奖励
    "227" : new on_use_item(), //使用道具
    "225" : new on_sell_card_fragment(), //出售武将碎片
    "224" : new on_arena_data(), //查看竞技场中玩家本人的信息
    "222" : new on_gain_arena_reward(), //领取排行榜奖励
    "221" : new on_get_rank_role_detail(), //获取排行榜玩家阵型信息
    "220" : new on_get_rank_reward_data(), //获取排行榜玩家奖励信息
    "219" : new on_shop_data(), //获取商城数据
    "218" : new on_shop_buy(), //商城购买
    "217" : new on_account_rebind(),//快速登录账号重新绑定
    "216" : new on_get_exchange_list(), //获取兑换店列表
    "215" : new on_money_tree(), //招财
    "214" : new on_card_forge(), //武将炼化
    "213" : new on_get_share_reward(), //分享facebook获取元宝
    "212" : new on_get_one_town_data(), //获取单个城池信息

    "3000" : new on_test_town() //跳过关卡

};
exports.handler = handler;

var g_server;

exports.server = function(server)
{
    //初始化
    g_server = server;
    json_config_file.init();
    make_db.server(server);

    //数据，需要数据库
    play_name.init(server);
    mail_data.init(server);
    friend_data.init(server);
    formation_data.init(server);
    town_data.init(server);
    town_title_data.init(server);
    //数据
    arena_data.init();
    initialization_data.init();
    server_config_data.init();
    constant_data.init();
    card_data.init();

    gate_data.init();
    item_data.init();
    drop_data.init();
    role_exp_data.init();
    card_exp_data.init();
    recruit_data.init();
    activity_data.init();
    key_words_data.init();
    card_frag_data.init();
    explore_data.init();
    explore_event_data.init();
    purchase_shop_data.init();
    recharge_reward_data.init();
    login_reward_data.init();
    sign_reward_data.init();
    achievement_data.init();
    robot_data.init();
    gift_data.init();
    battle_field_data.init();
    shop_data.init();
    share_data.init();

    //逻辑
    billing_logic.init(server);
    login_logic.init(server);
    tick_logic.init(server);
    gm_billing_logic.init(server);
    gift_logic.init(server);
    town_logic.init(server);
    purchase_shop_logic.init(server);
    //释放对象
    json_config_file.json_config_file_list=null;

    //test.init(server);

};

/*var addon = require('../build/Release/hello');
setTimeout(function(){
    console.log(addon.hello());
    console.log(key_data.reg.test("李克强"));
    console.log(key_data.reg.test("李强"));
},5000);*/

function on_user_socket_connect()
{
	this.handle = function(s)
	{
        login_logic.on_user_socket_connect(s);
	}
}

function on_user_socket_close()
{
	this.handle = function(s)
	{
        login_logic.on_user_socket_close(s);
	}
}

function on_enter_game()
{
    this.handle=function(data,send,s)
    {
       login_logic.on_enter_game(data,send, s);
    }
}

function on_client_error()
{
    this.handle=function(data,send,s)
    {
        client_error_logic.on_client_error(data,send,s);
    }
}

function on_role_mail_list()
{
    this.handle=function(data,send,s)
    {
        mail_logic.on_role_mail_list(data,send,s);
    }
}

function on_user_login()
{
    this.handle = function(data,send,s)
    {
        login_logic.on_user_login(data,send,s);
    }
}

function on_create_role()
{
    this.handle = function(data,send,s)
    {
        login_logic.on_create_role(data,send,s);
    }
}

function on_user_reconnect()
{
    this.handle = function(data,send,s)
    {
        login_logic.on_user_reconnect(data,send,s);
    }
}

function on_alive()
{
    this.handle = function(data,send,s)
    {
        global.log("on_alive");
        s.nAliveTime = (new Date()).getTime();
    }
}

function on_random_name()
{
    this.handle =function(data,send,s)
    {
        login_logic.on_random_name(data,send,s);
    }
}

function on_gain_mail_reward()
{
    this.handle = function(data,send,s)
    {
        mail_logic.on_gain_mail_reward(data,send,s);
    }
}

function on_town_data_list()
{
    this.handle = function(data,send,s)
    {
        town_logic.on_town_data_list(data,send,s);
    }
}

function on_gate_data()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_gate_data(data,send,s);
    }
}

function on_test_town()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_test_town(data,send,s);
    }
}

function on_card_bag_data()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_card_bag_data(data,send,s);
    }
}

function on_item_bag_data()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_item_bag_data(data,send,s);
    }
}

function on_formation_data()
{
    this.handle = function(data,send,s)
    {
        formation_logic.on_formation_data(data,send,s);
    }
}

function on_fight_friend_data()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_fight_friend_data(data,send,s);
    }
}

function on_select_fight_friend()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_select_fight_friend(data,send,s);
    }
}

function on_friend_data_list()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_friend_data_list(data,send,s);
    }
}

function on_add_friend()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_add_friend(data,send,s);
    }
}

function on_delete_friend()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_delete_friend(data,send,s);
    }
}

function on_friend_request_list()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_friend_request_list(data,send,s);
    }
}

function on_clear_request_list()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_clear_request_list(data,send,s);
    }
}

function on_agree_request()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_agree_request(data,send,s);
    }
}

function on_refuse_request()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_refuse_request(data,send,s);
    }
}

function on_search_friend()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_search_friend(data,send,s);
    }
}

function on_friend_detail()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_friend_detail(data,send,s);
    }
}

function on_extend_bag()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_extend_bag(data,send,s);
    }
}

function on_formation_edit()
{
    this.handle = function(data,send,s)
    {
        formation_logic.on_formation_edit(data,send,s);
    }
}

function on_card_strengthen()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_card_strengthen(data,send,s);
    }
}

function on_card_forge()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_card_forge(data,send,s);
    }
}

function on_card_reborn()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_card_reborn(data,send,s);
    }
}

function on_get_notice_count()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.help_notice_role_msg(data,send,s);
    }
}

function on_add_stamina()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_add_stamina(data,send,s);
    }
}

function on_equip_upload()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_equip_upload(data,send,s);
    }
}

function on_gain_town_reward()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_gain_town_reward(data,send,s);
    }
}

function on_gate_reward_data()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_gate_reward_data(data,send,s);
    }
}


function on_gate_fight_result()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_gate_fight_result(data,send,s);
    }
}

function on_sell_items()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_sell_items(data,send,s);
    }
}

function on_sell_cards()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_sell_cards(data,send,s);
    }
}

function on_sweep_gate()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_sweep_gate(data,send,s);
    }
}

function on_reset_sweep()
{
    this.handle = function(data,send,s)
    {
        gate_logic.on_reset_sweep(data,send,s);
    }
}

function on_sell_card_fragment()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_sell_card_fragment(data,send,s);
    }
}

function on_buy_explore_count()
{
    this.handle = function(data,send,s)
    {
        shop_logic.on_buy_explore_count(data,send,s);
    }
}

function on_user_recruit_data()
{
    this.handle = function(data,send,s)
    {
        recruit_logic.on_user_recruit_data(data,send,s);
    }
}

function on_take_card()
{
    this.handle = function(data,send,s)
    {
        recruit_logic.on_take_card(data,send,s);
    }
}

function on_finish_rookie_guide()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_finish_rookie_guide(data,send,s);
    }
}

function on_ui_visited()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_ui_visited(data,send,s);
    }
}

function on_fight_revive()
{
    this.handle = function(data,send,s)
    {
        shop_logic.on_fight_revive(data,send,s);
    }
}

function on_card_piece_compose()
{
    this.handle = function(data,send,s)
    {
        card_logic.on_card_piece_compose(data,send,s);
    }
}

function on_equip_piece_compose()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_equip_piece_compose(data,send,s);
    }
}

function on_equip_compose()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_equip_compose(data,send,s);
    }
}

function on_add_exploration()
{
    this.handle = function(data,send,s)
    {
        explore_logic.on_add_exploration(data,send,s);
    }
}

function on_explore()
{
    this.handle = function(data,send,s)
    {
        explore_logic.on_explore(data,send,s);
    }
}

function on_buy_explore()
{
    this.handle = function(data,send,s)
    {
        explore_logic.on_buy_explore(data,send,s);
    }
}

function on_user_purchase_data()
{
    this.handle = function(data,send,s)
    {
        purchase_shop_logic.on_user_purchase_data(data,send,s);
    }
}

function on_apple_user_purchase()
{
    this.handle = function(data,send,s)
    {
        purchase_shop_logic.on_apple_user_purchase(data,send,s);
    }
}

function on_gp_user_purchase()
{
    this.handle = function(data,send,s)
    {
        purchase_shop_logic.on_gp_user_purchase(data,send,s);
    }
}

function on_get_achievement_data()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_get_achievement_data(data,send,s);
    }
}

function on_get_achievement_reward()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_get_achievement_reward(data,send,s);
    }
}

function on_report_achievement()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_report_achievement(data,send,s);
    }
}

function on_get_seven_data()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_get_seven_data(data,send,s);
    }
}

function on_get_seven_reward()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_get_seven_reward(data,send,s);
    }
}

function on_get_sign_data()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_get_sign_data(data,send,s);
    }
}

function on_sign_in()
{
    this.handle = function(data,send,s)
    {
        role_data_logic.on_sign_in(data,send,s);
    }
}

function on_exchange_gift()
{
    this.handle = function(data,send,s)
    {
        gift_logic.on_exchange_gift(data,send,s);
    }
}

function on_user_chat_data()
{
    this.handle = function(data,send,s)
    {
        chat_logic.on_user_chat_data(data,send,s);
    }
}

function on_get_user_info()
{
    this.handle = function(data,send,s)
    {
        friend_logic.on_get_user_info(data,send,s);
    }
}

function on_get_activity_states()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_get_activity_states(data,send,s);
    }
}

function on_eat_chick()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_eat_chick(data,send,s);
    }
}

function on_refresh_exlist()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_refresh_exlist(data,send,s);
    }
}

function on_exchange()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_exchange(data,send,s);
    }
}

function on_sacrifice()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_sacrifice(data,send,s);
    }
}

function on_money_tree()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_money_tree(data,send,s);
    }
}

function on_get_challenge_town()
{
    this.handle = function(data,send,s)
    {
        town_logic.on_get_challenge_town(data,send,s);
    }
}

function on_get_one_town_data()
{
    this.handle = function(data,send,s)
    {
        town_logic.on_get_one_town_data(data,send,s);
    }
}

function on_set_town_guard()
{
    this.handle = function(data,send,s)
    {
        town_logic.on_set_town_guard(data,send,s);
    }
}

function on_gain_guard_town_reward()
{
    this.handle = function(data,send,s)
    {
        town_logic.on_gain_guard_town_reward(data,send,s);
    }
}

function on_use_item()
{
    this.handle = function(data,send,s)
    {
        item_logic.on_use_item(data,send,s);
    }
}

function on_arena_data()
{
    this.handle = function(data,send,s)
    {
        arena_logic.on_arena_data(data,send,s);
    }
}

function on_gain_arena_reward()
{
    this.handle = function(data,send,s)
    {
        arena_logic.on_gain_arena_reward(data,send,s);
    }
}

function on_get_rank_role_detail()
{
    this.handle = function(data,send,s)
    {
        arena_logic.on_get_rank_role_detail(data,send,s);
    }
}

function on_get_rank_reward_data()
{
    this.handle = function(data,send,s)
    {
        arena_logic.on_get_rank_reward_data(data,send,s);
    }
}

function on_shop_data()
{
    this.handle = function(data,send,s)
    {
        shop_logic.on_shop_data(data,send,s);
    }
}

function on_shop_buy()
{
    this.handle = function(data,send,s)
    {
        shop_logic.on_shop_buy(data,send,s);
    }
}

function on_account_rebind()
{
    this.handle = function(data,send,s)
    {
        login_logic.on_account_rebind(data,send,s);
    }
}

function on_get_exchange_list()
{
    this.handle = function(data,send,s)
    {
        activity_logic.on_get_exchange_list(data,send,s);
    }
}

function on_get_share_reward()
{
    this.handle = function(data,send,s)
    {
        share_logic.on_get_share_reward(data,send,s);
    }
}


















