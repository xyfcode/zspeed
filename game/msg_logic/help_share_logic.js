/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-30
 * Time: 下午4:13
 * To change this template use File | Settings | File Templates.
 */


var log_data = require("./log_data");
var log_data_logic = require("./help_log_data_logic");
var define_code = require("./define_code");
var share_data = require("./share_data");
var ds = require("./data_struct");

var money_logic = require("./help_money_logic");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;


//获取活动状态
function on_get_share_reward(data,send,s)
{
    global.log("on_get_share_reward");

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

    var share_id=data.xid;
    if(share_id==undefined)
    {
        global.log("share_id == undefined");
        return;
    }

    var _share_data=share_data.share_data_list[share_id];
    if(_share_data==undefined)
    {
        global.log("_share_data == undefined");
        return;
    }

    money_logic.help_gain_rmb(role,_share_data.rmb);

    var msg = {
        "op" : msg_id.NM_GET_SHARE_REWARD,
        "ret" :msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "rmb":role.rmb,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_share_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_share_reward = on_get_share_reward;













