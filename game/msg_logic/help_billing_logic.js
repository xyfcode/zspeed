var make_db = require("./make_db");
var ds = require("./data_struct");
var play_name = require("./play_name");
var define_code = require("./define_code");
var billing_client = require("../billing_client");
var server_config_data = require("./server_config_data");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var common_func=require("./common_func");

var role_data_logic = require("./help_role_data_logic");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;
var server_list = server_config_data.server_config_data_list;

var g_server=null,billing_socket_send = null;

function init(s)
{
    g_server = s;
}
exports.init=init;

// 上传游戏服信息到billing服务器
function on_update_server_status(send)
{
    global.log("on_update_server_status");
    if(send != undefined)
    {
        billing_socket_send = send;
        var gs = server_list[0];

        if(gs != undefined)
        {
            var msg = {
                "op" : msg_id.NM_UPDATE_SERVER_STATUS,
                "gs_uid" : gs.server_id, //游戏服务器唯一ID
                "ip" : gs.ip, //游戏服务器IP
                "port" : gs.port, //游戏服务器端口号
                "is_open" : gs.is_open, //游戏服务器是否开启
                "is_new" : gs.is_new, //游戏服务器是否是新开的
                "is_test" : gs.is_test, //游戏服务器是否是测试服务器
                "pft" : gs.pft //游戏服务器平台号
            };
            send(msg);
        }
        else
        {
            global.log("gs == undefined");
        }
    }
    else
    {
        global.log("send == undefined");
    }
}
exports.on_update_server_status = on_update_server_status;

//接受billing下发服务器验证信息
function on_billing_update_server_result(data,send,s)
{
    global.log("on_billing_update_server_result");
    var ret=data.ret;
    if(ret==0)
    {

    }
    else
    {
        //todo:not perfect ,ip地址错误，或端口号错误
        global.err("game server config error!");
        s.removeAllListeners();
        global.err("remove close listener ok!");
        s.end();
        s.destroy();
        s = null;
    }

}
exports.on_billing_update_server_result = on_billing_update_server_result;

function on_tick_server_status(send)
{
    var gs = server_list[0];
    if(gs != undefined)
    {
        var msg = {
            "op" : msg_id.NM_SERVER_STATUS,
            "gs_uid" : gs.server_id,
            "player_count" : Object.keys(ds.user_account_list).length
        };
        send(msg);
    }
    else
    {
        global.log("on_tick_server_status gs == undefined");
    }
}
exports.on_tick_server_status =on_tick_server_status;

function on_gs_user_login(data,send,s)
{
    global.log("on_gs_user_login");
    var account = data.account;
    var login_code = data.ret;

    if(account == undefined || login_code == undefined)
    {
        global.log("account == undefined || login_code == undefined");
        return;
    }

    var temp_user = ds.temp_user_account_list[account];

    if(temp_user == undefined)
    {
        global.log("temp_user == undefined");
        return;
    }

    if(login_code == msg_code.SUCC)
    {
        //判断是否该帐号处于在线状态
        var other_user_data=ds.user_account_list[account];
        if(other_user_data&&other_user_data.online)
        {
            global.log("other user is online,kick...");
            //踢出该用户
            if(other_user_data.socket)
            {
                var msg ={
                    "op" : msg_id.NM_MUTIL_LOGIN,
                    "ret" : msg_code.SUCC
                };
                other_user_data.send(msg);

                close_socket(other_user_data.socket);
            }

            delete ds.user_account_list[account];
            delete ds.user_list[other_user_data.account_data.gid];
            other_user_data = null;
        }


        var con = {"account" : account};
        var now = new Date();

        g_server.db.find(make_db.t_user,con,function(arr){
           if(arr.length == 0)
           {
               var new_user = new ds.UserInfo();
               var gid = make_db.get_global_unique_id();
               new_user.socket = temp_user.socket;
               new_user.send = temp_user.send;
               new_user.online = 1;

               new_user.account_data.login_type = temp_user.login_type;
               new_user.account_data.gid = gid;
               new_user.account_data.account = account;
               new_user.account_data.c_date = now.getTime();
               new_user.account_data.pft = temp_user.pft;

               ds.user_account_list[account] = new_user;
               ds.user_list[gid] = new_user;

               help_reset_user_state(new_user,temp_user.socket,temp_user.send);

               make_db.insert_user_data(new_user);

               if(play_name.play_name_arr.length <= 0)
               {
                   var msg ={
                       "op":msg_id.NM_LOGIN,
                       "ret" : msg_code.RAN_NAME_NOT_ENOUGH //没有可用随机名
                   };
                   send(msg);
               }
               else
               {
                   new_user.rand_name=play_name.getUnUsedName();
                   var msg = {
                       "op"     : msg_id.NM_LOGIN,
                       "randName"   : new_user.rand_name, //客户端根据是否有姓名，判断是否走createrole流程
                       "guide_step" : 0,//新手引导编号
                       "ret"    : msg_code.SUCC

                   };

                   new_user.send(msg);

                   var log_content={"account":account,"login_type":new_user.account_data.login_type,"c_date":new_user.account_data.c_date};
                   var logData=log_data_logic.help_create_log_data(0,account,0,0,0,"on_gs_user_login",log_content,log_data.logType.LOG_LOGIN);
                   log_data_logic.log(logData);
               }
           }
           else
           {
               global.log("old user");
               var user = new ds.UserInfo();
               user.account_data = arr[0];
               user.socket = temp_user.socket;
               user.send = temp_user.send;
               user.online = 1;
               //游戏服只有一个服务器配置
               user.account_data.cur_sid = server_list[0].server_id;
               user.account_data.cur_rid = 1;
               help_reset_user_state(user,temp_user.socket,temp_user.send);

               ds.user_account_list[account] = user;
               ds.user_list[arr[0].gid] = user;

               var con = {"gid" : user.account_data.gid};
               g_server.db.find(make_db.t_role,con,function(role_arr){
                   if(role_arr.length >0)
                   {
                       global.log("old user login ok!");

                       //只有一个角色
                       var grid = role_arr[0].grid;
                       user.role_data[grid] = role_arr[0];

                       var role_data = ds.get_cur_role(user); //只有在走create_role该方法才能生效
                       if(role_data==undefined)
                       {
                           global.log("role_data==undefined");
                           return;
                       }

                       g_server.db.update(make_db.t_role,{account:account},{"$set":{login_count:user.account_data.login_count}});
                       var msg = {
                           "op" : msg_id.NM_LOGIN,
                           "guide_step" : role_data.guide_step,//新手引导编号
                           "ret" : msg_code.SUCC
                       };
                       user.send(msg);
                   }
                   else
                   {
                       global.log("role is not create!");
                       user.rand_name = play_name.getUnUsedName();

                       var msg = {
                           "op"     : msg_id.NM_LOGIN,
                           "randName"   : user.rand_name,
                           "guide_step" : 0,//新手引导编号
                           "ret"    : msg_code.SUCC
                       };
                       user.send(msg);
                   }
               });
           }

            delete ds.temp_user_account_list[account];
            temp_user = null;
            global.log("clear temp user data!");
        });
    }
    else
    {
        global.log("on_gs_user_login failed! login_code :[" + login_code +"]");
        var msg = {
            "op" : msg_id.NM_LOGIN,
            "ret" : login_code
        };
        temp_user.send(msg);

        delete ds.temp_user_account_list[account];
        temp_user = null;
        global.log("clear temp user data!");
    }
}
exports.on_gs_user_login = on_gs_user_login;

//////////////////////////////////////////////
function help_reset_user_state(user,s,send)
{
    global.log("help_reset_user_state");
    if(user == undefined || s == undefined || send == undefined)
    {
        return;
    }
    var now = new Date();
    s.nAliveTime = now.getTime();
    s.gid = user.account_data.gid;
    s.account = user.account_data.account;

    user.send = send;
    user.socket = s;

    user.nSaveDBTime = now.getTime();
}


//关闭socket连接
function close_socket(s)
{
    global.log("close_socket");
    if(s != undefined)
    {
        s.destroy();
        s.end();
        clearInterval(s.interval);
        s = null;
    }
    else
    {
        global.log("socket == undefined");
        return;
    }
}

//踢出在线用户
function on_kick_user(data,send,s)
{
    global.log("on_kick_user");

    var account = data.account;
    if(account == undefined)
    {
        global.log("account == undefined");
        return ;
    }
    var user = ds.user_account_list[account];

    //删除该用户内存信息
    if(user)
    {
        if(user.socket)
        {
            var msg ={
                "op" : msg_id.NM_MUTIL_LOGIN,
                "ret" : msg_code.SUCC
            };
            user.socket.send(msg);

            close_socket(user.socket);
        }

        delete ds.user_account_list[account];
        delete ds.user_list[user.account_data.gid];
        user = null;
    }

    //通知账号服务器成功
    var billing_socket = billing_client.get_billing_socket();
    if(billing_socket != undefined)
    {
        var msg = {
            "op" : msg_id.NM_BL_KICK_USER,
            "account" : account,
            "ret" :msg_code.SUCC
        };
        billing_socket.send(msg);
    }
}
exports.on_kick_user = on_kick_user;


//账号重新绑定结果通知
function on_billing_account_rebind(data,send,s)
{
    global.log("on_billing_account_rebind");

    var old_acc = data.old_acc;
    var new_acc = data.new_acc;
    if(old_acc == undefined || new_acc == undefined)
    {
        global.log("old_acc == undefined || new_acc == undefined");
        return ;
    }
    var user = ds.user_account_list[old_acc];

    if(user && user.socket)
    {

        var role = ds.get_cur_role(user);
        if(role == undefined)
        {
            global.log("role == undefined");
            return;
        }

        //更新游戏服账号信息
        role.account=new_acc;
        user.nNeedSave=1;

        //更新内存user account数据
        user.account_data.account=new_acc;
        //清除旧key
        delete ds.user_account_list[old_acc];
        ds.user_account_list[new_acc]=user;

        //更新DB user表
        g_server.db.update(make_db.t_user,{"gid":role.gid},{"$set":{account:new_acc}});


        var msg ={
            "op" : msg_id.NM_ACCOUNT_REBIND,
            "ret" : data.ret
        };
        user.socket.send(msg);
    }
    else
    {
        global.log("user is error or user socket is error!");
    }

}
exports.on_billing_account_rebind = on_billing_account_rebind;


//关闭玩家socket连接(私有函数)
function help_close_user_socket(s)
{
    global.log("help_close_user_socket");
    if(s != undefined)
    {
        if(s.writable)
        {
            global.log("s writable is true!");
            s.end();
            s.destroy();
        }
        clearInterval(s.interval);
        s = null;
    }
}
//返回用户断线重连结果
function on_billing_reconnect_result(data,send,s)
{
    global.log("on_billing_reconnect_result");

    var account = data.acc;
    var b_ret = data.ret;
    if(account == undefined)
    {
        global.log("account == undefined || ret == undefined");
        return ;
    }

    if(b_ret==msg_code.SUCC)
    {
        var con = {"account" : account};
        g_server.db.find(make_db.t_user,con,function(arr){
            if(arr.length == 0)
            {
                global.log("account err [" + account +" ]");
                return;
            }
            var user = new ds.UserInfo();
            user.account_data = arr[0];
            user.online = 1;

            user.account_data.cur_sid = server_list[0].server_id;
            user.account_data.cur_rid = 1;

            var temp_user=ds.temp_reconn_user_list[account];
            if(temp_user==undefined)
            {
                global.err("temp_user==undefined");
                return;
            }
            help_reset_user_state(user,temp_user.socket,temp_user.send);
            delete ds.temp_reconn_user_list[account];


            var con = {"gid" : user.account_data.gid};
            g_server.db.find(make_db.t_role,con,function(role_arr){
                if(role_arr.length ==0)
                {
                    global.log("gid err [" + user.account_data.gid +" ]");
                    return;
                }

                var grid = role_arr[0].grid;
                user.role_data[grid] = role_arr[0];

                ds.user_account_list[account] = user;
                ds.user_list[arr[0].gid] = user;

                var msg = {
                    "op" : msg_id.NM_RECONNECT,
                    "ret" : msg_code.SUCC
                };
                user.send(msg);

                global.log("msg"+JSON.stringify(msg));
                role_data_logic.help_reset_role_info(user);

            });
        });
    }
    else
    {
        var temp_user=ds.temp_reconn_user_list[account];

        var msg = {
            "op" : msg_id.NM_RECONNECT,
            "ret" : b_ret
        };
        temp_user.send(msg);

        help_close_user_socket(temp_user.s);

        delete ds.temp_reconn_user_list[account];
    }
}
exports.on_billing_reconnect_result = on_billing_reconnect_result;



