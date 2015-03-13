var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var common_func=require("./common_func");

//支付金钱
function help_pay_money(role,money)
{
    global.log("help_pay_money");

    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }

    if(common_func.isEmpty(money))
    {
        global.err("param money error");
        return;
    }

    if(Number(money)||Number(money)==0)
    {
        var pay_ok=false;

        if(role.gold<money)
        {
            return pay_ok;
        }
        else
        {
            role.gold-=Math.round(money);
            pay_ok=true;
        }
        var log_content={"money":money};
        var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_pay_money",log_content,log_data.logType.LOG_MONEY);
        log_data_logic.log(logData);
        return pay_ok;
    }
    else
    {
        global.err("param money error");
        return;
    }
};
exports.help_pay_money = help_pay_money;

//获取金钱
function help_gain_money(role,money)
{
    global.log("help_pay_money");

    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }

    if(common_func.isEmpty(money))
    {
        global.err("param money error");
        return;
    }

    if(Number(money)||Number(money)==0)
    {
        role.gold+=Math.round(money);
        var log_content={"money":money};
        var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_pay_money",log_content,log_data.logType.LOG_MONEY);
        log_data_logic.log(logData);
    }
    else
    {
        global.err("param money error");
        return;
    }



};
exports.help_gain_money = help_gain_money;

//支付RMB
function help_pay_rmb(role,rmb)
{
    global.log("help_pay_rmb");

    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }
     //不能为空
    if(common_func.isEmpty(rmb))
    {
        global.err("param rmb error");
        return;
    }
    //必须是数字
    if(Number(rmb)||Number(rmb)==0)
    {
        var pay_ok=false;

        if(role.rmb<rmb)
        {
            return pay_ok;
        }
        else
        {
            role.rmb-=Math.round(rmb);
            pay_ok=true;
        }
        var log_content={"rmb":rmb};
        var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_pay_rmb",log_content,log_data.logType.LOG_MONEY);
        log_data_logic.log(logData);
        return pay_ok;
    }
    else
    {
        global.err("param rmb error");
        return;
    }
};
exports.help_pay_rmb = help_pay_rmb;

//获取RMB
function help_gain_rmb(role,rmb)
{
    global.log("help_gain_rmb");

    if(role==undefined || rmb==undefined)
    {
        global.log("role==undefined || money==undefined");
        return;
    }

    if(common_func.isEmpty(rmb))
    {
        global.err("param rmb error");
        return;
    }
    if(Number(rmb)||Number(rmb)==0)
    {
        role.rmb+=Math.round(rmb);
        var log_content={"rmb":rmb};
        var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_gain_rmb",log_content,log_data.logType.LOG_MONEY);
        log_data_logic.log(logData);
    }
    else
    {
        global.err("param rmb error");
        return;
    }
};
exports.help_gain_rmb = help_gain_rmb;