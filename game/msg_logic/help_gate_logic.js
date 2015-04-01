/***
 *
 * 关卡逻辑
 *
 */

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var gate_data=require("./gate_data");
var war_data=require("./war_data");
var formation_data=require("./formation_data");
var card_data=require("./card_data");
var card_exp_data=require("./card_exp_data");
var tn_data=require("./town_data");
var skill_data=require("./skill_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var common_func = require("./common_func");
var friend_data = require("./friend_data");

var card_logic=require("./help_card_logic");
var town_logic=require("./help_town_logic");
var arena_logic=require("./help_arena_logic");
var activity_logic=require("./help_activity_logic");
var drop_logic=require("./help_drop_logic");
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

    var fb_json_data=tn_data.town_data_list[id];
    if(fb_json_data==undefined)
    {
        var msg = {
            "op" : msg_id.NM_GATE_DATA,
            "ret" : msg_code.TOWN_NOT_EXIST
        };
        send(msg);
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

        for(var i=0;i<_tn_data.rewards.length;i++)
        {
            if(_tn_data.rewards[i].type==const_value.REWARD_TYPE_CARD && Object.keys(role.card_bag).length>=role.cbag_limit)
            {
                var msg = {
                    "op" :msg_id.NM_GAIN_TOWN_REWARD,
                    "ret" : msg_code.CARD_BAG_IS_FULL
                };
                send(msg);
                return;
            }

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
        "op" : msg_id.NM_ENTER_GAME,
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

    var skill_add=new Object();
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
        var f_formation_data=formation_data.formation_list[fight_user_data.friend_uid];
        if( f_formation_data==undefined)
        {
            global.log("f_formation_data==undefined");
            return;
        }
        var leader_f_card=f_formation_data.card_ls[0];
        var leader_f_json_card=card_data.card_data_list[leader_f_card.card_id];
        var leader_f_skill_data=skill_data.skill_data_list[leader_f_json_card.leader_skill];
        if(leader_f_skill_data && leader_f_skill_data.resource)
        {
            skill_add[leader_f_skill_data.resource]=leader_f_skill_data.percent;
        }
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
    var role_formation_data=formation_data.formation_list[role.grid];
    if(role_formation_data==undefined)
    {
        global.log("role_formation_data==undefined");
        return;
    }
    var leader_card=role_formation_data.card_ls[0];
    var leader_json_card=card_data.card_data_list[leader_card.card_id];
    var leader_skill_data=skill_data.skill_data_list[leader_json_card.leader_skill];

    if(leader_skill_data && leader_skill_data.resource)
    {
        if(skill_add[leader_skill_data.resource])
        {
            skill_add[leader_skill_data.resource]+=leader_skill_data.percent;
        }
        else
        {
            skill_add[leader_skill_data.resource]=leader_skill_data.percent;
        }

    }

    var drops=[];
    for(var i=0;i<_gate_data.war.length;i++)
    {
        var _war_data=war_data.war_data_list[_gate_data.war[i]];
        if(_war_data==undefined)
        {
            global.log("_war_data==undefined");
            return;
        }
        drops.push(help_get_war_drop_data(_war_data,skill_add,is_first));
    }

    fight_user_data.nonce=common_func.help_make_one_random(0,100);
    fight_user_data.parent_id=parent_id;
    fight_user_data.gate_id=gate_id;
    fight_user_data.drops=drops;

    //如果体力是满的，则倒计时从现在开始
    if(role.stamina>=const_value.STAMINA_MAX)
    {
        //预防延迟3秒
        role.time_stamina=(new Date().getTime()-3*1000);
    }

    //体力值结算
    role.stamina-=Number(_gate_data.power_cost);

    var msg=
    {
        "op":msg_id.NM_WAR_REWARD_DATA,
        "nonce":fight_user_data.nonce,
        "drops":drops,
        "ret" : msg_code.SUCC
    };
    send(msg);
    user.nNeedSave=1;

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "stamina":role.stamina,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));


    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_reward_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}

function help_get_war_drop_data(_war_data,skill_add,is_first)
{
    global.log("help_get_war_drop_data");

    if(_war_data==undefined)
    {
        global.log("_war_data==undefined");
        return;
    }

    var war_arr=[];
    //一场战役最多有三个怪物
    if(is_first)
    {
        for(var i=0;i<3;i++)
        {
            if(_war_data.boss[i])
            {
                //随机掉落结算
                var reward=[];
                if(_war_data.first_drop[i]!=0)
                {
                    reward=drop_logic.help_gain_drop_data(_war_data.first_drop[i]);
                }
                //经验结算
                var exp=new Object();
                exp.type=const_value.REWARD_TYPE_EXP;
                exp.xid="";
                exp.count=Number(_war_data.first_exp[i]);
                if(skill_add[exp.type])
                {
                    exp.count+=(exp.count*skill_add[exp.type]);
                }
                reward.push(exp);

                //铜钱结算
                var money=new Object();
                money.type=const_value.REWARD_TYPE_MONEY;
                money.xid="";
                money.count=Number(_war_data.first_coin[i]);
                if(skill_add[money.type])
                {
                    money.count+=(money.count*skill_add[money.type]);
                }
                reward.push(money);
                war_arr.push(reward);
            }
        }
    }
    else
    {
        for(var i=0;i<3;i++)
        {
            if(_war_data.boss[i])
            {
                //随机掉落结算
                var reward=[];
                if(_war_data.common_drop[i]!=0) //注意字符串"0"可以通过
                {
                    reward=drop_logic.help_gain_drop_data(_war_data.common_drop[i]);
                }

                //经验结算
                var exp=new Object();
                exp.type=const_value.REWARD_TYPE_EXP;
                exp.xid="";
                exp.count=Number(_war_data.common_exp[i]);
                if(skill_add[exp.type])
                {
                    exp.count+=(exp.count*skill_add[exp.type]);
                }
                reward.push(exp);

                //铜钱结算
                var money=new Object();
                money.type=const_value.REWARD_TYPE_MONEY;
                money.xid="";
                money.count=Number(_war_data.common_coin[i]);
                if(skill_add[money.type])
                {
                    money.count+=(money.count*skill_add[money.type]);
                }
                reward.push(money);
                war_arr.push(reward);
            }
        }
    }
    return  war_arr;
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

        //开启下一关卡
        help_open_role_gate(role);

        //处理战斗结果
        //武将经验
        var role_formation_data=formation_data.formation_list[role.grid];
        if(role_formation_data==undefined)
        {
            global.log("role_formation_data == undefined");
            return;
        }
        for(var i=0;i<role_formation_data.card_ls.length;i++)
        {
            var _card_data=role.card_bag[role_formation_data.card_ls[i].unique_id];
            card_logic.help_card_level_up(role,_card_data,_gate_data.exp);
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
            var drop_one_arr=drops[i];
            for(var j=0;j<drop_one_arr.length;j++)
            {
                for(var k=0;k<drop_one_arr[j].length;k++)
                {
                    if(drop_one_arr[j][k].type>=0)
                    {
                        var gain_item=drop_logic.help_put_item_to_role(role,drop_one_arr[j][k].xid,drop_one_arr[j][k].count,drop_one_arr[j][k].type);
                        drop_one_arr[j][k].uids=gain_item.uids;
                    }
                }
            }
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
            "op" : msg_id.NM_ENTER_GAME,
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

