/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-8-16
 * Time: 下午6:26
 * To change this template use File | Settings | File Templates.
 */
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var make_db = require("./make_db");
var ds = require("./data_struct");
var define_code = require("./define_code");
var formation = require("./formation_data");
var shop_data = require("./shop_data");

var comm_fun = require("./common_func");
var money_logic=require("./help_money_logic");
var drop_logic = require("./help_drop_logic");
var role_data_logic=require("./help_role_data_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var g_server = null;

/**
 * 初始化
 * @param s
 */
function init(s)
{
    g_server = s;
}
exports.init=init;

//获取商城数据
function on_shop_data(data,send,s)
{
    global.log("on_shop_data");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var list=[];

    for(var key in shop_data.shop_data_list)
    {
        var client_shop_data=new Object();
        client_shop_data.id=key;
        client_shop_data.times=0;
        var role_shop_data=role.shop_bag[key];

        if(role_shop_data)
        {
            if(!comm_fun.isEmpty(shop_data.shop_data_list[key].vip)||comm_fun.help_judge_today(role_shop_data.date))
            {
                client_shop_data.times=role_shop_data.times;
            }
        }

        list.push(client_shop_data);
    }

    var msg = {
        "op" : msg_id.NM_SHOP_DATA,
        "list":list,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_shop_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_shop_data = on_shop_data;

//购买商品
function on_shop_buy(data,send,s)
{
    global.log("on_shop_buy");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var shop_id=data.id;
    if(shop_id == undefined)
    {
        global.log("shop_id == undefined");
        return;
    }

    var _shop_data=shop_data.shop_data_list[shop_id];
    if(_shop_data == undefined)
    {
        global.log("_shop_data == undefined");
        return;
    }

    var role_shop_data=role.shop_bag[shop_id];
    if(role_shop_data==undefined)
    {
        role_shop_data=new ds.Role_Shop_Data();
        role_shop_data.id=shop_id;
        role_shop_data.date=(new Date()).getTime();
        role.shop_bag[shop_id]=role_shop_data;
    }

    var cost_rmb=0;
    if(!comm_fun.isEmpty(_shop_data.vip))
    {
        if(role_shop_data.times>=time_limit)
        {
            var msg = {
                "op" : msg_id.NM_SHOP_BUY,
                "ret" : msg_code.VIP_BUY_ONLY
            };
            send(msg);
            return;
        }

        //判断VIP等级
        if(role.vip<_shop_data.vip)
        {
            var msg = {
                "op" : msg_id.NM_SHOP_BUY,
                "ret" : msg_code.VIP_LEVEL_LOW
            };
            send(msg);
            return;
        }

        cost_rmb=_shop_data.cost;
    }
    else
    {
        //今天开始次数清零
        if(!comm_fun.help_judge_today(role_shop_data.date))
        {
            role_shop_data.times=0;
        }

        var time_limit=0;
        //包子
        if(shop_id=="dumpling")
        {
            time_limit=_shop_data.times_limited[role.vip];
            cost_rmb=_shop_data.cost[role_shop_data.times];
        }
        else
        {
            time_limit=_shop_data.times_limited;
            cost_rmb=_shop_data.cost;
        }

        if(role_shop_data.times>=time_limit)
        {
            var msg = {
                "op" : msg_id.NM_SHOP_BUY,
                "ret" : msg_code.TIME_IS_OVER
            };
            send(msg);
            return;
        }
    }

    var pay_ok=money_logic.help_pay_rmb(role,cost_rmb);
    var gain_item;
    if(pay_ok)
    {
        //获取购买物品
        gain_item=drop_logic.help_put_item_to_role(role,_shop_data.item_id,_shop_data.num,_shop_data.type);
        if(gain_item.flag)
        {
            role_data_logic.help_notice_role_msg(role,send);
        }

        //增加购买次数
        role_shop_data.times++;
        //更新时间
        role_shop_data.date=(new Date()).getTime();
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_SHOP_BUY,
            "ret" : msg_code.RMB_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_SHOP_BUY,
        "uids":gain_item.uids,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "exp" : role.exp ,
        "level":role.level,
        "gold":role.gold, //游戏币
        "rmb":role.rmb ,//金币(人民币兑换)
        "score":role.score,
        "stamina":role.stamina, //体力
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_shop_buy",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_shop_buy = on_shop_buy;


//购买探索次数
function on_buy_explore_count(data,send,s)
{
    global.log("on_buy_explore_count");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    //今天开始次数清零
    if(!comm_fun.help_judge_today(role.explore_date))
    {
        role.explore_times=0;
    }

    var cost_rmb=0;
    if(role.explore_times<const_value.EXPLORE_COST.length)
    {
        cost_rmb=Number(const_value.EXPLORE_COST[role.explore_times]);
    }
    else
    {
        cost_rmb=Number(const_value.EXPLORE_COST[const_value.EXPLORE_COST.length-1]);
    }


    var pay_ok=money_logic.help_pay_rmb(role,cost_rmb);
    if(pay_ok)
    {
        role.explore=const_value.EXPLORE_INIT_LIMIT;
        //增加购买次数
        role.explore_times++;
        //更新时间
        role.explore_date=(new Date()).getTime();
        //成就
        //role.achievement[const_value.ACHI_TYPE_BUY_EXPLORE].times++;
        user.nNeedSave=1;

        var msg = {
            "op" : msg_id.NM_BUY_EXPLORE_COUNT,
            "ret" : msg_code.SUCC
        };
        send(msg);

    }
    else
    {
        var msg = {
            "op" : msg_id.NM_BUY_EXPLORE_COUNT,
            "ret" : msg_code.RMB_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "rmb":role.rmb ,//
        "explore":role.explore,
        "explore_buy":role.explore_times,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_buy_explore_count",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_buy_explore_count = on_buy_explore_count;

//购买战斗复活
function on_fight_revive(data,send,s)
{
    global.log("on_fight_revive");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var seq= Number(data.seq);
    if(seq == undefined)
    {
        global.log("seq == undefined");
        return;
    }

    var fight_user_data=formation.fight_user_data_list[role.grid];
    if(fight_user_data==undefined)
    {
        global.log("fight_user_data == undefined");
        return;
    }

    if(seq>fight_user_data.seq)
    {
        var cost_rmb=const_value.FIGHT_RELIVE_COST;
        var pay_ok=money_logic.help_pay_rmb(role,cost_rmb);
        if(pay_ok)
        {
            var msg = {
                "op" : msg_id.NM_FIGHT_REVIVE,
                "ret" : msg_code.SUCC
            };
            send(msg);

            fight_user_data.seq=seq;
            user.nNeedSave=1;

            //推送客户端全局修改信息
            var g_msg = {
                "op" : msg_id.NM_USER_DATA,
                "rmb":role.rmb ,
                "ret" :msg_code.SUCC
            };
            send(g_msg);
            global.log(JSON.stringify(g_msg));
        }
        else
        {
            var msg = {
                "op" : msg_id.NM_FIGHT_REVIVE,
                "ret" : msg_code.RMB_NOT_ENOUGH
            };
            send(msg);
            return;
        }
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_FIGHT_REVIVE,
            "ret" : msg_code.SUCC
        };
        send(msg);
    }

    var log_content={};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_fight_revive",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_fight_revive = on_fight_revive;

