/***
 *
 * 关卡逻辑
 *
 */

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var gate_data=require("./gate_data");
var formation_data=require("./formation_data");
var card_data=require("./card_data");
var tn_data=require("./town_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var common_func = require("./common_func");
var friend_data = require("./friend_data");

var town_logic=require("./help_town_logic");
var arena_logic=require("./help_arena_logic");
var activity_logic=require("./help_activity_logic");
var drop_logic=require("./help_drop_logic");
var money_logic=require("./help_money_logic");
var role_data_logic=require("./help_role_data_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;


//关卡信息
function on_gate_data(data,send,s)
{
    global.log("on_gate_data");

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
    var id=data.id;
    if(id==undefined)
    {
        global.log("id==undefined");
        return;
    }

    var town_bag_data=role.town_bag[id];
    if(town_bag_data==undefined)
    {
        var msg = {
            "op" : msg_id.NM_GATE_DATA,
            "ret" : msg_code.TOWN_NOT_EXIST
        };
        send(msg);
        return;
    }
    var items=[];
    for(var key in town_bag_data.gate)
    {
        var gate_bag_data=town_bag_data.gate[key];
        var client_gate_data={};
        client_gate_data.id=gate_bag_data.gate_id;
        client_gate_data.finished=gate_bag_data.passed;

        if(!common_func.help_judge_today(gate_bag_data.s_date))
        {
            //重置次数
            gate_bag_data.s_date=new Date().getTime();
            gate_bag_data.sweep=0;
            gate_bag_data.s_reset=0;

        }
        client_gate_data.sweep=gate_bag_data.sweep;
        client_gate_data.reset=gate_bag_data.s_reset;
        items.push(client_gate_data);
    }


    var msg = {
        "op" : msg_id.NM_GATE_DATA,
        "sublevels" : items,
        "rewarded" :town_bag_data.rewarded,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_gate_data = on_gate_data;


//城池全部打开
function on_test_town(data,send,s)
{
    global.log("on_test_town");

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

    var town_bag_data=role.town_bag;

    for(var key in tn_data.town_data_list)
    {
        var town_json_data=tn_data.town_data_list[key];

        //开启新的城池
        var role_town_data=new ds.Role_Town_Data();

        role_town_data.tid=town_json_data.tid;
        role_town_data.passed=1;
        town_bag_data[role_town_data.tid]=role_town_data;

        for(var i=0;i<town_json_data.gate.length;i++)
        {
            var role_gate_data=new ds.Role_Gate_Data();
            role_gate_data.passed=1;
            role_gate_data.gate_id=town_json_data.gate[i];
            role_town_data.gate.push(role_gate_data);
        }
    }

    var msg = {
        "op" : msg_id.NM_TEST_TOWN,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_test_town",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_test_town = on_test_town;

//领取城池奖励
function on_gain_town_reward(data,send,s)
{
    global.log("on_gain_town_reward");

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

    var tid=data.instance_id;
    var town_bag_data=role.town_bag[tid];
    if(town_bag_data==undefined)
    {
        global.log("town_bag_data == undefined");
        return;
    }

    if(town_bag_data.rewarded==1)
    {
        var msg=
        {
            "op":msg_id.NM_GAIN_TOWN_REWARD,
            "ret" : msg_code.REWARD_IS_GAINED
        };
        send(msg);
        return;
    }


    var u_ids=[];
    if(town_bag_data.passed==1)
    {
        var _tn_data=tn_data.town_data_list[town_bag_data.tid];
        if(_tn_data==undefined)
        {
            global.log("_tn_data == undefined");
            return;
        }

        var is_flag=0;//是否发送通知
        for(var i=0;i<_tn_data.rewards.length;i++)
        {
            var gain_item=drop_logic.help_put_item_to_role(role,_tn_data.rewards[i].id,_tn_data.rewards[i].num,_tn_data.rewards[i].type);
            u_ids.push(gain_item.uids);
            if(gain_item.flag)
            {
                is_flag=1;
            }
        }

        if(is_flag)
        {
            role_data_logic.help_notice_role_msg(role,send);
        }
        town_bag_data.rewarded=1;

    }
    else
    {
        var msg=
        {
            "op":msg_id.NM_GAIN_TOWN_REWARD,
            "ret" : msg_code.TOWN_NOT_PASSED
        };
        send(msg);
        return;
    }

    user.nNeedSave=1;

    var msg=
    {
        "op":msg_id.NM_GAIN_TOWN_REWARD,
        "uids":u_ids,
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
        "stamina":role.stamina,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gain_town_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_gain_town_reward = on_gain_town_reward;

//预先计算关卡掉落
function on_gate_reward_data(data,send,s)
{
    global.log("on_gate_reward_data");
    var type=Number(data.type);
    if(type==undefined)
    {
        global.log("type==undefined");
        return;
    }

    switch (type)
    {
        case const_value.FIGHT_TYPE_GATE:
            help_gate_reward_data(data,send,s);
            break;
        case const_value.FIGHT_TYPE_TOWN:
            town_logic.help_town_reward_data(data,send,s);
            break;
        case const_value.FIGHT_TYPE_BATTLE:
            activity_logic.help_battle_reward_data(data,send,s);
            break;
        default :
            break;
    }
}
exports.on_gate_reward_data = on_gate_reward_data;

function help_gate_reward_data(data,send,s)
{
    global.log("help_gate_reward_data");
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

    var _gate_data=gate_data.gate_data_list[gate_id];
    var _town_data=tn_data.town_data_list[parent_id];
    if(_gate_data==undefined||_town_data==undefined)
    {
        global.log("_gate_data==undefined||_town_data==undefined");
        return;
    }

    if(role.level<_town_data.lv_limit)
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.LEVEL_TOO_LOW
        };
        send(msg);
        return;
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

    var is_first=1;
    var is_open=0; //该关卡是否已经开启
    var _town_bag_data=role.town_bag[parent_id];
    for(var i=0;i<_town_bag_data.gate.length;i++)
    {
        if(_town_bag_data.gate[i].gate_id==gate_id)
        {
            is_open=1;
            if(_town_bag_data.gate[i].sweep>=_gate_data.sweep_max)
            {
                var msg = {
                    "op" :msg_id.NM_WAR_REWARD_DATA,
                    "ret" : msg_code.SWEEP_TIMES_OVER
                };
                send(msg);
                return;
            }
            if(_town_bag_data.gate[i].passed)
            {
                is_first=0;
            }
            break;
        }
    }

    if(!is_open)
    {
        global.err("gate is not open!");
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.GATE_NOT_OPNE
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
    if(is_first)
    {
        for(var i=0;i<_gate_data.first_drop.length;i++)
        {
            drop_logic.help_gain_drop_data(_gate_data.first_drop[i],drops);
        }

        //经验结算
        var exp={};
        exp.type=const_value.REWARD_TYPE_EXP;
        exp.xid="";
        exp.num=_gate_data.first_exp;
        drops.push(exp);

        //铜钱结算
        var gold={};
        gold.type=const_value.REWARD_TYPE_MONEY;
        gold.xid="";
        gold.num=_gate_data.first_coin;
        drops.push(gold);
    }
    else
    {
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
    }

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

//关卡战斗结果数据
function on_gate_fight_result(data,send,s)
{
    global.log("on_gate_fight_result");

    var type=Number(data.type);
    if(type==undefined )
    {
        global.log("type==undefined");
        return;
    }

    switch (type)
    {
        case const_value.FIGHT_TYPE_GATE:
            help_gate_fight_result(data,send,s);
            break;
        case const_value.FIGHT_TYPE_TOWN:
            town_logic.help_town_fight_result(data,send,s);
            break;
        case const_value.FIGHT_TYPE_BATTLE:
            activity_logic.help_battle_fight_result(data,send,s);
            break;
        default :
            break;
    }
}
exports.on_gate_fight_result = on_gate_fight_result;

//普通关卡战斗结算
function help_gate_fight_result(data,send,s)
{
    global.log("help_gate_fight_result");
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
    var nonce=data.nonce; //验证码
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

        //开启下一关卡
        help_open_role_gate(role);

        //处理战斗结果

        //体力值结算
        role_data_logic.help_reduce_stamina(role,_gate_data.power_cost);
        var role_formation_data=formation_data.formation_list[role.grid];
        if(role_formation_data==undefined)
        {
            global.log("role_formation_data == undefined");
            return;
        }

        var old_hurt=role_formation_data.top_hurt;
        role_formation_data.top_hurt=old_hurt>single_hurt?old_hurt:single_hurt;
        //计算排行榜
        var ret_rank=arena_logic.help_count_hurt_rank(role.gid,role.grid,old_hurt,single_hurt);
        //积分值结算
        role.score+=Number(fight_user_data.score);
        //掉落结算
        var drops=fight_user_data.drops;
        for(var i=0;i<drops.length;i++)
        {
            var gain_item=drop_logic.help_put_item_to_role(role,drops[i].xid,drops[i].num,drops[i].type);
            drops[i].uids=gain_item.uids;
        }
        //清空战斗数据
        delete formation_data.fight_user_data_list[role.grid];
        user.nNeedSave=1;

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

    role_data_logic.help_notice_role_msg(role,send);
    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_fight_result",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_gate_fight_result = help_gate_fight_result;

//开启关卡
function help_open_role_gate(role)
{
    global.log("help_open_role_gate");

    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var fight_user_data=formation_data.fight_user_data_list[role.grid];

    var tid=fight_user_data.parent_id;
    var role_tn_bag=role.town_bag[tid];
    if(role_tn_bag==undefined)
    {
        global.log("role_tn_bag == undefined");
        return;
    }

    var is_exist=0;
    for(var i=0;i<role_tn_bag.gate.length;i++)
    {
        if(role_tn_bag.gate[i].gate_id==fight_user_data.gate_id)
        {
            is_exist=1;
            role_tn_bag.gate[i].sweep++;
            role_tn_bag.gate[i].s_date=new Date().getTime();
            if(role_tn_bag.gate[i].passed==1)
            {
                //已经过关
                return;
            }
            else
            {
                role_tn_bag.gate[i].passed=1;
                break;
            }
        }
    }
    if(!is_exist)
    {
        global.err("gate is not exist,fight_user_data.gate_id:"+fight_user_data.gate_id);
        return;
    }

    var tn_json_data=tn_data.town_data_list[tid];
    if(tn_json_data==undefined)
    {
        global.log("tn_json_data == undefined");
        return;
    }

    //区域关卡还存在
    if(tn_json_data.gate.length>role_tn_bag.gate.length)
    {
        //开启下一个关卡
        var role_gate_data=new ds.Role_Gate_Data();
        role_gate_data.is_first=1;
        role_gate_data.gate_id=tn_json_data.gate[role_tn_bag.gate.length];
        role_tn_bag.gate.push(role_gate_data);
    }
    else
    {
        role_tn_bag.passed=1;
        //开启城池地图
        town_logic.help_open_role_town(role,tid);
    }

    var log_content={};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_open_role_gate",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_open_role_gate = help_open_role_gate;

//关卡扫荡
function on_sweep_gate(data,send,s)
{
    global.log("on_sweep_gate");

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

    var num=data.num;
    var gate_id=data.gate_id;
    var town_id=data.town_id;

    if(num==undefined || gate_id==undefined || town_id==undefined)
    {
        global.log("num==undefined ||gate_id==undefined || town_id==undefined");
        return;
    }

    var _gate_data=gate_data.gate_data_list[gate_id];
    var _town_data=tn_data.town_data_list[town_id];
    if(_gate_data==undefined||_town_data==undefined)
    {
        global.log("_gate_data==undefined||_town_data==undefined");
        return;
    }

    if(Object.keys(role.card_bag).length>=role.cbag_limit)
    {
        var msg = {
            "op" :msg_id.NM_SWEEP_GATE,
            "ret" : msg_code.CARD_BAG_IS_FULL
        };
        send(msg);
        return;
    }

    var role_town_data=role.town_bag[town_id];
    if(role_town_data==undefined)
    {
        var msg = {
            "op" :msg_id.NM_SWEEP_GATE,
            "ret" : msg_code.GATE_NOT_PASSED
        };
        send(msg);
        return;
    }

    var is_passed=0;
    var role_gate_data;
    for(var i=0;i<role_town_data.gate.length;i++)
    {
        if(role_town_data.gate[i].gate_id==gate_id)
        {
            role_gate_data=role_town_data.gate[i];
            is_passed=role_gate_data.passed;
            break;
        }
    }

    if(!is_passed)
    {
        var msg = {
            "op" :msg_id.NM_SWEEP_GATE,
            "ret" : msg_code.GATE_NOT_PASSED
        };
        send(msg);
        return;
    }

    if(role_gate_data.sweep+num>_gate_data.sweep_max)
    {
        var msg = {
            "op" :msg_id.NM_SWEEP_GATE,
            "ret" : msg_code.SWEEP_TIMES_OVER
        };
        send(msg);
        return;
    }

    var cost_power=_gate_data.power_cost*num;

    //体力
    if(role.stamina<cost_power)
    {
        var msg = {
            "op" :msg_id.NM_SWEEP_GATE,
            "ret" : msg_code.POINT_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    //体力值结算
    role_data_logic.help_reduce_stamina(role,cost_power);


    var all_drops=[];

    for(var i=0;i<num;i++)
    {
        var drops=[];
        all_drops.push(drops);
        for(var j=0;j<_gate_data.common_drop.length;j++)
        {
            drop_logic.help_gain_drop_data(_gate_data.common_drop[j],drops);
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

        //结算掉落
        for(var x=0;x<drops.length;x++)
        {
            var gain_item=drop_logic.help_put_item_to_role(role,drops[x].xid,drops[x].num,drops[x].type);
            drops[x].uids=gain_item.uids;
        }

    }
    //次数结算
    role_gate_data.sweep+=num;
    role_gate_data.s_date=new Date().getTime();

    user.nNeedSave=1;

    var msg=
    {
        "op":msg_id.NM_SWEEP_GATE,
        "drops":all_drops,
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
        "stamina":role.stamina,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sweep_gate",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_sweep_gate = on_sweep_gate;

//重置扫荡
function on_reset_sweep(data,send,s)
{
    global.log("on_reset_sweep");

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

    var gate_id=data.gate_id;
    var town_id=data.town_id;

    if(gate_id==undefined || town_id==undefined)
    {
        global.log("gate_id==undefined || town_id==undefined");
        return;
    }
    var _gate_data=gate_data.gate_data_list[gate_id];
    if(_gate_data==undefined)
    {
        global.log("_gate_data==undefined");
        return;
    }

    var role_town_data=role.town_bag[town_id];
    if(role_town_data==undefined)
    {
        var msg = {
            "op" :msg_id.NM_RESET_SWEEP,
            "ret" : msg_code.GATE_NOT_PASSED
        };
        send(msg);
        return;
    }

    var role_gate_data;
    for(var i=0;i<role_town_data.gate.length;i++)
    {
        if(role_town_data.gate[i].gate_id==gate_id)
        {
            role_gate_data=role_town_data.gate[i];
            break;
        }
    }

    if(role_gate_data.s_reset>_gate_data.reset_max)
    {
        var msg = {
            "op" :msg_id.NM_RESET_SWEEP,
            "ret" : msg_code.RESET_TIMES_OVER
        };
        send(msg);
        return;
    }

    var cost_rmb=const_value.RESET_SWEEP_COST[role_gate_data.s_reset];
    var ok=money_logic.help_pay_rmb(role,cost_rmb);
    if(!ok)
    {
        var msg=
        {
            "op":msg_id.NM_RESET_SWEEP,
            "ret" : msg_code.RMB_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    role_gate_data.s_reset++;
    role_gate_data.sweep=0;
    user.nNeedSave=1;

    var msg=
    {
        "op":msg_id.NM_RESET_SWEEP,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "rmb":role.rmb,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_reset_sweep",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_reset_sweep = on_reset_sweep;

//购买扫荡
function help_get_drop_data_test(data,send,s)
{
    global.log("help_get_drop_data_test");

    var gate_id="gate0201";

    var _gate_data=gate_data.gate_data_list[gate_id];
    if(_gate_data==undefined)
    {
        global.log("_gate_data==undefined");
        return;
    }

    var all_drops=[];
    for(var i=0;i<1000;i++)
    {
        var drops=[];
        all_drops.push(drops);
        for(var j=0;j<_gate_data.common_drop.length;j++)
        {
            drop_logic.help_gain_drop_data(_gate_data.common_drop[j],drops);
        }

    }
    global.log("all_drops:"+JSON.stringify(all_drops));


}
exports.help_get_drop_data_test = help_get_drop_data_test;
