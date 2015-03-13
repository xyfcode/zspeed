var  billing_logic = require("./msg_logic/help_billing_logic");
var  gm_billing_logic = require("./msg_logic/help_gm_billing_logic");
var  purchase_shop_logic = require("./msg_logic/help_purchase_shop_logic");
var  gift_logic = require("./msg_logic/help_gift_logic");

var handler = {
	"___connect___" : new on_socket_connect(),
	"___close___"  : new on_close() ,
    "6" : new on_billing_update_server_result(), //billing 返回的服务器状态结果
    "26" : new on_gs_user_login(),
    "28" : new on_kick_user(),  //玩家账号在另一个设备登录，踢出该设备用户
    "29" : new on_billing_account_rebind(),  //快速登录账号绑定billing返回结果
    "30" : new on_gs_verify_cd_key(),
    "purchase_verify" : new on_billing_purchase_verify_result(),//用户支付(billing返回的验证结果)
    "100" : new on_change_activity(), //更改活动(GM)
    "101" : new on_change_notice(), //更改公告 (GM)
    "102" : new on_gm_role_data(), //获取用户数据 (GM)
    "103" : new on_gm_edit_role_data(), //编辑用户数据 (GM)
    "104" : new on_gm_send_role_mail() //发送用户邮件 (GM)
};

exports.handler = handler;

var global_server = null;
var g_billing_timer,billing_socket = null;

exports.get_billing_socket = function()
{
	return billing_socket;
};

exports.server = function(server)
{
	global_server = server;
};


function on_socket_connect()
{
	this.handle = function(s)
	{
		global.log("connect billing server ok !");

        billing_socket = s;

		s.setTimeout( 65 * 1000);
		s.addListener('timeout',function(){
			var msg = {op:"heartbeat",alived:1};
			s.send(msg);
		});

		if(!g_billing_timer)
		{
			g_billing_timer = setInterval(function(){
                billing_logic.on_tick_server_status(s.send);
			},60*1000);
		}
		billing_logic.on_update_server_status(s.send);
	}
}

function on_close()
{
	this.handle = function(s)
	{
        global.log("on_close ,ip:"+s.c_ip+",port:"+ s.c_port);
		clearInterval(g_billing_timer);
	}
}

function on_gs_user_login()
{
    this.handle = function(data,send,s)
    {
        billing_logic.on_gs_user_login(data,send,s);
    }
}

function on_billing_update_server_result()
{
    this.handle = function(data,send,s)
    {
        billing_logic.on_billing_update_server_result(data,send,s);
    }
}

function on_kick_user()
{
    this.handle = function(data,send,s)
    {
        billing_logic.on_kick_user(data,send,s);
    }
}

function on_billing_account_rebind()
{
    this.handle = function(data,send,s)
    {
        billing_logic.on_billing_account_rebind(data,send,s);
    }
}

//处理GM工具
function on_change_activity()
{
    this.handle = function(data,send,s)
    {
        gm_billing_logic.on_change_activity(data,send,s);
    }
}

function on_change_notice()
{
    this.handle = function(data,send,s)
    {
        gm_billing_logic.on_change_notice(data,send,s);
    }
}

function on_gm_role_data()
{
    this.handle = function(data,send,s)
    {
        gm_billing_logic.on_gm_role_data(data,send,s);
    }
}

function on_gm_edit_role_data()
{
    this.handle = function(data,send,s)
    {
        gm_billing_logic.on_gm_edit_role_data(data,send,s);
    }
}

function on_gm_send_role_mail()
{
    this.handle = function(data,send,s)
    {
        gm_billing_logic.on_gm_send_role_mail(data,send,s);
    }
}

function on_billing_purchase_verify_result()
{
    this.handle = function(data,send,s)
    {
        purchase_shop_logic.on_billing_purchase_verify_result(data,send,s);
    }
}

function on_gs_verify_cd_key()
{
    this.handle = function(data,send,s)
    {
        gift_logic.help_get_gift_result(data,send,s);
    }
}
