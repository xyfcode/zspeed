/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-30
 * Time: 下午4:13
 * To change this template use File | Settings | File Templates.
 */

var define_code = require("./define_code");
var friend_data = require("./friend_data");
var gate_data=require("./gate_data");
var card_data=require("./card_data");
var activity_data = require("./activity_data");
var battle_field_data = require("./battle_field_data");
var formation_data=require("./formation_data");
var make_db = require("./make_db");
var ds = require("./data_struct");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var card_logic = require("./help_card_logic");
var arena_logic = require("./help_arena_logic");
var role_data_logic = require("./help_role_data_logic");
var common_func = require("./common_func");
var drop_logic = require("./help_drop_logic");
var money_logic = require("./help_money_logic");


var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var g_server = null;

exports.init = function(s)
{
    g_server = s;
};

//获取活动状态
function on_get_activity_states(data,send,s)
{
    global.log("on_get_activity_states");

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

    var msg={
        "op" : msg_id.NM_GET_ACTIVITY_STATES,
        "lunch" : 0,
        "dinner" : 0,
        "snack" : 0,
        "visit_max" : 0,
        "visit_now" : 0,
        "can_visit" : 0,
        "e_count" : 0,
        "e_time" : 0,
        "battle" :[],
        "ret" : msg_code.SUCC
    };

    //现在时间
    var now_time=(new Date()).getTime();

    //获取吃鸡状态
    if(common_func.help_judge_today(role.chick_time))
    {
        var chick_hour=(new Date(role.chick_time)).getHours();
        if(chick_hour==12)
        {
            msg.lunch=1;
        }
        else if(chick_hour==18||chick_hour==19)
        {
            msg.dinner=1;
        }
        else if(chick_hour==21||chick_hour==22)
        {
            msg.snack=1;
        }
    }

    //获取参拜状态
    var _sacrifice_data=activity_data.sacrifice_data_list[role.sacrifice.id];
    if(common_func.help_judge_today(role.sacrifice.date))
    {
        msg.visit_max=_sacrifice_data.times;
        msg.visit_now=role.sacrifice.times;
        msg.can_visit=0;
    }
    else if(role.sacrifice.times>=_sacrifice_data.times)
    {
        //开启新祭拜
        role.sacrifice.times=msg.visit_now=0;
        role.sacrifice.id=_sacrifice_data.next_id;
        msg.visit_max=activity_data.sacrifice_data_list[role.sacrifice.id].times;
        msg.can_visit=1;
        user.nNeedSave=1;
    }
    else
    {
        msg.visit_max=_sacrifice_data.times;
        msg.visit_now=role.sacrifice.times;
        msg.can_visit=1;
    }

    //获取探索状态
    var _millisecond_diff = now_time - role.time_explore;
    var _explore = Math.floor(_millisecond_diff/1000/60/const_value.EXPLORE_TICK);


    if(_explore >0)
    {
        if((role.explore + _explore) > const_value.EXPLORE_INIT_LIMIT)
        {
            role.explore = const_value.EXPLORE_INIT_LIMIT;
            role.time_explore = now_time;
        }
        else
        {
            role.explore += _explore;
            role.time_explore +=_explore*60*1000*const_value.EXPLORE_TICK;
            msg.e_time=const_value.EXPLORE_TICK*60*1000-(now_time - role.time_explore);
        }
        user.nNeedSave=1;
    }
    else
    {
        //恢复探索需要的时间
        msg.e_time=const_value.EXPLORE_TICK*60*1000-_millisecond_diff;
    }
    msg.e_count=role.explore;

    //获取战场活动
    for(var key in role.battle_bag)
    {
        var role_battle_data=role.battle_bag[key];
        var battle_json_data=battle_field_data.battle_field_data_list[key];
        if(role_battle_data==undefined||battle_json_data==undefined)
        {
            global.log("role_battle_data == undefined||battle_json_data==undefined");
            return;
        }

        var client_obj={};
        client_obj.xid=key;
        client_obj.gates=[];

        for(var i=0;i<battle_json_data.gate.length;i++)
        {
            var obj={};
            obj.gate_id=battle_json_data.gate[i];
            obj.times=Number(battle_json_data.count_limit[i]);

            for(var j=0;j<role_battle_data.gate.length;j++)
            {
                if(role_battle_data.gate[j].gate_id==obj.gate_id)
                {
                    if(!common_func.help_judge_today(role_battle_data.gate[j].date))
                    {
                        //次数重置
                        role_battle_data.gate[j].times=0;
                    }
                    obj.times-=role_battle_data.gate[j].times;
                }
            }

            client_obj.gates.push(obj);
        }

        msg.battle.push(client_obj);

    }

    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_activity_states",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_activity_states = on_get_activity_states;

//吃鸡恢复体力
function on_eat_chick(data,send,s)
{
    global.log("on_eat_chick");

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


    //12点-13点 第一阶段
    //18点-20点 第二阶段
    //21点-23点 第三阶段
    //恢复40点体力
    var now = new Date();
    var now_hour = now.getHours();

    if((now_hour==12)||(now_hour>=18&&now_hour<20)||(now_hour>=21&&now_hour<23))
    {
        global.log("it is on time.");

        var last_date = new Date(role.chick_time);
        var last_hour = last_date.getHours();

        //达到领取时间
        if(!common_func.help_judge_today(role.chick_time) || ((last_hour==12&&now_hour>=18)||(last_hour>=18&&last_hour<20&&now_hour>=21)))
        {
            role.chick_time = now.getTime();
            role.stamina += const_value.CHICK_ADD;

            var msg = {
                "op" : msg_id.NM_EAT_CHICK,
                "ret" : msg_code.SUCC
            };
            send(msg);
            user.nNeedSave = 1;

            //推送客户端全局修改信息
            var g_msg = {
                "op" : msg_id.NM_USER_DATA,
                "stamina":role.stamina, //体力
                "ret" :msg_code.SUCC
            };
            send(g_msg);
            global.log(JSON.stringify(g_msg));

        }
        else
        {
            var msg = {
                "op" : msg_id.NM_EAT_CHICK,
                "ret" : msg_code.CHICK_IS_USED
            };
            send(msg);
        }
    }
    else
    {
        //时间未到
        var msg = {
            "op" : msg_id.NM_EAT_CHICK,
            "ret" : msg_code.CHICK_NOT_TIME
        };
        send(msg);
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_eat_chick",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_eat_chick = on_eat_chick;

//刷新兑换列表
function on_refresh_exlist(data,send,s)
{
    global.log("on_refresh_exlist");

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

    var type=data.type;


    if(type==1)
    {
        //时间到了，自动刷新
        var now_time=(new Date()).getTime();
        var diff=now_time-role.exchange.date;

        if(diff+60000-const_value.EXCHANGE_MS>=0)
        {
            role.exchange.date=now_time;
            role.exchange.ex_list=help_refresh_exchange_data();
        }
        else
        {
            global.log("on_refresh_exlist error:"+(diff-const_value.EXCHANGE_MS));
            var msg = {
                "op" : msg_id.NM_REFRESH_EXLIST,
                "ret" : msg_code.EMPTY_ERROR
            };
            send(msg);
            return;
        }
    }
    else if(type==2)
    {
        //花费元宝刷新
        var pay_ok=money_logic.help_pay_rmb(role,const_value.EXCHANGE_COST);
        if(pay_ok)
        {
            role.exchange.ex_list=help_refresh_exchange_data();

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
                "op" : msg_id.NM_REFRESH_EXLIST,
                "ret" : msg_code.RMB_NOT_ENOUGH
            };
            send(msg);
            return;
        }
    }


    var msg = {
        "op" : msg_id.NM_REFRESH_EXLIST,
        "exlist":role.exchange.ex_list,
        "ret" : msg_code.SUCC
    };
    send(msg);

    user.nNeedSave=1;

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_refresh_exlist",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_refresh_exlist = on_refresh_exlist;

//兑换物品
function on_exchange(data,send,s)
{
    global.log("on_exchange");

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

    var index=Number(data.index);
    if(index==undefined)
    {
        global.log("index == undefined");
        return;
    }
    var role_ex_date=role.exchange.ex_list[index];
    if(role_ex_date==undefined)
    {
        global.log("role_ex_date == undefined");
        return;
    }

    global.log("role_ex_date:"+JSON.stringify(role_ex_date));

    if(role_ex_date.state)
    {
        var msg = {
            "op" : msg_id.NM_EXCHANGE,
            "ret" : msg_code.EXCHANGE_USED
        };
        send(msg);
        return;
    }

    var ex_json_data=activity_data.exchange_data_list[role_ex_date.exid];
    if(ex_json_data==undefined)
    {
        global.log("ex_json_data == undefined");
        return;
    }
    global.log("ex_json_data:"+JSON.stringify(ex_json_data));
    if(role.score<ex_json_data.cost)
    {
        var msg = {
            "op" : msg_id.NM_EXCHANGE,
            "ret" : msg_code.SCORE_NOT_ENOUGH
        };
        send(msg);
        return;
    }


    //成功
    role_ex_date.state=1;
    role.score-=ex_json_data.cost;
    var gain_item=drop_logic.help_put_item_to_role(role,ex_json_data.item_id,ex_json_data.num,ex_json_data.item_type);
    if(gain_item.flag)
    {
        role_data_logic.help_notice_role_msg(role,send);
    }
    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_EXCHANGE,
        "uids" : gain_item.uids,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "exp" : role.exp ,
        "level":role.level,
        "gold":role.gold,
        "rmb":role.rmb ,
        "score":role.score,
        "stamina":role.stamina, //体力
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_exchange",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_exchange = on_exchange;

//获取兑换店列表
function on_get_exchange_list(data,send,s)
{
    global.log("on_get_exchange_list");

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

    var msg = {
        "op" : msg_id.NM_GET_EXCHANGE_LIST,
        "ret" : msg_code.SUCC
    };

    //现在时间
    var now_time=(new Date()).getTime();

    //更新兑换列表
    var time_diff=now_time-role.exchange.date;

    if(time_diff>const_value.EXCHANGE_MS)
    {
        //刷新
        msg.exlist=help_refresh_exchange_data();
        var times=0;  //倍率
        do
        {
            time_diff-=const_value.EXCHANGE_MS;
            times++;
        }while(time_diff>const_value.EXCHANGE_MS);
        msg.ex_time=const_value.EXCHANGE_MS-time_diff;

        role.exchange.ex_list=msg.exlist;
        role.exchange.date+=times*const_value.EXCHANGE_MS;
        user.nNeedSave=1;
    }
    else
    {
        //时间未到，不刷新
        msg.ex_time=const_value.EXCHANGE_MS-time_diff;
        msg.exlist=role.exchange.ex_list;
    }

    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_exchange_list",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_exchange_list = on_get_exchange_list;

//参拜
function on_sacrifice(data,send,s)
{
    global.log("on_sacrifice");

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

    var items=[];//奖励
    var role_sacrifice_data=role.sacrifice;
    if(role_sacrifice_data==undefined)
    {
        global.log("role_sacrifice_data == undefined");
        return;
    }
    global.log("role_sacrifice_data:"+JSON.stringify(role_sacrifice_data));

    if(common_func.help_judge_today(role_sacrifice_data.date))
    {
        var msg = {
            "op" : msg_id.NM_SACRIFICE,
            "ret" : msg_code.SACRIFICE_USED
        };
        send(msg);
        return;
    }

    var sacrifice_json_data=activity_data.sacrifice_data_list[role_sacrifice_data.id];
    if(sacrifice_json_data==undefined)
    {
        global.log("sacrifice_json_data == undefined");
        return;
    }

    role_sacrifice_data.times++;
    role_sacrifice_data.date=(new Date()).getTime();

    var drop_arr=[];

    //祭拜次数达到
    var is_notify=0;
    if(role_sacrifice_data.times>=sacrifice_json_data.times)
    {
        var drop_id=sacrifice_json_data.drop_id;
        drop_logic.help_gain_drop_data(drop_id,drop_arr);

        for(var i=0;i<drop_arr.length;i++)
        {
            var gain_item=drop_logic.help_put_item_to_role(role,drop_arr[i].xid,drop_arr[i].num,drop_arr[i].type);
            drop_arr[i].uids=gain_item.uids;
            if(gain_item.flag)
            {
                is_notify=1;
            }
        }
        if(is_notify)
        {
            role_data_logic.help_notice_role_msg(role,send);
        }
    }

    var gain_gold=sacrifice_json_data.gold;
    if(gain_gold)
    {
        var gold_item={};
        gold_item.type=const_value.REWARD_TYPE_MONEY;
        gold_item.xid="";
        gold_item.uids=[];
        gold_item.num=gain_gold;
        drop_arr.push(gold_item);

        //金钱结算
        money_logic.help_gain_money(role,gain_gold);
    }

    var msg = {
        "op" : msg_id.NM_SACRIFICE,
        "items":drop_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    user.nNeedSave=1;

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "exp" : role.exp ,
        "level":role.level,
        "gold":role.gold,
        "rmb":role.rmb ,
        "score":role.score,
        "stamina":role.stamina, //体力
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sacrifice",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_sacrifice = on_sacrifice;

//招财
function on_money_tree(data,send,s)
{
    global.log("on_money_tree");

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

    var type=data.type;
    if(type==undefined)
    {
        global.log("type == undefined");
        return;
    }

    if(role.tree_times>=const_value.MT_VIP_TIMES[role.vip])
    {
        var msg = {
            "op" : msg_id.NM_MONEY_TREE,
            "ret" : msg_code.MONTY_TREE_USED
        };
        send(msg);
        return;
    }

    var crit_arr=[];
    //花费的金钱
    var cost_rmb=0;
    var gain_money=0;
    var times=0;
    if(type==1)
    {
        cost_rmb=const_value.MT_COST[role.tree_times];
        var rand=common_func.help_make_one_random(1,10);
        if(rand<=const_value.MT_Crit_LOW)
        {
            crit_arr.push(const_value.MT_LOW_GAIN);
            gain_money+=const_value.MT_GOLD*const_value.MT_LOW_GAIN;
        }
        else if(rand<=const_value.MT_Crit_HIGH)
        {
            crit_arr.push(const_value.MT_HIGH_GAIN);
            gain_money+=const_value.MT_GOLD*const_value.MT_HIGH_GAIN;
        }
        else
        {
            crit_arr.push(1);
            gain_money+=const_value.MT_GOLD;
        }
        times++;
    }
    else
    {
        var left_times=const_value.MT_VIP_TIMES[role.vip]-role.tree_times;
        for(var i=0;i<left_times;i++)
        {
            cost_rmb+=const_value.MT_COST[role.tree_times+i];
            var rand=common_func.help_make_one_random(1,10);
            //注意是<=不是<
            if(rand<=const_value.MT_Crit_LOW)
            {
                crit_arr.push(const_value.MT_LOW_GAIN);
                gain_money+=const_value.MT_GOLD*const_value.MT_LOW_GAIN;
            }
            else if(rand<=const_value.MT_Crit_HIGH)
            {
                crit_arr.push(const_value.MT_HIGH_GAIN);
                gain_money+=const_value.MT_GOLD*const_value.MT_HIGH_GAIN;
            }
            else
            {
                crit_arr.push(1);
                gain_money+=const_value.MT_GOLD;
            }
            times++;
        }

    }

    var pay_ok=money_logic.help_pay_rmb(role,cost_rmb);
    if(!pay_ok)
    {
        var msg = {
            "op" : msg_id.NM_MONEY_TREE,
            "ret" : msg_code.RMB_NOT_ENOUGH
        };
        send(msg);
        return;
    }


    //结果核算
    role.tree_times+=times;
    role.tree_date+=times;
    money_logic.help_gain_money(role,gain_money);

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_MONEY_TREE,
        "extra":crit_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);



    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "rmb":role.rmb,
        "gold":role.gold,
        "used_money_tree":role.tree_times,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_money_tree",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_money_tree = on_money_tree;

function help_battle_reward_data(data,send,s)
{
    global.log("help_battle_reward_data");
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

    if(Object.keys(role.card_bag).length>=role.cbag_limit)
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.BAG_IS_FULL
        };
        send(msg);
        return;
    }

    var gate_id=data.gate_id;
    var parent_id=data.parent_id;
    if(gate_id==undefined || parent_id==undefined)
    {
        global.log("gate_id==undefined || parent_id==undefined");
        return;
    }

    //条件判断
    var role_battle_data=role.battle_bag[parent_id];
    var battle_json_data=battle_field_data.battle_field_data_list[parent_id];
    if(role_battle_data==undefined||battle_json_data==undefined)
    {
        global.log("role_battle_data == undefined||battle_json_data==undefined");
        return;
    }
    var _gate_data=gate_data.gate_data_list[gate_id];
    if(_gate_data==undefined)
    {
        global.log("_gate_data==undefined");
        return;
    }

    for(var i=0;i<battle_json_data.gate.length;i++)
    {
        if(battle_json_data.gate[i]==gate_id)
        {
            //等级判断
            if(battle_json_data.lv_limit[i]>role.level)
            {
                var msg = {
                    "op" :msg_id.NM_WAR_REWARD_DATA,
                    "ret" : msg_code.LEVEL_TOO_LOW
                };
                send(msg);
                return;
            }
            //次数判断
            for(var j=0;j<role_battle_data.gate.length;j++)
            {
                if(role_battle_data.gate[j].gate_id==gate_id&&battle_json_data.count_limit[i]<=role_battle_data.gate[j].times)
                {
                    var msg = {
                        "op" :msg_id.NM_WAR_REWARD_DATA,
                        "ret" : msg_code.TIME_IS_OVER
                    };
                    send(msg);
                    return;
                }
            }

            break;
        }
    }

    //体力
    if(role.stamina<Number(_gate_data.power_cost))
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.POINT_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    //缓存奖励数据
    var fight_user_data=formation_data.fight_user_data_list[role.grid];
    if(fight_user_data==undefined)
    {
        fight_user_data=new formation_data.FightUserData();
        fight_user_data.gid=role.gid;
        fight_user_data.grid=role.grid;
        formation_data.fight_user_data_list[role.grid]=fight_user_data;
    }

    //好友
    if(fight_user_data.is_friend)
    {
        var me_friend_data=friend_data.friend_data_list[role.grid];
        for(var i=0;i<me_friend_data.friends.length;i++)
        {
            if(me_friend_data.friends[i].grid==fight_user_data.friend_uid)
            {
                me_friend_data.friends[i].f_time=(new Date()).getTime();
                friend_data.friend_update_db_list.push(role.grid);
                break;
            }
        }
        fight_user_data.score=const_value.FRIEND_SCORE;
    }
    else
    {
        if(fight_user_data.friend_uid)
        {
            fight_user_data.score=const_value.USER_SCORE;
        }
        else
        {
            fight_user_data.score=0; //没有添加好友操作
        }
    }

    var drops=[];
    for(var i=0;i<_gate_data.common_drop.length;i++)
    {
        drop_logic.help_gain_drop_data(_gate_data.common_drop[i],drops);
    }

    //经验结算
    var exp={};
    exp.type=const_value.REWARD_TYPE_EXP;
    exp.xid="";
    exp.num=_gate_data.common_exp;
    drops.push(exp);

    //铜钱结算
    var gold={};
    gold.type=const_value.REWARD_TYPE_MONEY;
    gold.xid="";
    gold.num=_gate_data.common_coin;
    drops.push(gold);

    fight_user_data.nonce=common_func.help_make_one_random(0,100);
    fight_user_data.parent_id=parent_id;
    fight_user_data.gate_id=gate_id;
    fight_user_data.drops=drops;

    var msg=
    {
        "op":msg_id.NM_WAR_REWARD_DATA,
        "nonce":fight_user_data.nonce,
        "drops":drops,
        "ret" : msg_code.SUCC
    };
    send(msg);
    user.nNeedSave=1;

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_reward_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.help_battle_reward_data = help_battle_reward_data;


//活动战场战斗结算
function help_battle_fight_result(data,send,s)
{
    global.log("help_battle_fight_result");
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

    var win=data.win;
    var nonce=data.nonce; //伤害值
    if(win == undefined || nonce == undefined)
    {
        global.log("win == undefined || nonce == undefined");
        return;
    }

    //战斗胜利
    if(win)
    {

        var single_hurt=Number(data.singled); // 本次最佳当次伤害
        if(single_hurt == undefined)
        {
            global.log("single_hurt == undefined");
            return;
        }

        var fight_user_data=formation_data.fight_user_data_list[role.grid];
        if(fight_user_data==undefined)
        {
            global.log("fight_user_data==undefined");
            return;
        }

        if(nonce!=fight_user_data.nonce)
        {
            global.log("nonce!=fight_user_data.nonce");
            return;
        }

        var _gate_data=gate_data.gate_data_list[fight_user_data.gate_id];
        if(_gate_data==undefined)
        {
            global.log("_gate_data==undefined");
            return;
        }

        //处理战斗结果
        var role_formation_data=formation_data.formation_list[role.grid];
        if(role_formation_data==undefined)
        {
            global.log("role_formation_data == undefined");
            return;
        }
        var role_battle_data=role.battle_bag[fight_user_data.parent_id];
        if(role_battle_data==undefined)
        {
            global.log("role_battle_data==undefined");
            return;
        }
        var old_hurt=role_formation_data.top_hurt;
        role_formation_data.top_hurt=old_hurt>single_hurt?old_hurt:single_hurt;
        //计算排行榜
        var ret_rank=arena_logic.help_count_hurt_rank(role.gid,role.grid,old_hurt,single_hurt);

        var is_exist=0;
        for(var i=0;i<role_battle_data.gate.length;i++)
        {
            if(role_battle_data.gate[i].gate_id==fight_user_data.gate_id)
            {
                is_exist=1;
                role_battle_data.gate[i].times++;
                role_battle_data.gate[i].date=(new Date()).getTime();
            }
        }

        if(!is_exist)
        {
            var _battle_gate_data=new ds.Role_Battle_Gate_Data();
            _battle_gate_data.gate_id=fight_user_data.gate_id;
            _battle_gate_data.times++;
            _battle_gate_data.date=(new Date()).getTime();
            role_battle_data.gate.push(_battle_gate_data);
        }

        //积分值结算
        role.score+=Number(fight_user_data.score);
        //掉落结算
        var drops=fight_user_data.drops;
        for(var i=0;i<drops.length;i++)
        {
            var gain_item=drop_logic.help_put_item_to_role(role,drops[i].xid,drops[i].num,drops[i].type);
            drops[i].uids=gain_item.uids;
        }
        //体力值结算
        role_data_logic.help_reduce_stamina(role,_gate_data.power_cost);

        var msg=
        {
            "op":msg_id.NM_GATE_FIGHT_RESULT,
            "drops":drops,
            "single_lb":ret_rank.new_rank,
            "old_single_lb":ret_rank.old_rank,
            "exceed":ret_rank.exceed,
            "ret" : msg_code.SUCC
        };
        send(msg);

        //清空战斗数据
        delete formation_data.fight_user_data_list[role.grid];
        user.nNeedSave=1;

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_USER_DATA,
            "exp" : role.exp ,
            "level":role.level,
            "gold":role.gold,
            "rmb":role.rmb ,
            "score":role.score,
            "stamina":role.stamina,
            "hurt":role_formation_data.top_hurt, //伤害
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));


        role_data_logic.help_notice_role_msg(role,send);
    }
    else
    {
        //清空战斗数据 (战斗失败)
        delete formation_data.fight_user_data_list[role.grid];

        var msg=
        {
            "op":msg_id.NM_GATE_FIGHT_RESULT,
            "ret" : msg_code.SUCC
        };
        send(msg);
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_fight_result",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_battle_fight_result = help_battle_fight_result;

//刷新兑换列表
var help_refresh_exchange_data=function()
{
    global.log("help_refresh_exchange_data");

    var ex_arr=[];

    var nums=common_func.help_make_random(const_value.EXCHANGE_LIST_NUM,1,10000);
    for(var i=0;i<nums.length;i++)
    {
        //概率获取物品
        for(var j=activity_data.exchange_data_arr.length-1;j>=0;j--)
        {
            if((j==0)||(nums[i]>activity_data.exchange_data_arr[j-1].weight&&nums[i]<=activity_data.exchange_data_arr[j].weight))
            {
                var obj=new Object();
                obj.exid=activity_data.exchange_data_arr[j].id;
                obj.state=0;
                ex_arr.push(obj);
                break;
            }
        }
    }
    return ex_arr;
};

//初始化创建活动数据
var help_init_activity_data=function(role)
{
    global.log("help_init_activity_data");
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }
    //参拜结构
    for(var key in activity_data.sacrifice_data_list)
    {
        role.sacrifice=new ds.Sacrifice_Data();
        role.sacrifice.id=activity_data.sacrifice_data_list[key].id;
        break;
    }

    //兑换结构
    role.exchange=new ds.Exchange_Data();
    role.exchange.date=(new Date()).getTime();
    role.exchange.ex_list=help_refresh_exchange_data();

    //战场结构
    for(var key in battle_field_data.battle_field_data_list)
    {
        var _battle_data=new ds.Role_Battle_Data();
        _battle_data.battle_id=key;
        role.battle_bag[key]=_battle_data;
    }

};
exports.help_init_activity_data=help_init_activity_data;























