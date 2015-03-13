var formation_data=require("./formation_data");
var comm_fun=require("./common_func");
var money_logic=require("./help_money_logic");
var key_words = require("./key_words_data");

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var ds = require("./data_struct");
var define_code=require("./define_code");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;

//用户发送聊天消息
function on_user_chat_data(data,send,s)
{
    global.log("on_user_chat_data");

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

    var message=data.message;
    if(message == undefined)
    {
        global.log("message == undefined");
        return;
    }

    message=message.replace(key_words.reg,"*");

    /*if(key_words.reg.test(message))
    {
        var msg = {
            "op" : msg_id.NM_USER_CHAT_DATA,
            "ret" : msg_code.INVALID_CODE_EXIST
        };
        send(msg);
        return;
    } */

    var role_formation_data=formation_data.formation_list[role.grid];
    if(role_formation_data==undefined)
    {
        global.log("role_formation_data == undefined,role_id:"+role.grid);
        return;
    }

    if(comm_fun.help_judge_today(role.chat_date))
    {
        if(role.chat_time>=const_value.CHAT_FREE_TIMES)
        {
            var pay_ok=money_logic.help_pay_rmb(role,const_value.CHAT_COST);
            if(!pay_ok)
            {
                var msg = {
                    "op" : msg_id.NM_USER_CHAT_DATA,
                    "ret" : msg_code.RMB_NOT_ENOUGH
                };
                send(msg);
                return;
            }
        }
    }
    else
    {
        //不是今天
        role.chat_date=(new Date()).getTime();
        role.chat_time=0;
    }

    role.chat_time++;

    var msg = {
        "op" : msg_id.NM_USER_CHAT_DATA,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var msg_obj=new Object();
    msg_obj.uid=role.grid;
    msg_obj.name=role.name;
    msg_obj.time=Math.floor((new Date()).getTime()/1000);
    msg_obj.level=role.level;
    msg_obj.learder_xid=role_formation_data.card_ls[0].card_id;
    msg_obj.msg=message;

    user.nNeedSave=1;

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "rmb":role.rmb ,
        "free_chat":(const_value.CHAT_FREE_TIMES-role.chat_time),
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_user_chat_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

    help_notice_online_user(msg_obj);
}
exports.on_user_chat_data = on_user_chat_data;

//通知用户聊天内容
function help_notice_online_user(msg_obj)
{
    global.log("help_notice_online_user");

    var msg = {
        "op" : msg_id.NM_NOTICE_CHAT_DATA,
        "u" : msg_obj.uid,
        "n" : msg_obj.name,
        "t" : msg_obj.time,
        "l" : msg_obj.level,
        "x" : msg_obj.learder_xid,
        "m" : msg_obj.msg,
        "ret" : msg_code.SUCC
    };

    for(var key in ds.user_account_list)
    {
        var user =  ds.user_account_list[key];

        global.log("online : "+user.online);
        global.log("send : "+typeof(user.send));
        global.log("account : "+user.account_data.account);

        if(user.online && user.send)
        {
            user.send(msg);
        }
    }

}


