/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-30
 * Time: 上午10:31
 * To change this template use File | Settings | File Templates.
 */

var make_db = require("./make_db");
var ds = require("./data_struct");
var define_code = require("./define_code");
var server_config_data = require("./server_config_data");
var billing_client = require("../billing_client");
var common_func = require("./common_func");
var init_data = require("./initialization_data");
var formation_data = require("./formation_data");
var play_name = require("./play_name");
var key_words = require("./key_words_data");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var card_logic = require("./help_card_logic");
var formation_logic = require("./help_formation_logic");
var town_logic = require("./help_town_logic");
var tick_logic = require("./help_tick_logic");
var role_data_logic = require("./help_role_data_logic");
var friend_data_logic = require("./help_friend_logic");
var activity_logic = require("./help_activity_logic");
//var gm_billing_logic = require("./help_gm_billing_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var server_list=server_config_data.server_config_data_list;

var g_server=null;
function init(s)
{
    g_server=s;
}
exports.init=init;

//用户定时器
function help_user_tick(s)
{
    if(s == null || s == undefined || s.nAliveTime == undefined)
    {
        return;
    }
    var now_time = new Date().getTime();
    if(now_time - s.nAliveTime > 90 * 1000)
    {
        global.log("now.getTime() - s.nAliveTime > 90 * 1000");
        global.log("now_time:"+now_time);
        global.log("s.nAliveTime:"+s.nAliveTime);
        global.log("ip:"+ s.c_ip+",port:"+ s.c_port);
        help_close_user_socket(s);
        return;
    }
    //save user data
    var user= ds.user_list[s.gid];
    //用户数据5秒更新入库一次
    if(user && user.nNeedSave == 1 && now_time-user.nSaveDBTime >5*1000)
    {
        global.log("account:[" + user.account_data.account +"] gid:[" + user.account_data.gid + "] upgraded!");
        tick_logic.auto_save_data(user);

        user.nNeedSave = 0;
        user.nSaveDBTime = now_time;
    }

}

//玩家socket连接
function on_user_socket_connect(s)
{
    global.log("on_user_socket_connect,ip:"+s.c_ip+",port:"+ s.c_port);
    s.nAliveTime = (new Date()).getTime();
    s.interval = setInterval(function(){
        help_user_tick(s);
    },3*1000);
}
exports.on_user_socket_connect = on_user_socket_connect;

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


//玩家socket断开连接,用户下线
function on_user_socket_close(s)
{
    global.log("on_user_socket_close ,ip:"+s.c_ip+",port:"+ s.c_port);

    if(s == undefined)
    {
        return;
    }

    //处理用户下线
    var user = ds.user_list[s.gid];
    if(user)
    {
        global.log("help user offline");
        var now = new Date();
        user.offline_time = now.getTime();
        var role = ds.get_cur_role(user);
        if(role != undefined)
        {
            role.offline_time  = now.getTime();

            var time = now.getTime() - role.login_time;
            if(role.online_time >= 0)
            {
                role.online_time += time;
            }
            else
            {
                role.online_time = 0;
            }
            //保存用户数据入库
            tick_logic.auto_save_data(user);
        }
        if(user.rand_name != null)
        {
            //该用户没有创建角色，名字返还
            if(!common_func.isEmpty(user.rand_name.name))
            {
                if(play_name.play_name_data_list[user.rand_name.name])
                {
                    play_name.play_name_arr.push(user.rand_name.name);
                }
            }
        }

        //注意并没有从内存中删除用户数据
        user.nNeedSave = 0;
        user.online = 0;
        user.socket = null;
        user.send = null;

        var billing_socket = billing_client.get_billing_socket();
        if(billing_socket != undefined)
        {
            global.log("user account [" + user.account_data.account +"] offline");
            var msg ={
                "op" : msg_id.NM_BL_USER_OFFLINE,
                "account" : user.account_data.account
            };
            billing_socket.send(msg);
        }
        help_close_user_socket(s);
    }
    else
    {
        help_close_user_socket(s);
    }
}
exports.on_user_socket_close = on_user_socket_close;

//用户登录
function on_user_login(data,send,s)
{
    global.log("on_user_login");

    var account =common_func.get_account_by_type(data.ac,data.type) ;
    var pwd = data.pwd;
    var md5_str = data.token;
    var login_type = data.type;
    var platform_type=data.pft;

    if(account == undefined || pwd == undefined || md5_str == undefined || login_type == undefined || platform_type==undefined)
    {
        global.log("account == undefined || pwd == undefined || md5_str == undefined || login_type == undefined || platform_type==undefined");
        return;
    }

    var temp_user = ds.temp_user_account_list[account];
    var now = new Date();
    if(temp_user == undefined)
    {
        temp_user = new ds.TempUserInfo();
    }

    temp_user.account = account;
    temp_user.pwd  = pwd;
    temp_user.key  = md5_str;
    temp_user.login_type = login_type;
    temp_user.pft=platform_type;

    //保存socket属性，用于billing返回后使用
    temp_user.socket = s;
    temp_user.send = s.send;

    ds.temp_user_account_list[account] = temp_user;

    var msg = {
        "op": msg_id.NM_BL_GS_USER_LOGIN,
        "account" : account,
        "pwd" : pwd,
        "md5_str" : md5_str,
        "cur_sid" : server_list[0].server_id
    };

    var b_socket = billing_client.get_billing_socket();
    if(b_socket != null)
    {
        b_socket.send(msg);
        global.log("send to billing_server ok!");
    }
    else
    {
        global.log("billing socket error!");
    }

}
exports.on_user_login = on_user_login;

//创建用户数据结构
function on_create_role(data,send,s)
{
    global.log("on_create_role");

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

    var role_name = data.name;
    //名字不能为空
    if(common_func.isEmpty(role_name))
    {
        global.log("role_name == undefined");
        var msg = {
            "op" : msg_id.NM_CREATE_ROLE,
            "ret" : msg_code.NAME_TOO_ERROR
        };
        send(msg);
        return;
    }
    //名字不能长于10个字符
    if(role_name.length >10)
    {
        var msg = {
            "op" : msg_id.NM_CREATE_ROLE,
            "ret" : msg_code.NAME_TOO_ERROR
        };
        send(msg);
        return;
    }
    //不能包含非法字符，不能包含任何空白字符，包括空格、制表符、换页符等
    var reg=/\s/;
    /*if(key_words.reg.test(role_name) || reg.test(role_name))
    {
        var msg = {
            "op" : msg_id.NM_CREATE_ROLE,
            "ret" : msg_code.INVALID_CODE_EXIST
        };
        send(msg);
        return;
    }*/

    var sid = server_list[0].server_id;
    ds.check_server_role_list(user,sid);

    var s_data = user.account_data.s_ls[sid];
    if(s_data == undefined)
    {
        global.log("s_data == undefined");
        return;
    }

    var rid = 1;
    g_server.db.find(make_db.t_role,{"data.name" : role_name},function(arr){
            if(arr.length == 0)
            {
                //如果是随机生成的名字，则更改名字库状态
                if(play_name.play_name_data_list[role_name])
                {
                    g_server.db.update(make_db.t_rand_name_list,{name:role_name},{"$set":{"used":1}});
                }

                var role_data = new ds.RoleDataDB();
                var role = role_data.data;
                role.account=user.account_data.account;
                role.pft=user.account_data.pft;

                role.gid  = gid;
                role.grid = make_db.get_global_unique_id();
                role.rid = rid;
                role_data.gid = gid;
                role_data.grid = role.grid;
                role_data.rid = role.rid;
                role.name = role_name;
                for(var i=0;i<7;i++)
                {
                    role.lg_reward.push(0);//7登录奖励领取状态
                }

                //init role achievement
                role_data_logic.help_init_role_achievement(role);
                //init role data
                help_initialize_role_info(role);
                //init tn data
                town_logic.help_init_role_town(role);
                //init role formation
                formation_logic.help_init_formation_data(role);
                //init role friend
                friend_data_logic.help_init_friend_data(role);
                //init role activity
                activity_logic.help_init_activity_data(role);

                var now_time = (new Date()).getTime();
                role.time_stamina = now_time;
                role.time_explore = now_time;
                role.c_date = now_time;
                role.login_count = 0;
                role.online_time = 0;
                role.offline_time = now_time;
                role.cbag_time = now_time;
                role.ebag_time = now_time;
                //保存用户role数据
                make_db.insert_role_data(role_data);

                //更新USER数据
                user.role_data[role.grid] = role_data;
                s_data.r_ls[role.rid] = role.grid;
                user.account_data.cur_sid = sid;
                user.account_data.cur_rid = rid;
                //置空用户随机名
                user.rand_name=null;
                //更新数据库user数据
                make_db.update_user_data(user);

                var msg = {
                    "op" : msg_id.NM_CREATE_ROLE,
                    "ret" : msg_code.SUCC
                };
                send(msg);

                var log_content={"msg":JSON.stringify(msg)};
                var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_create_role",log_content,log_data.logType.LOG_REGISTER);
                log_data_logic.log(logData);
            }
            else
            {
                var msg = {
                    "op" : msg_id.NM_CREATE_ROLE,
                    "ret" : msg_code.NAME_IS_EXIST
                };
                send(msg);
            }
        });

}
exports.on_create_role = on_create_role;

//初始化用户数据
function help_initialize_role_info(role)
{
   //初始化数据
    var _data =  init_data.initialization_data;
   if(_data != undefined)
   {
       role.level = _data.level;//等级
       role.gold =  _data.gold;//游戏币
       role.rmb   = _data.rmb;//初始金币
       role.stamina = const_value.STAMINA_MAX;   //初始体力值
       role.explore = const_value.EXPLORE_INIT_LIMIT;//初始化探索次数
       role.score = _data.score;   //人气
       role.cbag_limit = const_value.CARD_BAG_LIMIT;//背包容量

       //初始化卡牌背包
       var card_arr=_data.init_card;
       for(var i = 0;i<card_arr.length ;i++)
       {
           card_logic.help_create_role_card(role,card_arr[i]);
       }
   }
}

//进入游戏
function on_enter_game(data,send,s)
{
    global.log("on_enter_game");
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
        "op" : msg_id.NM_ENTER_GAME,
        "ret" :msg_code.SUCC
    };
    send(msg);

    //重置用户信息
    role_data_logic.help_reset_role_info(user);
    role_data_logic.help_notice_role_msg(role,send);

    //公告缓存数据
    //gm_billing_logic.help_send_user_notice();

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_enter_game",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_enter_game = on_enter_game;

//随机用户名
function on_random_name(data,send,s)
{
    global.log("on_random_name");
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

    //可用名字库无新名字
    if(play_name.play_name_arr.length <= 0)
    {
        var msg ={
            "op":msg_id.NM_RANDOM_NAME,
            "ret" : msg_code.RAN_NAME_NOT_ENOUGH //没有可用随机名
        };
        send(msg);
    }

    if(user.rand_name == null)
    {
        user.rand_name = new ds.RandName();
    }
    else if(play_name.play_name_data_list[user.rand_name.name])
    {
        //该名字未使用，放回名字库
        play_name.play_name_arr.push(play_name.play_name_data_list[user.rand_name.name]);
    }

    var _name;
    while(play_name.play_name_arr.length)
    {
        var r=common_func.help_make_one_random(0,play_name.play_name_arr.length-1);
        _name = play_name.play_name_arr[r].name;
        play_name.play_name_arr.splice(r,1);
        /*if(key_words.reg.test(_name))
        {
            global.log("error name:"+_name);
            continue;
        }*/
        break;
    }

    var msg ={
        "op":msg_id.NM_RANDOM_NAME,
        "name" : _name,
        "ret" : msg_code.SUCC
    };
    send(msg);

    user.rand_name.name = _name;
}
exports.on_random_name = on_random_name;

//断线重新连接
function on_user_reconnect(data,send,s)
{
    global.log("on_user_reconnect");

    if(s == null || s == undefined)
    {
        global.log("s == null || s == undefined ");
        return;
    }

    var account=data.ac;
    var type=data.type;
    var pwd=data.pwd;
    if(account==undefined || type==undefined || pwd ==undefined)
    {
        global.log("account==undefined || type==undefined || pwd ==undefined");
        return;
    }

    account =common_func.get_account_by_type(account,type) ;
    if(account == undefined)
    {
        global.log("account == undefined");
        return;
    }

    var now = new Date();
    var user = ds.user_account_list[account];
    if(user)
    {
        //如果已经有其他玩家登录，则踢出该玩家
        global.log("help other user offline!");
        if(user.socket)
        {
            var msg ={
                "op" : msg_id.NM_MUTIL_LOGIN,
                "ret" : msg_code.SUCC
            };
            user.socket.send(msg);
            //关闭该socket
            help_close_user_socket(user.socket);
        }

        delete ds.user_account_list[account];
        delete ds.user_list[user.account_data.gid];
        user = null;
    }

    var temp=new ds.UserInfo();
    temp.socket=s;
    temp.send=send;

    ds.temp_reconn_user_list[account]=temp;

    //去账号服务器确定
    var billing_socket = billing_client.get_billing_socket();
    if(billing_socket)
    {
        var msg = {
            "op" : msg_id.NM_USER_RECONNECT_TO_BILLING,
            "account" : account,
            "pwd" : data.pwd
        };
        billing_socket.send(msg);
    }
}
exports.on_user_reconnect = on_user_reconnect;

//快速登录账号重新绑定
function on_account_rebind(data,send,s)
{
    global.log("on_account_rebind");

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


    //校验密码：只能输入6-20个字母、数字、下划线
    var reg=/^(\w){6,20}$/;
    if(!reg.test(data.ac))
    {
        var msg = {
            "op"   :  msg_id.NM_ACCOUNT_REBIND,
            "ret" : msg_code.ACCOUNT_FORMAT_ERROR
        };
        send(msg);
        return;
    }

    //不能以guest开头
    var guest_reg=/^guest/;
    if(guest_reg.test(data.ac))
    {
        var msg = {
            "op"   :  msg_id.NM_ACCOUNT_REBIND,
            "ret" : msg_code.ACCOUNT_GUEST_ERROR
        };
        send(msg);
        return;
    }

    var new_ac=common_func.get_account_by_type(data.ac,define_code.loginType.LT_DEFAULT);

    var new_pwd=data.pwd;
    if(new_ac == undefined || new_pwd==undefined)
    {
        global.log("new_ac == undefined || new_pwd==undefined");
        return;
    }

    //检测密码
    if(new_pwd.length<6||new_pwd.length>20)
    {
        var msg = {
            "op"   :  msg_id.NM_USER_REGISTER,
            "ret" : msg_code.PWD_FORMAT_ERROR
        };
        s.send(msg);
        return;
    }


    g_server.db.find(make_db.t_user,{"account":new_ac},function(arr){
        if(arr.length==0)
        {
            //通知账号服务器修改账号密码
            var b_msg = {
                "op": msg_id.NM_BL_ACCOUNT_BIND,
                "old_account" : role.account,
                "new_account" : new_ac,
                "new_pwd" : new_pwd
            };

            var b_socket = billing_client.get_billing_socket();
            if(b_socket != null)
            {
                b_socket.send(b_msg);
                global.log("send to billing_server ok!");
            }
            else
            {
                global.log("billing socket error!");
                var msg = {
                    "op" : msg_id.NM_ACCOUNT_REBIND,
                    "ret" : msg_code.SERVER_ERROR
                };
                send(msg);
                return;
            }

            var log_content={"msg":msg};
            var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_account_rebind",log_content,log_data.logType.LOG_BEHAVIOR);
            log_data_logic.log(logData);
        }
        else
        {
            var msg = {
                "op"   :  msg_id.NM_ACCOUNT_REBIND,
                "ret" : 1002
            };
            s.send(msg);
        }
    });

}
exports.on_account_rebind = on_account_rebind;


//重设用户状态
function help_reset_user_state(user,send,s)
{
    global.log("help_reset_user_state");
    if(user == undefined || send == undefined || s == undefined)
    {
        global.log("user == undefined || send == undefined || s == undefined");
        return;
    }
    var now = new Date();
    s.nAliveTime = now.getTime();
    s.gid = user.account_data.gid;
    s.account = user.account_data.account;

    user.send = send;
    user.socket = s;
}
