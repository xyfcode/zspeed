var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var gift_data=require("./gift_data");
var make_db=require("./make_db");
var ds = require("./data_struct");

var billing_client = require("../billing_client");
var mail_logic=require("./help_mail_logic");
var drop_logic=require("./help_drop_logic");

var define_code=require("./define_code");
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;

var g_server=null;

function init(s)
{
    g_server = s;
}
exports.init=init;

//兑换礼包
function on_exchange_gift(data,send,s)
{
    global.log("on_exchange_gift");

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

    var pft=data.pft;
    var code=data.code;
    if(pft==undefined || code==undefined)
    {
        global.log("pft==undefined || code==undefined");
        return;
    }

    if(code.length<7)
    {
        var msg = {
            "op" : msg_id.NM_EXCHANGE_GIFT,
            "ret" : msg_code.CODE_IS_NOT_EXIST
        };
        send(msg);
        return;
    }

    var msg = {
        "op": msg_id.NM_BL_VERIFY_CODE,
        "pft" : pft,
        "account" : role.account,
        "code" : code
    };

    var verify_user=new Object();

    verify_user.gid=role.gid;
    verify_user.grid=role.grid;
    verify_user.account=role.account;
    verify_user.level=role.level;
    verify_user.name=role.name;
    verify_user.socket=user.socket;

    ds.cd_verify_account_list[role.account] = verify_user;

    var b_socket = billing_client.get_billing_socket();
    if(b_socket && b_socket.send)
    {
        b_socket.send(msg);
        global.log("send to billing_server ok!");
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_EXCHANGE_GIFT,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
    }

    var log_content={};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_exchange_gift",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_exchange_gift = on_exchange_gift;

//获取兑换礼包奖励
function help_get_gift_result(data,send,s)
{
    global.log("help_get_gift_result");

    var account = data.account;
    var pft = data.pft;
    var verify_result = data.ret;

    if(account == undefined ||pft == undefined ||verify_result == undefined)
    {
        global.log("account == undefined ||pft == undefined ||verify_result == undefined");
        return;
    }

    var temp_user = ds.cd_verify_account_list[account];
    if(temp_user == undefined)
    {
        global.log("temp_user == undefined");
        return;
    }

    if(verify_result==0)
    {
        //获取礼包
        for(var key in gift_data.gift_data_list)
        {
            var _gift_data=gift_data.gift_data_list[key];
            if(_gift_data.pft==pft)
            {
                var _drop_data=drop_logic.help_gain_drop_data(_gift_data.drop);

                for(var i=0;i<_drop_data.length;i++)
                {
                    var item=new Object();
                    item.type=_drop_data[i].type;
                    item.id=_drop_data[i].xid;
                    item.num=_drop_data[i].count;

                    mail_logic.help_create_mail_data(temp_user.gid,temp_user.grid,const_value.MAIL_TYPE_REWARD,_gift_data.des,item);
                }
            }
        }

        var msg = {
            "op" : msg_id.NM_EXCHANGE_GIFT,
            "ret" : msg_code.SUCC
        };
        if(temp_user.socket&&temp_user.socket.send)
        {
            temp_user.socket.send(msg);
        }

    }
    else
    {
        var msg = {
            "op" : msg_id.NM_EXCHANGE_GIFT,
            "ret" : msg_code.CODE_IS_NOT_EXIST
        };

        if(temp_user.socket&&temp_user.socket.send)
        {
            temp_user.socket.send(msg);
        }
    }
    delete ds.temp_user_account_list[account];

    var log_content={};
    var logData=log_data_logic.help_create_log_data(temp_user.gid,temp_user.account,temp_user.grid,temp_user.level,temp_user.name,"help_get_gift_result",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.help_get_gift_result = help_get_gift_result;

