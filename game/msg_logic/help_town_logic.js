/***
 *
 * 城池逻辑
 *
 */

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var make_db = require("./make_db");
var town_data=require("./town_data");
var town_title_data=require("./town_title_data");
var formation=require("./formation_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var common_func = require("./common_func");
var friend_data = require("./friend_data");

var arena_logic=require("./help_arena_logic");
var mail_logic=require("./help_mail_logic");
var money_logic=require("./help_money_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server=null;
function init(s)
{
    g_server = s;
}
exports.init=init;

//开启城池
function help_open_role_town(role,tid)
{
    global.log("help_open_role_town");

    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var town_bag_data=role.town_bag;
    if(tid == undefined)
    {
        global.log("tid == undefined");
        return;
    }

    var next_tid=town_data.town_data_list[tid].next_tid;
    if(!next_tid)
    {
        global.log("next_tid == undefined");
        return;
    }
    var town_json_data=town_data.town_data_list[next_tid];

    if(town_json_data)
    {
        //开启新的城池
        var role_town_data=new ds.Role_Town_Data();

        role_town_data.tid=town_json_data.tid;
        town_bag_data[role_town_data.tid]=role_town_data;

        var role_gate_data=new ds.Role_Gate_Data();
        role_gate_data.is_first=1;
        role_gate_data.gate_id=town_json_data.gate[0];
        role_town_data.gate.push(role_gate_data);

    }
    else
    {
        //todo::城池没有最新的了
    }

    var log_content={"role_town_data.tid":role_town_data.tid};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_open_role_town",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_open_role_town = help_open_role_town;

//获取城池信息
function on_town_data_list(data,send,s)
{
    global.log("on_town_data_list");

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
    var levels=[];

    var _tn_bag=role.town_bag;
    if(_tn_bag==undefined)
    {
        global.log("_tn_bag == undefined");
        return;
    }

    for(var key in town_data.town_data_list)
    {
        if(town_data.town_data_list[key] != undefined)
        {
            var tn_json_data=town_data.town_data_list[key];
            if(_tn_bag[key])
            {
                var client_tn_data={};
                client_tn_data.id=tn_json_data.tid;
                client_tn_data.finished=_tn_bag[key].passed;
                client_tn_data.rewarded=_tn_bag[key].rewarded;
                levels.push(client_tn_data);
            }
            else
            {
                break;
            }
        }
    }

    var msg = {
        "op" : msg_id.NM_TOWN_DATA,
        "levels" : levels,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_town_data_list",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_town_data_list = on_town_data_list;

//获取挑战城池信息
function on_get_challenge_town(data,send,s)
{
    global.log("on_get_challenge_town");

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

    var xids=data.xids;
    if(xids==undefined)
    {
        global.log("xids == undefined");
        return;
    }

    var towns=[];
    for(var i=0;i<xids.length;i++)
    {
        var tid=xids[i];
        var _town_data=town_data.town_data_list[tid];
        if(_town_data==undefined)
        {
            global.log("_town_data == undefined");
            return;
        }


        var _town_db_data=town_data.town_db_data_list[tid];

        if(_town_db_data==undefined)
        {

            _town_db_data=new town_data.TownDbData();
            _town_db_data.tid=tid;
            _town_db_data.reward=common_func.help_make_one_random(50,200);
            town_data.town_db_data_list[tid]=_town_db_data;

            make_db.insert_town_data(_town_db_data);

        }

        var client_data=new Object();

        if(_town_db_data)
        {
            var owner_formation_data;
            if(_town_db_data.last_arr[0])
            {
                owner_formation_data=formation.formation_list[_town_db_data.last_arr[0].grid];
                if(owner_formation_data==undefined)
                {
                    global.log("owner_formation_data == undefined");
                    return;
                }
                client_data.xid=_town_db_data.tid;
                client_data.owner_uid=owner_formation_data.grid;
                client_data.owner_name=owner_formation_data.name;
                client_data.guard_xid=_town_db_data.guard_data.card_id;
            }
            else
            {
                client_data.xid=_town_db_data.tid;
            }
        }
        else
        {
            //该城池无人占领,没有挑战记录
            client_data.xid=_town_data.tid;
        }
        towns.push(client_data);
    }

    var msg = {
        "op" : msg_id.NM_TOWN_CHALLENGE,
        "towns" : towns,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_challenge_town",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_challenge_town = on_get_challenge_town;

//获取单个挑战城池信息
function on_get_one_town_data(data,send,s)
{
    global.log("on_get_one_town_data");

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

    var tid=data.tid;
    if(tid==undefined)
    {
        global.log("tid == undefined");
        return;
    }

    var _town_db_data=town_data.town_db_data_list[tid];
    if(_town_db_data==undefined)
    {
        global.log("_town_db_data == undefined");
        return;
    }

    var msg = {
        "op" : msg_id.NM_ONE_TOWN_CHALLENGE,
        "tid" :tid,
        "ret" : msg_code.SUCC
    };

    //城池产出
    msg.reward=_town_db_data.reward;

    //返回前十名排行版
    msg.rank=[];
    for(var i=0;i<_town_db_data.last_arr.length;i++)
    {
        if(i>9)
        {
            break;
        }

        var rank_obj = {};
        rank_obj.rank = i + 1;
        rank_obj.name = formation.formation_list[_town_db_data.last_arr[0].grid].name;

        msg.rank.push(rank_obj);

    }

    //我的伤害
    msg.my_damage=0;
    msg.my_rank=0;
    for(var i=0;i<_town_db_data.last_arr.length;i++)
    {
        if(_town_db_data.last_arr[i].grid==role.grid)
        {
            msg.my_damage=_town_db_data.last_arr[i].hurt;
            msg.my_rank=i+1;
            break;
        }
    }


    var owner_formation_data=_town_db_data.last_arr[0]?formation.formation_list[_town_db_data.last_arr[0].grid]:null;
    var second_formation_data=_town_db_data.last_arr[1]?formation.formation_list[_town_db_data.last_arr[1].grid]:null;
    var third_formation_data=_town_db_data.last_arr[2]?formation.formation_list[_town_db_data.last_arr[2].grid]:null;

    if(owner_formation_data)
    {
        msg.owner_name=owner_formation_data.name;
        msg.leader_xid=owner_formation_data.card_ls[0].card_id;
    }
    if(second_formation_data)
    {
        msg.second_name=second_formation_data.name;
        msg.second_xid=second_formation_data.card_ls[0].card_id;
    }
    if(third_formation_data)
    {
        msg.third_name=third_formation_data.name;
        msg.third_xid=third_formation_data.card_ls[0].card_id;
    }

    //城守信息
    msg.guard_uid=_town_db_data.guard_data.unique_id;
    msg.guard_xid=_town_db_data.guard_data.card_id;
    msg.guard_level=_town_db_data.guard_data.level;
    msg.guard_rlevel=_town_db_data.guard_data.b_level;
    msg.guard_equip =[];
    for(var j=0;j<_town_db_data.guard_data.equips.length;j++)
    {
        var e_obj={};
        if(_town_db_data.guard_data.equips[j])
        {
            e_obj.xid=_town_db_data.guard_data.equips[j].equip_id;
        }
        msg.guard_equip.push(e_obj);
    }

    //是否可以挑战
    msg.is_challage=1;
    var town_period=make_db.get_global_town_period();
    if(role.town_period==town_period&&role.town_id!=tid)
    {
        msg.is_challage=0;
    }

    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_one_town_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_one_town_data = on_get_one_town_data;

//获取单个挑战城池信息
function on_get_town_rank_data(data,send,s)
{
    global.log("on_get_town_rank_data");

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

    var tid=data.tid;
    if(tid==undefined)
    {
        global.log("tid == undefined");
        return;
    }

    var _town_db_data=town_data.town_db_data_list[tid];
    if(_town_db_data==undefined)
    {
        global.log("_town_db_data == undefined");
        return;
    }

    //返回前十名排行版
    var rank_arr=[];

    for(var i=0;i<_town_db_data.last_arr.length;i++)
    {
        if(i>9)
        {
            break;
        }
        var _formation_data=formation.formation_list[_town_db_data.last_arr[i].grid];
        if(_formation_data==undefined)
        {
            global.log("_formation_data == undefined");
            return;
        }
        var rank_obj = {};
        rank_obj.rank = i + 1;
        rank_obj.name = _formation_data.name;
        rank_obj.level = _formation_data.level;
        rank_obj.title_id = _formation_data.town_title;
        rank_obj.card_ls = _formation_data.card_ls;

        rank_arr.push(rank_obj);

    }

    var msg = {
        "op" : msg_id.NM_TOWN_RANk,
        "rank" : rank_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_town_rank_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_town_rank_data = on_get_town_rank_data;

//领取守城奖励
function on_gain_guard_town_reward(data,send,s)
{
    global.log("on_gain_guard_town_reward");

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

    //是否是奖励领取时间
    var now=new Date();
    var hour=now.getHours();
    var minute=now.getMinutes();
    var is_time=0;
    if((hour==5||hour==11||hour==17||hour==23)&&minute>=30)
    {
        is_time=1;
    }

    if(!is_time)
    {
        var msg=
        {
            "op":msg_id.NM_GAIN_GUARD_TOWN_REWARD,
            "ret" : msg_code.TOWN_NOT_REWARD
        };
        send(msg);
        return;
    }

    var tid=data.tid;
    var _town_data=town_data.town_data_list[tid];
    var _town_db_data=town_data.town_db_data_list[tid];
    if(_town_data==undefined || _town_db_data==undefined)
    {
        global.log("_town_data==undefined || _town_db_data==undefined");
        return;
    }

    if(_town_db_data.last_arr[0].grid==role.grid)
    {

        var gain_rmb=0;
        if(_town_db_data.owner_reward)
        {
            gain_rmb=_town_db_data.owner_reward;
            _town_db_data.owner_reward=0;
        }
        else
        {
            var msg=
            {
                "op":msg_id.NM_GAIN_GUARD_TOWN_REWARD,
                "ret" : msg_code.REWARD_IS_GAINED
            };
            send(msg);
            return;
        }

        //放入更新列表中，定时入库
        town_data.town_update_db_arr.push(_town_db_data.tid);

        money_logic.help_gain_rmb(role,gain_rmb);
        var msg=
        {
            "op":msg_id.NM_GAIN_GUARD_TOWN_REWARD,
            "ingot":gain_rmb,
            "ret" : msg_code.SUCC
        };
        send(msg);
        user.nNeedSave=1;

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_USER_DATA,
            "gold":role.gold,
            "rmb":role.rmb ,
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));
    }
    else
    {
        var msg=
        {
            "op":msg_id.NM_GAIN_GUARD_TOWN_REWARD,
            "ret" : msg_code.NO_AUTHORITY
        };
        send(msg);
        return;
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gain_guard_town_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_gain_guard_town_reward = on_gain_guard_town_reward;

//设置守城武将
function on_set_town_guard(data,send,s)
{
    global.log("on_set_town_guard");

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

    var town_id=data.tid;
    var card_id=data.uid; //守城武将ID

    if(town_id ==undefined || card_id == undefined)
    {
        global.log("town_id ==undefined || card_id == undefined");
        return;
    }

    var _town_data=role.town_bag[town_id];
    var _town_db_data=town_data.town_db_data_list[town_id];
    if(_town_data==undefined || _town_db_data==undefined)
    {
        global.log("_town_data==undefined || _town_db_data==undefined");
        return;
    }

    if(_town_db_data.last_arr[0].grid==role.grid)
    {
        var _card_data=role.card_bag[card_id];
        if(_card_data.used)
        {
            var msg=
            {
                "op":msg_id.NM_SET_TOWN_GUARD,
                "ret" : msg_code.CARD_ON_FORMATION
            };
            send(msg);
            return;
        }

        if(_card_data.guard)
        {
            var msg=
            {
                "op":msg_id.NM_SET_TOWN_GUARD,
                "ret" : msg_code.CARD_ON_GUARD
            };
            send(msg);
            return;
        }

        //更换城守
        if(_town_db_data.guard_data.unique_id)
        {
            //不再是城守
            role.card_bag[_town_db_data.guard_data.unique_id].guard=0;

        }
        _card_data.guard=1;
        _town_db_data.guard_data.unique_id=_card_data.unique_id;
        _town_db_data.guard_data.card_id=_card_data.card_id;
        _town_db_data.guard_data.level=_card_data.level;
        _town_db_data.guard_data.b_level=_card_data.b_level;
        for(var i=0;i<_card_data.e_list.length;i++)
        {
            var _e_data=_card_data.e_list[i];
            if(_e_data)
            {
                var guard_equip=new town_data.GuardEquipData();
                guard_equip.equip_id=_e_data.equip_id;
                _town_db_data.guard_data.equips.splice(i,1,guard_equip);
            }
        }

        //放入更新列表中，定时入库
        town_data.town_update_db_arr.push(_town_db_data.tid);

        var msg=
        {
            "op":msg_id.NM_SET_TOWN_GUARD,
            "ret" : msg_code.SUCC
        };
        send(msg);
        user.nNeedSave=1;
    }
    else
    {
        var msg=
        {
            "op":msg_id.NM_SET_TOWN_GUARD,
            "ret" : msg_code.NO_AUTHORITY
        };
        send(msg);
        return;
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_set_town_guard",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_set_town_guard = on_set_town_guard;


//预先计算城池挑战奖励数据
function help_town_reward_data(data,send,s)
{
    global.log("help_town_reward_data");

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

    var parent_id=data.parent_id;
    if(parent_id==undefined)
    {
        global.log("parent_id==undefined");
        return;
    }

    var _town_bag_data=role.town_bag[parent_id];
    if(!_town_bag_data.passed)
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.TOWN_NOT_PASSED
        };
        send(msg);
        return;
    }

    //是否可以挑战
    var town_period=make_db.get_global_town_period();
    if(role.town_period==town_period&&role.town_id!=parent_id)
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.TOWN_FIGHT_PERIOD
        };
        send(msg);
        return;
    }

    //是否是挑战时间
    var now=new Date();
    var hour=now.getHours();
    var minute=now.getMinutes();
    if((hour==5||hour==11||hour==17||hour==23)&&minute>=30)
    {
        var msg = {
            "op" :msg_id.NM_WAR_REWARD_DATA,
            "ret" : msg_code.TOWN_NOT_FIGHT
        };
        send(msg);
        return;
    }

    //挑战模式无掉落奖励(缓存数据)
    var fight_user_data=formation.fight_user_data_list[role.grid];
    if(fight_user_data==undefined)
    {
        fight_user_data=new formation.FightUserData();
        fight_user_data.gid=role.gid;
        fight_user_data.grid=role.grid;
        formation.fight_user_data_list[role.grid]=fight_user_data;
    }

    fight_user_data.nonce=common_func.help_make_one_random(0,100);
    fight_user_data.parent_id=parent_id;

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

    var msg=
    {
        "op":msg_id.NM_WAR_REWARD_DATA,
        "nonce":fight_user_data.nonce,
        "drops":[],
        "ret" : msg_code.SUCC
    };
    send(msg);

    if(role.town_period!=town_period || role.town_id!=parent_id)
    {
        role.town_period=town_period;
        role.town_id=parent_id;
        user.nNeedSave=1;
    }


    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gate_reward_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_town_reward_data = help_town_reward_data;

//处理挑战城池结果
function help_town_fight_result(data,send,s)
{
    global.log("help_town_fight_result");

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

    var win=data.win; //是否胜利
    var total_hurt=data.totald; //伤害总和
    var single_hurt=Number(data.singled); //本次最佳当次伤害
    var nonce=data.nonce; //标识

    if(win == undefined || total_hurt== undefined ||single_hurt==undefined)
    {
        global.log("win == undefined || total_hurt== undefined");
        return;
    }


    var fight_user_data=formation.fight_user_data_list[role.grid];
    var fight_user_formation_data=formation.formation_list[role.grid];
    if(fight_user_data==undefined || fight_user_formation_data==undefined)
    {
        global.log("fight_user_data==undefined || fight_user_formation_data==undefined");
        return;
    }

    if(nonce!=fight_user_data.nonce)
    {
        global.log("nonce!=fight_user_data.nonce");
        return;
    }

    var total_lb=0;
    //该城池的xid
    var tid=fight_user_data.parent_id;

    //战斗胜利
    if(win)
    {

        var old_hurt=fight_user_formation_data.top_hurt;
        fight_user_formation_data.top_hurt=old_hurt>single_hurt?old_hurt:single_hurt;
        //计算单次伤害排行榜
        var ret_rank=arena_logic.help_count_hurt_rank(role.gid,role.grid,old_hurt,single_hurt);

        var _town_db_data=town_data.town_db_data_list[tid];
        if(_town_db_data==undefined)
        {
            global.log("_town_db_data==undefined");
            return;
        }
        else
        {
            var is_exist=0;
            for(var i=0;i<_town_db_data.new_arr.length;i++)
            {
                if(_town_db_data.new_arr[i].grid==role.grid)
                {
                    is_exist=1;
                    if(_town_db_data.new_arr[i].hurt>total_hurt)
                    {
                        _town_db_data.new_arr[i].hurt=total_hurt;
                    }
                }
            }

            if(!is_exist)
            {
                var town_fight_data=new town_data.TownFightData();
                town_fight_data.grid=role.grid;
                town_fight_data.hurt=total_hurt;
                _town_db_data.new_arr.push(town_fight_data);
            }

            //放入更新列表中，定时入库
            town_data.town_update_db_arr.push(tid);
        }

        //积分值结算
        role.score+=Number(fight_user_data.score);
        var msg=
        {
            "op":msg_id.NM_GATE_FIGHT_RESULT,
            "single_lb":ret_rank.new_rank,
            "old_single_lb":ret_rank.old_rank,
            "exceed":ret_rank.exceed,
            "ret" : msg_code.SUCC
        };
        send(msg);
    }
    else
    {
        //失败不记录他的总伤害

        var msg=
        {
            "op":msg_id.NM_GATE_FIGHT_RESULT,
            "ret" : msg_code.SUCC
        };
        send(msg);
    }
    //清空战斗数据 (战斗失败)
    delete formation.fight_user_data_list[role.grid];

    //成就 霸业挑战次数
    role.achievement[const_value.ACHI_TYPE_TOWNS_FIGHT].times++;
    user.nNeedSave=1;

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "hurt":fight_user_formation_data.top_hurt,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_town_fight_result",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_town_fight_result = help_town_fight_result;

//更新旧城守状态
function help_update_old_guard(old_gid,old_grid,old_card_uid)
{
    global.log("help_update_old_guard");

    var old_user = ds.user_list[old_gid];
    if(old_user && old_user.online)
    {
        global.log("old_user is online");
        var old_role = ds.get_cur_role(old_user);
        if(old_role == undefined)
        {
            global.log("old_role == undefined");
            return;
        }
        //非城守状态
        if(old_role.card_bag[old_card_uid]==undefined)
        {
            global.log("old_role.card_bag[old_card_uid]==undefined");
            return;
        }
        old_role.card_bag[old_card_uid].guard=0;
    }
    else
    {
        //用户不在线
        var con ={gid:old_gid,grid:old_grid};

        g_server.db.find(make_db.t_role,con,{"data.card_bag":1},function(arr){
            if(arr.length)
            {
                var db_card_bag=arr[0].data.card_bag;
                if(db_card_bag[old_card_uid]==undefined)
                {
                    global.log("db_card_bag[old_card_uid]==undefined");
                    return;
                }
                db_card_bag[old_card_uid].guard=0;
                g_server.db.update(
                    make_db.t_role,con,
                    {
                        "$set":{"data.card_bag":db_card_bag}
                    }
                );
            }
            else
            {
                global.err("old_user is not exist:"+old_grid);
            }
        });
    }
}


//初始化城池
function help_init_role_town(role,tid)
{
    global.log("help_init_role_town");

    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var town_bag_data=role.town_bag;

    //首次初始化副本
    var role_town_data=new ds.Role_Town_Data();
    for(var key in town_data.town_data_list)
    {
        var first_town_json_data=town_data.town_data_list[key];
        break;
    }

    role_town_data.tid=first_town_json_data.tid;
    town_bag_data[role_town_data.tid]=role_town_data;

    var role_gate_data=new ds.Role_Gate_Data();
    role_gate_data.is_first=1;
    role_gate_data.gate_id=first_town_json_data.gate[0];
    role_town_data.gate.push(role_gate_data);

    var log_content={"role_town_data.tid":role_town_data.tid};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_init_role_town",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.help_init_role_town = help_init_role_town;

//计算攻城战斗排行
var help_town_fight_rank=function(data)
{
    global.log("help_town_fight_rank");
    var town_reward=data.town_reward;
    if(town_reward==undefined)
    {
        global.log("town_rewards==undefined");
        return;
    }


    var town_period=make_db.add_global_town_period();

    for(var key in town_data.town_db_data_list)
    {
        var tid=key;
        global.log("tid:"+tid);
        var _town_db_data=town_data.town_db_data_list[tid];

        _town_db_data.owner_reward=_town_db_data.reward;
        _town_db_data.reward=town_reward[tid];

        if(_town_db_data==undefined)
        {
            continue;
        }
        //伤害排序
        common_func.compare_sort_des(_town_db_data.new_arr,"hurt");
        _town_db_data.last_arr=_town_db_data.new_arr;
        global.log("_town_db_data.last_arr:"+JSON.stringify(_town_db_data.last_arr));

        _town_db_data.new_arr=[];

        //记录城池数据
        if(_town_db_data.last_arr.length>0)
        {
            var first_gird=_town_db_data.last_arr[0].grid;
            var _town_title_db_data=town_title_data.town_title_db_data_list[first_gird];
            if(_town_title_db_data==undefined)
            {
                town_title_data.town_title_db_data_list[first_gird]=new town_title_data.TownTitleDbData();
                _town_title_db_data=town_title_data.town_title_db_data_list[first_gird];
                _town_title_db_data.grid=first_gird;

                make_db.insert_town_title_data(_town_title_db_data);
            }

            global.log("_town_title_db_data:"+JSON.stringify(_town_title_db_data));

            var _town_fight_data=_town_title_db_data.town_fight[tid];
            if(_town_fight_data==undefined)
            {
                _town_title_db_data.town_fight[tid]=new town_title_data.TownTitleFightData();
                _town_fight_data=_town_title_db_data.town_fight[tid];
            }

            _town_fight_data.t_times++;
            if(_town_fight_data.period+1==town_period)
            {
                _town_fight_data.c_times++;
            }
            else
            {
                _town_fight_data.c_times=1;
            }

            //当累积的次数达到三次时，成为太守
            if(_town_fight_data.c_times==3)
            {
                var _title_data=new town_title_data.TitleData();
                _title_data.id=tid;
                _title_data.date=new Date().getTime();
                _town_title_db_data.satrap.push(_title_data);

                var town_title=formation.formation_list[first_gird].town_title;
                if(town_title)
                {
                    var last_level=town_title_data.town_title_data_list[town_title].level;
                    var now_level=town_title_data.town_title_data_list[tid].level;
                    if(now_level>=last_level)
                    {
                        //称号替换
                        formation.formation_list[first_gird].town_title=tid;
                        help_get_town_title(_town_title_db_data,1);
                    }
                }
                else
                {
                    help_get_town_title(_town_title_db_data,1);
                }
            }

            //放入更新列表中，定时入库
            town_title_data.town_title_update_db_arr.push(first_gird);
        }
        //放入更新列表中，定时入库
        town_data.town_update_db_arr.push(_town_db_data.tid);
    }


};
exports.help_town_fight_rank=help_town_fight_rank;

//获取称号
var help_get_town_title=function(_town_title_db_data,level,role_grid)
{
    if(_town_title_db_data==undefined||level==undefined||role_grid==undefined)
    {
        global.log("_town_title_db_data==undefined||level==undefined||role_grid==undefined");
        return;
    }

    var arr1;
    var arr2;

    if(level==1)
    {
        //太守数组
        arr1=_town_title_db_data.satrap;
        if(arr1.length<3)
        {
            return;
        }
        //都督数组
        arr2=_town_title_db_data.governor;

    }
    else if(level==2)
    {
        //都督数组
        arr1=_town_title_db_data.governor;
        if(arr1.length<3)
        {
            return;
        }
        //将军数组
        arr2=_town_title_db_data.general;
    }
    else if(level==3)
    {
        //将军数组
        arr1=_town_title_db_data.governor;
        if(arr1.length<3)
        {
            return;
        }
        //王数组
        arr2=_town_title_db_data.king;
    }
    else if(level==4)
    {
        //王数组
        arr1=_town_title_db_data.king;
        if(arr1.length<3)
        {
            return;
        }
        //始皇帝数组
        arr2=_town_title_db_data.first_king;
    }


    level++;


    var is_add=0;
    for(var key in town_title_data.town_title_data_list)
    {
        var _town_title_data=town_title_data.town_title_data_list[key];
        if(_town_title_data.level==level)
        {
            var is_ok=1;
            for(var i=0;i<_town_title_data.children.length;i++)
            {
                var title_id=_town_title_data.children[i];
                var flag=0;
                for(var j=0;j<arr1.length;j++)
                {
                    if(title_id==arr1[j].id)
                    {
                        flag=1;
                        break;
                    }
                }
                if(!flag)
                {
                    is_ok=0;
                    break;
                }
            }

            if(is_ok)
            {
                var is_exist=0;
                for(var i=0;i<arr2.length;i++)
                {
                    if(arr2.id==key)
                    {
                        is_exist=1;
                        break;
                    }
                }

                if(!is_exist)
                {
                    var _title_data=new town_title_data.TitleData();
                    _title_data.id=key;
                    _title_data.date=new Date().getTime();
                    //获取新称号
                    arr2.push(_title_data);

                    var town_title=formation.formation_list[role_grid].town_title;
                    var last_level=town_title_data.town_title_data_list[town_title].level;
                    var now_level=town_title_data.town_title_data_list[key].level;
                    if(now_level>=last_level)
                    {
                        //称号替换
                        formation.formation_list[role_grid].town_title=key;
                    }

                    is_add=1;
                }

            }
        }
    }

    if(is_add)
    {
        help_get_town_title(_town_title_db_data,level);
        town_title_data.town_title_update_db_arr.push(_town_title_db_data.grid);
    }
};


//更新入库占城信息
var update_town_data=function()
{
    global.log("update_town_data_list");

    if(town_data.town_update_db_arr.length==0)
    {
        return;
    }
    else
    {
        for(var i=0;i<town_data.town_update_db_arr.length;i++)
        {
            var tid=town_data.town_update_db_arr[i];
            var _town_data=town_data.town_db_data_list[tid];
            if(_town_data==undefined)
            {
                global.log("town_data.town_db_data_list:"+JSON.stringify(town_data.town_db_data_list));
                continue;
            }
            make_db.update_town_data(_town_data);
        }
    }
    town_data.town_update_db_arr=[];
};
exports.update_town_data=update_town_data;

//更新入库称号信息
var update_town_title_data=function()
{
    global.log("update_town_title_data");

    if(town_title_data.town_title_update_db_arr.length==0)
    {
        return;
    }
    else
    {
        for(var i=0;i<town_title_data.town_title_update_db_arr.length;i++)
        {
            var grid=town_title_data.town_title_update_db_arr[i];
            global.log("grid:"+grid);
            var _town_title_data=town_title_data.town_title_db_data_list[grid];
            if(_town_title_data==undefined)
            {
                global.log("town_title_data.town_title_db_data_list:"+JSON.stringify(town_title_data.town_title_db_data_list));
                continue;
            }
            make_db.update_town_title_data(_town_title_data);
        }
    }
    town_title_data.town_title_update_db_arr=[];
};
exports.update_town_title_data=update_town_title_data;



