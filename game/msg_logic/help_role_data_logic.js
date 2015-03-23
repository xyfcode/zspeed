/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-2
 * Time: 下午9:08
 * To change this template use File | Settings | File Templates.
 */

var log_data = require("./log_data");
var log_data_logic = require("./help_log_data_logic");
var role_exp_data = require("./role_exp_data");
var formation = require("./formation_data");
var friend_data=require("./friend_data");
var achievement_data=require("./achievement_data");
var login_reward_data=require("./login_reward_data");
var sign_reward_data=require("./sign_reward_data");
var arena_data=require("./arena_data");

var make_db = require("./make_db");
var comm_fun = require("./common_func");
var money_logic = require("./help_money_logic");
var help_drop_logic=require("./help_drop_logic");

var ds = require("./data_struct");
var define_code = require("./define_code");
var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server=null;

function init(s)
{
    g_server=s;
}
exports.init=init;

//Role,增加的经验值
function make_role_level(role,exp)
{
    if(role == undefined || isNaN(exp) || exp <0)
    {
        return;
    }

    //增加经验
    role.exp+=Math.floor(exp);

    var exp_json_data = role_exp_data.role_exp_data_list[role.level];
    //超过最大等级
    if(exp_json_data==undefined)
    {
        global.log("exp_json_data==undefined,level:"+role.level);
        return;
    }

    //升级
    while(exp_json_data && role.exp >= exp_json_data.exp_limit)
    {
        var _formation_data=formation.formation_list[role.grid];
        if(_formation_data==undefined)
        {
            global.log("_formation_data==undefined");
            return;
        }
        role.exp-=Math.floor(exp_json_data.exp_limit);
        role.level +=1;
        //体力加满
        role.stamina=(role.stamina>const_value.STAMINA_MAX?role.stamina:const_value.STAMINA_MAX);

        _formation_data.level=role.level;

        exp_json_data = role_exp_data.role_exp_data_list[role.level];
    }
}
exports.make_role_level = make_role_level;


//推送用户通知数量
function help_notice_role_msg(role,send)
{
    global.log("help_notice_role_msg");
    if(role != undefined && send != undefined)
    {
        //获取好友请求数量
        var _friend_data=friend_data.friend_data_list[role.grid];
        var f_num=0;
        if(_friend_data)
        {
            f_num=_friend_data.asks.length;
        }

        //获取卡牌背包提醒数量
        var card_arr=[];
        for(var key in role.card_bag)
        {
            if(role.card_bag[key].gain_time>role.cbag_time)
            {
                card_arr.push(role.card_bag[key].unique_id);
            }
        }
        //获取装备背包提醒数量
        var item_arr=[];
        for(var key in role.item_bag)
        {
            if(role.item_bag[key].gain_time>role.ibag_time)
            {
                item_arr.push(role.item_bag[key].item_id);
            }
        }

        //获取排行榜奖励个数提醒
        var top_hurt=formation.formation_list[role.grid].top_hurt;
        var rank_num=0;
        for(var key in arena_data.rank_reward_data_list)
        {
            if(top_hurt>=arena_data.rank_reward_data_list[key].damage_record)
            {
                rank_num++;
            }
        }

        var msg = {
            "op" : msg_id.NM_GET_NOTICE_COUNT,
            "fRNum" : f_num,
            "iArr" : item_arr,
            "cArr":card_arr,
            "rNum":rank_num-role.rank_reward.length,
            "ret" :msg_code.SUCC
        };
        send(msg);
        global.log(JSON.stringify(msg));
    }
}
exports.help_notice_role_msg = help_notice_role_msg;

//扩充装备和武将背包
function on_extend_bag(data,send,s)
{
    global.log("on_extend_bag");

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

    if(role.cbag_limit>=const_value.CARD_BAG_MAX_LIMIT)
    {
        var msg = {
            "op" : msg_id.NM_EXTEND_BAG,
            "ret" : msg_code.COUNT_EXCEED_LIMIT
        };
        send(msg);
        return;
    }

   //扩充
    var pay_ok=money_logic.help_pay_rmb(role,const_value.BAG_EXPAND_COST);
    if(pay_ok)
    {
        role.cbag_limit+=const_value.BAG_EXPEND_LIMIT;
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_EXTEND_BAG,
            "ret" : msg_code.RMB_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_EXTEND_BAG,
        "limit" :role.cbag_limit,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "rmb":role.rmb ,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_extend_bag",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_extend_bag = on_extend_bag;

//增加用户体力
function on_add_stamina(data,send,s)
{
    global.log("on_add_stamina");

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
    var max_stamina=const_value.STAMINA_MAX;
    if(role.stamina>=max_stamina)
    {
        var msg = {
            "op" : msg_id.NM_ADD_STAMINA,
            "ret" : msg_code.SUCC
        };
        send(msg);
        return;
    }

    var now=new Date();
    var _millisecond_diff = now.getTime() - role.time_stamina;
    var add_stamina=Math.floor(_millisecond_diff/(const_value.POINT_TICK*60*1000));
    if(add_stamina>0)
    {

        role.stamina+=add_stamina;
        role.stamina=role.stamina>max_stamina?max_stamina:role.stamina;
        role.time_stamina=now.getTime();
        user.nNeedSave=1;

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_ENTER_GAME,
            "stamina":role.stamina ,
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));
    }

    var msg = {
        "op" : msg_id.NM_ADD_STAMINA,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_add_stamina",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_add_stamina = on_add_stamina;

//完成的新手引导步骤号
function on_finish_rookie_guide(data,send,s)
{
    global.log("on_finish_rookie_guide");

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

    var step=data.step;
    if(step==undefined)
    {
        global.log("step == undefined");
        return;
    }

    role.guide_step=step;

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_FINISH_ROOKIE_GUIDE,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"role.guide_step":role.guide_step};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_finish_rookie_guide",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_finish_rookie_guide = on_finish_rookie_guide;

//背包打开操作
function on_ui_visited(data,send,s)
{
    global.log("on_ui_visited");

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

    var ui_id=data.ui_id;
    if(ui_id==undefined)
    {
        global.log("ui_id == undefined");
        return;
    }

    var now=new Date();
    if(ui_id==1)
    {
        role.cbag_time=now.getTime();
    }
    else if(ui_id==2)
    {
        role.ibag_time=now.getTime();
    }

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_UI_VISITED,
        "ret" : msg_code.SUCC
    };
    send(msg);

    help_notice_role_msg(role,send);

    var log_content={};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_ui_visited",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_ui_visited = on_ui_visited;

//获取7日登录信息
function on_get_seven_data(data,send,s)
{
    global.log("on_get_seven_data");

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
        "op" : msg_id.NM_GET_SEVEN_DATA,
        "day" : role.login_days,
        "claim_states" : role.lg_reward,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_seven_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_seven_data = on_get_seven_data;

//领取7日登录奖励
function on_get_seven_reward(data,send,s)
{
    global.log("on_get_seven_reward");

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

    var day=Number(data.day);
    if(day == undefined)
    {
        global.log("day == undefined");
        return;
    }

    if(day > 7 || day <0)
    {
        global.log("day >7 day<0");
        return;
    }

    if(role.lg_reward[day-1]==1)
    {
        var msg = {
            "op" : msg_id.NM_GET_SEVEN_REWARD,
            "ret" : msg_code.REWARD_IS_GAINED
        };
        send(msg);
        return;
    }

    var reward_json_data=login_reward_data.login_reward_data_list[day+""];
    if(reward_json_data==undefined)
    {
        global.log("reward_json_data == undefined");
        return;
    }

    var u_ids=[];
    for(var i=0;i<reward_json_data.reward_arr.length;i++)
    {
        var item_data=reward_json_data.reward_arr[i];
        if(item_data)
        {
            var gain_item=help_drop_logic.help_put_item_to_role(role,item_data.id ,item_data.num, item_data.type);
            u_ids.push(gain_item.uids);
            if(gain_item.flag)
            {
                help_notice_role_msg(role,send);
            }
        }
        else
        {
            u_ids.push([]);
        }
    }
    //更改状态
    role.lg_reward[day-1]=1;
    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_GET_SEVEN_REWARD,
        "uids" : u_ids,
        "ret" : msg_code.SUCC
    };
    send(msg);


    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
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
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_seven_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_seven_reward = on_get_seven_reward;

//获取30日签到数据
function on_get_sign_data(data,send,s)
{
    global.log("on_get_sign_data");

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

    var enable=0;
    if(!comm_fun.help_judge_today(role.sign_date))
    {
        enable=1;
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_GET_SIGN_DATA,
        "count" : role.sign_days,
        "enable" : enable,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
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
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_sign_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_sign_data = on_get_sign_data;

//30日签到
function on_sign_in(data,send,s)
{
    global.log("on_sign_in");

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

    if(comm_fun.help_judge_today(role.sign_date))
    {
        var msg = {
            "op" : msg_id.NM_SIGN_IN,
            "ret" : msg_code.SIGN_IS_END
        };
        send(msg);
        return;
    }

    if(role.sign_days>=30)
    {
        role.sign_days=1;
    }
    else
    {
        role.sign_days++;
    }
    role.sign_date=(new Date()).getTime();

    //获取签到奖励
    var reward_json_data=sign_reward_data.sign_reward_data_list[role.sign_days];
    if(reward_json_data==undefined)
    {
        global.log("reward_json_data==undefined");
        global.log("role.sign_days:"+role.sign_days);
        return;
    }

    if(reward_json_data.rmb>0)
    {
        money_logic.help_gain_rmb(role,reward_json_data.rmb);
    }

    if(reward_json_data.gold>0)
    {
        money_logic.help_gain_money(role,reward_json_data.gold);
    }

    if(reward_json_data.exp>0)
    {
        make_role_level(role,reward_json_data.exp);
    }

    var u_ids=[];
    for(var i=0;i<reward_json_data.reward_arr.length;i++)
    {
        var item_data=reward_json_data.reward_arr[i];
        if(item_data)
        {
            var gain_item=help_drop_logic.help_put_item_to_role(role,item_data.id ,item_data.num, item_data.type);
            u_ids.push(gain_item.uids);
            if(gain_item.flag)
            {
                help_notice_role_msg(role,send);
            }
        }
        else
        {
            u_ids.push([]);
        }
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_SIGN_IN,
        "uids":u_ids,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "exp" : role.exp ,
        "level":role.level,
        "name":role.name,
        "gold":role.gold, //游戏币
        "rmb":role.rmb ,//金币(人民币兑换)
        "score":role.score,
        "stamina":role.stamina, //体力
        "ret" :msg_code.SUCC
    };
    send(msg);
    global.log(JSON.stringify(msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sign_in",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_sign_in = on_sign_in;

//获取成就数据
function on_get_achievement_data(data,send,s)
{
    global.log("on_get_achievement_data");

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

    var client_ac_arr=[];
    for(var key in role.achievement)
    {
        var _achievement_data=role.achievement[key];

        if(_achievement_data && !_achievement_data.finished)
        {
            var obj=new Object();
            obj.id=_achievement_data.id;
            obj.progress=help_get_progress(role,_achievement_data);
            client_ac_arr.push(obj);
        }
    }


    var msg = {
        "op" : msg_id.NM_GET_ACHIEVEMENT_DATA,
        "achievements": client_ac_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_achievement_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_achievement_data = on_get_achievement_data;

//领取成就奖励
function on_get_achievement_reward(data,send,s)
{
    global.log("on_get_achievement_reward");

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

    var ach_id=data.ach_id;
    if(ach_id == undefined)
    {
        global.log("ach_id == undefined");
        return;
    }


    var achievement_json_data=achievement_data.achievement_data_list[ach_id];
    if(achievement_json_data==undefined)
    {
        global.log("achievement_json_data==undefined");
        return;
    }

    var role_achievement_data=role.achievement[achievement_json_data.type];
    if(role_achievement_data==undefined )
    {
        global.log("role_achievement_data==undefined");
        return;
    }

    //奖励已经领取
    if(role_achievement_data.finished)
    {
        var msg = {
            "op" : msg_id.NM_GET_ACHIEVEMENT_REWARD,
            "ret" : msg_code.REWARD_IS_GAINED
        };
        send(msg);
        return;
    }

    //是否完成
    var current_progress=help_get_progress(role,role_achievement_data);
    if(current_progress<achievement_json_data.times)
    {
        var msg = {
            "op" : msg_id.NM_GET_ACHIEVEMENT_REWARD,
            "ret" : msg_code.ACHIEVEMENT_NOT_COMPL
        };
        send(msg);
        return;
    }

    var reward_arr=achievement_json_data.reward_arr;
    var u_ids=[];
    for(var i=0;i<reward_arr.length;i++)
    {
        var item_data=reward_arr[i];
        if(item_data)
        {
            var gain_item=help_drop_logic.help_put_item_to_role(role,item_data.id ,item_data.num, item_data.type);
            u_ids.push(gain_item.uids);
            if(gain_item.flag)
            {
                help_notice_role_msg(role,send);
            }
        }
        else
        {
            u_ids.push([]);
        }
    }

    //更改状态
    var next_progress=-1;
    if(achievement_json_data.next_achievement)
    {
        var next_ach_json_data=achievement_data.achievement_data_list[achievement_json_data.next_achievement];
        if(next_ach_json_data)
        {
            //开启新成就
            role_achievement_data.id=next_ach_json_data.id;
            next_progress=help_get_progress(role,role_achievement_data);
        }
    }
    else
    {
        //没有新成就，奖励领取
        role_achievement_data.finished=1;
    }

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_GET_ACHIEVEMENT_REWARD,
        "uids" : u_ids,
        "next_progress":next_progress,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
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
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_achievement_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_achievement_reward = on_get_achievement_reward;

//客户端提交成就
function on_report_achievement(data,send,s)
{
    global.log("on_report_achievement");

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
    var progress=data.progress;
    if(type == undefined || progress==undefined)
    {
        global.log("type == undefined || progress==undefined");
        return;
    }

    if(type==const_value.ACHI_TYPE_SKILL_VAN||type==const_value.ACHI_TYPE_NINE
        ||type==const_value.ACHI_TYPE_KILL_NUM||type==const_value.ACHI_TYPE_GRIFFIN)
    {
        var role_achievement_data=role.achievement[type];
        if(role_achievement_data==undefined)
        {
            global.log("role_achievement_data==undefined");
            return;
        }

        role_achievement_data.times+=progress;

        user.nNeedSave=1;
    }

    var msg = {
        "op" : msg_id.NM_REPORT_ACHIEVEMENT,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_report_achievement",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_report_achievement = on_report_achievement;

//获取进度
function help_get_progress(role,_achievement_data)
{
    if(role==undefined || _achievement_data ==undefined)
    {
        global.log("role==undefined || _achievement_data ==undefined");
        return;
    }
    var progress=0;
    var achievement_json_data=achievement_data.achievement_data_list[_achievement_data.id];

    switch (achievement_json_data.type)
    {
        // 通关关卡
        case const_value.ACHI_TYPE_GATE:
            var gate_id=achievement_json_data.s_param1;
            var role_tn_data=role.town_bag[achievement_json_data.s_param2];
            if(role_tn_data)
            {
                if(role_tn_data.passed==1)
                {
                    progress=1;
                }
                else
                {
                    for(var i=0;i<role_tn_data.gate.length;i++)
                    {
                        if(role_tn_data.gate[i].gate_id==gate_id && role_tn_data.gate[i].passed==1)
                        {
                            progress=1;
                        }
                    }
                }

            }
            break;
        // 玩家等级
        case const_value.ACHI_TYPE_LEVEL:
            progress=role.level;
            break;
        default :
            progress=_achievement_data.times;
            break;
    }

    return progress;
}

function help_init_role_achievement(role)
{
    global.log("help_init_role_achievement");
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }

    for(var key in achievement_data.achievement_data_list)
    {
        var achievement_json_data=achievement_data.achievement_data_list[key];
        if(achievement_json_data&&achievement_json_data.is_show)
        {
            var ds_achievement_data=new ds.Achievement_Data();
            ds_achievement_data.id=achievement_json_data.id;
            if(achievement_json_data.type==const_value.ACHI_TYPE_LOGIN)
            {
                ds_achievement_data.times=1;
            }
            role.achievement[achievement_json_data.type]=ds_achievement_data;
        }
    }
}
exports.help_init_role_achievement=help_init_role_achievement;