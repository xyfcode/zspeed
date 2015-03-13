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


var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server = null,
    auto_save_system_data_timer=null,
    auto_clear_user_offline_timer=null,
    auto_24_timer=null;

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
        process.on('SIGINT',function(){
            close_server();
            setTimeout(function(){
                process.exit();
            },5*1000);

        });

    }

    heart_beat_timer();
    heart_beat22();
    heart_beat24();
};
exports.init=init;

//第二天凌晨定时开启的函数
function heart_beat24()
{
    var now=new Date();
    //开服时间
    var server_time=now.getTime();
    //24点字符串
    var str24=(now.getFullYear())+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" 23:59:59";
    //获取24点时间戳
    var time24=(new Date(str24)).getTime()+1000;
    //到24点开启定时器
    setTimeout(function(){
        open_auto_24_timer();
    },(time24-server_time));

}

//24点定时重置系统的一些数据
function open_auto_24_timer()
{
    //发送月卡返还
    purchase_shop_logic.auto_dispatch_cd_reward();
    //只读邮件清空
    mail_logic.auto_clear_user_mail();
    //24小时执行一次
    auto_24_timer=setInterval(function(){
        purchase_shop_logic.auto_dispatch_cd_reward();
        mail_logic.auto_clear_user_mail();
    },24*60*60*1000);
}

//晚上22点定时执行的内容
function heart_beat22()
{
    var now=new Date();
    //开服时间
    var server_time=now.getTime();
    //今日未到下午22点
    if(now.getHours()<22)
    {
        //22点字符串
        var str22=(now.getFullYear())+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" 22:00:00";
        //获取22点时间戳
        var time22=(new Date(str22)).getTime();
        //到22点开启定时器
        setTimeout(function(){
            open_auto_22_timer();
        },(time22-server_time));
    }
    else
    {
        //22点已过(3小时以后再执行该函数)
        setTimeout(function(){
            heart_beat22();
        },3*60*60*1000);

        /*
        //22点字符串(如果到月底的话，now.getDate()+1有问题)
        var str22=(now.getFullYear())+"/"+(now.getMonth()+1)+"/"+(now.getDate()+1)+" 22:00:00";
        //获取22点时间戳
        var time22=(new Date(str22)).getTime();
        //到22点开启定时器
        setTimeout(function(){
            open_auto_22_timer();
        },(time22-server_time));   */
    }
}

//下午22点定时执行的内容
function open_auto_22_timer()
{
    //发送排行榜奖励
    arena_logic.auto_provide_rank_reward();
    //24小时执行一次
    setInterval(function(){
        arena_logic.auto_provide_rank_reward();
    },24*60*60*1000);
}


function heart_beat_timer()
{
   auto_clear_user_offline_timer=setInterval(function(){
       help_tick_user_offline();
   },10*60*1000);

   auto_save_system_data_timer=setInterval(function(){
       auto_save_system_data();
   },15*60*1000);

    setInterval(function(){
        global.log("totalmem:"+require('os').totalmem());
        global.log("freemem:"+require('os').freemem());
        global.log('This process is pid ' + process.pid);
        global.log(require('util').inspect(process.memoryUsage()));
        global.log(process.memoryUsage().rss/require('os').totalmem());
    },60*1000);



}

var auto_save_system_data=function()
{
    global.log("auto_save_system_data");
    friend_logic.update_friend_data_list();
    mail_logic.update_mail_data_list();
    town_logic.update_town_data_list();
};


//定时删除离线用户信息
function help_tick_user_offline()
{
    global.log("help_tick_user_offline");
    global.log("ds.user_account_list:"+Object.keys(ds.user_account_list).length);
    global.log("ds.user_list:"+Object.keys(ds.user_list).length);
    for(var key in ds.user_account_list)
    {
        var user =  ds.user_account_list[key];
        //var role = ds.get_cur_role(user);没有创建角色之前undefined
        var now = new Date();

        global.log("user.online:"+user.online);
        global.log("now.getTime()-user.offline_time:"+(now.getTime()-user.offline_time));

        if(user.online == 0 && now.getTime()-user.offline_time >60*1000)
        {
            global.log("account:[" + user.account_data.account +"] gid:[" + user.account_data.gid + "] offline!");
            delete ds.user_list[user.account_data.gid];
            delete ds.user_account_list[key];

            if(user.socket != null && user.socket != undefined)
            {
                user.socket.end();
                user.socket.destroy();
                clearInterval(user.socket.interval);
                user.socket = null;
            }
            user = null;
        }
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
    auto_save_system_data();
}



