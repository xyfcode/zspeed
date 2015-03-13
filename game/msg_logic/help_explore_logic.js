/***
 *
 * 探索逻辑
 *
 */
var log_data=require("./log_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var explore_data=require("./explore_data");
var explore_event_data=require("./explore_event_data");

var common_func=require("./common_func");
var drop_logic=require("./help_drop_logic");
var money_logic=require("./help_money_logic");
var role_data_logic=require("./help_role_data_logic");
var log_data_logic=require("./help_log_data_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;


//增加探索次数
function on_add_exploration(data,send,s)
{
    global.log("on_arena_data_list");

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

    var now=new Date();
    var _millisecond_diff = now.getTime() - role.time_explore;
    var add_explore=Math.floor(_millisecond_diff/(const_value.EXPLORE_TICK*60*1000));
    if(add_explore>0)
    {
        var max_explore=const_value.EXPLORE_INIT_LIMIT;
        role.explore+=add_explore;
        role.explore=role.explore>max_explore?max_explore:role.explore;
        role.time_explore=now.getTime();
        user.nNeedSave=1;


        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_ENTER_GAME,
            "explore":role.explore, //探索次数
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));
    }

    var msg = {
        "op" : msg_id.NM_ADD_EXPLORATION,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_add_exploration",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_add_exploration = on_add_exploration;

//购买探索结果
function on_buy_explore(data,send,s)
{
    global.log("on_buy_explore");

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

    var eventId=data.eventId;
    var ratio=Number(data.ratio);
    if(eventId==undefined || ratio==undefined)
    {
        global.log("eventId==undefined || ratio==undefined");
        return;
    }

    var _event_data=explore_event_data.explore_event_data_list[eventId];
    if(_event_data==undefined)
    {
        global.log("_event_data == undefined");
        return;
    }

    var reward=[];
    if(_event_data.cost_num >0)
    {
        var pay_ok=0;
        if(_event_data.cost_type==const_value.REWARD_TYPE_RMB)
        {
             pay_ok=money_logic.help_pay_rmb(role,_event_data.cost_num);
        }
        else
        {
            pay_ok=money_logic.help_pay_money(role,_event_data.cost_num)
        }

        if(pay_ok)
        {
            for(var i=0;i<_event_data.reward.length;i++)
            {
                var reward_data=_event_data.reward[i];
                var gain_item=drop_logic.help_put_item_to_role(role,reward_data.id,ratio*reward_data.num,reward_data.type);
                reward=gain_item.uids;
                if(gain_item.flag)
                {
                    role_data_logic.help_notice_role_msg(role,send);
                }
            }
        }
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_BUY_EXPLORE,
        "reward":reward,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "exp" : role.exp ,
        "level":role.level,
        "name":role.name,
        "gold":role.gold, //游戏币
        "rmb":role.rmb ,//金币(人民币兑换)
        "score":role.score,
        "stamina":role.stamina, //体力
        "explore":role.explore, //探索次数
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_buy_explore",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_buy_explore = on_buy_explore;

//探索
function on_explore(data,send,s)
{
    global.log("on_explore");

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

    if(role.level<const_value.EXPLORE_LEVEL)
    {
        var msg = {
            "op" : msg_id.NM_EXPLORE,
            "ret" : msg_code.LEVEL_TOO_LOW
        };
        send(msg);
        return;
    }

    if(role.explore<1)
    {
        var msg = {
            "op" : msg_id.NM_EXPLORE,
            "ret" : msg_code.EXPLORE_NOT_ENOUCH
        };
        send(msg);
        return;
    }

    if(Object.keys(role.card_bag).length>=role.cbag_limit)
    {
        var msg = {
            "op" :msg_id.NM_EXPLORE,
            "ret" : msg_code.CARD_BAG_IS_FULL
        };
        send(msg);
        return;
    }

    var _explore_data_list=explore_data.explore_data_list;

    var event_id;
    var result;
    for(var key in _explore_data_list)
    {
        var _explore_data=_explore_data_list[key];
        if(role.level>=_explore_data.min_level && role.level<= _explore_data.max_level)
        {
            var _probability=common_func.help_make_one_random(1,100);
            if(_probability<=_explore_data.probability)
            {
                //触发概率集合
                var ass_proba=common_func.help_make_one_random(1,10000);
                for(var i=_explore_data.assemble.length-1;i>=0;i--)
                {
                    if((i==0)||(ass_proba>_explore_data.assemble[i-1].probability&&ass_proba<=_explore_data.assemble[i].probability))
                    {
                        event_id=_explore_data.assemble[i].event_id;
                        result=help_handle_explore_logic(role,send,event_id);
                        break;
                    }
                }
            }
            else
            {
                event_id=_explore_data.default_event;
                result=help_handle_explore_logic(role,send,event_id);
            }
            break;
        }
    }

    //如果用户探索次数是满的
    if(role.explore>=const_value.EXPLORE_INIT_LIMIT)
    {
        //探索从现在开始倒计时
        role.time_explore =(new Date().getTime()-3*1000);
    }
    role.explore--;
    //成就
    role.achievement[const_value.ACHI_TYPE_EXPLORE_TIMES].times++;

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_EXPLORE,
        "eventId" : event_id,
        "reward" : result.reward,
        "ratio" : result.ratio,
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
        "explore":role.explore,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_explore",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_explore = on_explore;

function help_handle_explore_logic(role,send,event_id)
{
    global.log("help_handle_explore_logic");

    global.log("event_id:"+event_id);
    var result=new Object();

    var _event_data=explore_event_data.explore_event_data_list[event_id];
    if(_event_data==undefined)
    {
        global.log("_event_data == undefined");
        return;
    }


    var probability=common_func.help_make_one_random(1,100);
    var ratio=1; //

    if(probability<=_event_data.proba_one)
    {
        ratio=1;
    }
    else if(probability<=_event_data.proba_two)
    {
        ratio=2;
    }
    else if(probability<=_event_data.proba_three)
    {
        ratio=3;
    }
    else if(probability<=_event_data.proba_four)
    {
        ratio=4;
    }
    else
    {
        ratio=5;
    }

    if(_event_data.cost_type && _event_data.cost_num >0)
    {
        //需要花费才能获得
        result.reward=[];
    }
    else
    {
        for(var i=0;i<_event_data.reward.length;i++)
        {
            var reward_data=_event_data.reward[i];

            var gain_item=drop_logic.help_put_item_to_role(role,reward_data.id,ratio*reward_data.num,reward_data.type);
            result.reward=gain_item.uids;
            if(gain_item.flag)
            {
                role_data_logic.help_notice_role_msg(role,send);
            }
        }

    }

    result.ratio=ratio;

    //处理积分
    if(_event_data.score)
    {
        role.score+=_event_data.score;
    }

    return result;

}








