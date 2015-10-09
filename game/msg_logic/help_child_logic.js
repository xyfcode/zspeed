/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-3
 * Time: 下午9:36
 * To change this template use File | Settings | File Templates.
 */

var make_db = require("./make_db");
var common_func = require("./common_func");
var define_code = require("./define_code");
var ds = require("./data_struct");
var formation_logic = require("./help_formation_logic");
var mail_logic = require("./help_mail_logic");
var friend_logic = require("./help_friend_logic");
var purchase_shop_logic = require("./help_purchase_shop_logic");
var town_logic = require("./help_town_logic");
var arena_logic = require("./help_arena_logic");
var role_data_logic = require("./help_role_data_logic");


var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server = null;

var init=function(s)
{
    g_server=s;
    if(g_server.socket_server)
    {
        g_server.socket_server.on('exit',close_server);
    }
    if(g_server.config.test==1)
    {
        //控制台模式，监听程序打断事件
        /*process.on('SIGINT',function(){
            global.log(11)
            close_server();
            setTimeout(function(){
                process.exit();
            },5*1000);

        });*/

    }
    process.on('message',child_process);
};
exports.init=init;

var handler={
    "tick" : new on_tick(),
    "town_tick" : new on_town_tick(),
    "tick_user_offline"  : new on_tick_user_offline(),
    "save_system_data"  : new on_save_system_data(),
    "get_system_info" : new on_get_system_info()
};

function child_process(msg)
{
    global.log("child receive data is :"+JSON.stringify(msg));
    handler[msg.op].handle(msg);
}

function on_tick()
{
    this.handle = function(msg)
    {
        if(msg.param==0)
        {
            global.log("this time is 24");
            //发送月卡返还
            purchase_shop_logic.auto_dispatch_cd_reward();
            //只读邮件清空
            mail_logic.auto_clear_user_mail();
            //清除战斗好友缓存
            friend_logic.auto_clear_fight_list();
        }
        else if(msg.param==22)
        {
            global.log("this time is 22");
            //发送排行榜奖励
            arena_logic.auto_provide_rank_reward();
        }
    }
}

function on_town_tick()
{
    this.handle = function(msg)
    {
        town_logic.help_town_fight_rank(msg);
    }
}

function on_save_system_data()
{
    this.handle = function(msg)
    {
        global.log("on_save_system_data");
        friend_logic.update_friend_data_list();
        mail_logic.update_mail_data_list();
        town_logic.update_town_data();
        town_logic.update_town_title_data();
    }
}

function on_tick_user_offline()
{
    this.handle = function(msg)
    {
        global.log("on_tick_user_offline");
        global.log("ds.user_account_list:" + Object.keys(ds.user_account_list).length);
        global.log("ds.user_list:" + Object.keys(ds.user_list).length);
        for (var key in ds.user_account_list) {
            var user = ds.user_account_list[key];
            //var role = ds.get_cur_role(user);没有创建角色之前undefined
            var now = new Date();

            global.log("user.online:" + user.online);
            global.log("now.getTime()-user.offline_time:" + (now.getTime() - user.offline_time));

            if (user.online == 0 && now.getTime() - user.offline_time > 60 * 1000) {
                global.log("account:[" + user.account_data.account + "] gid:[" + user.account_data.gid + "] offline!");
                delete ds.user_list[user.account_data.gid];
                delete ds.user_account_list[key];

                if (user.socket != null && user.socket != undefined) {
                    user.socket.end();
                    user.socket.destroy();
                    clearInterval(user.socket.interval);
                    user.socket = null;
                }
                user = null;
            }
        }
    }
}



function on_get_system_info()
{
    this.handle = function(msg)
    {
        global.log("totalmem:" + require('os').totalmem());
        global.log("freemem:" + require('os').freemem());
        global.log('This process is pid ' + process.pid);
        global.log(require('util').inspect(process.memoryUsage()));
        global.log(process.memoryUsage().rss / require('os').totalmem());
    }
}

//存储用户信息
function auto_save_data(user)
{
    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        return;
    }
    make_db.update_role_data(role);
    formation_logic.sava_role_formation(role);
}
exports.auto_save_data=auto_save_data;

//服务器关闭，最好等待5秒以上，数据全部入库
function close_server()
{
    g_server.socket_server.close(function(){
        global.log("server is closed!");
    });
    for(var key in ds.user_account_list)
    {
        var user =  ds.user_account_list[key];
        if(user && user.socket)
        {
            user.socket.emit("close");
        }
    }
    on_save_system_data();
}



