var log_data=require("./log_data.js");

function help_create_log_data(gid,account,grid,level,name,event,content,type)
{
    var fd;
    if(gid==undefined)
    {
        gid=0;
    }
    if(account==undefined)
    {
        account=0;
    }
    if(grid==undefined)
    {
        grid=0;
    }
    if(level==undefined)
    {
        level=0;
    }
    if(name==undefined)
    {
        name=0;
    }
    if(event==undefined || content==undefined || type==undefined )
    {
        return fd;
    }

    fd=new log_data.LogData();
    fd.gid=gid;
    fd.account=account;
    fd.grid=grid;
    fd.level=level;
    fd.name=name;
    fd.event=event;
    fd.content=content;
    fd.type=type;

    fd.date="";

    return fd;

};
exports.help_create_log_data=help_create_log_data;

function log(logData)
{
    var now=new Date();
    var year=now.getFullYear();
    var month=Number(now.getMonth())+1;
    var date=now.getDate();
    var hour=now.getHours();
    var minute=now.getMinutes();
    var second=now.getSeconds();

    var d=year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    var log_file_name;
    logData.date=d;

    switch (logData.type)
    {
        case log_data.logType.LOG_CONFIG  :
            log_file_name=log_data.log_file_name.log_file_config;
            break;
        case log_data.logType.LOG_BEHAVIOR  :
            log_file_name=log_data.log_file_name.log_file_behavior;
            break;
        case log_data.logType.LOG_MONEY  :
            log_file_name=log_data.log_file_name.log_file_money;
            break;
        case log_data.logType.LOG_MAIL  :
            log_file_name=log_data.log_file_name.log_file_mail;
            break;
        case log_data.logType.LOG_REGISTER  :
            log_file_name=log_data.log_file_name.log_file_login;
            break;
        case log_data.logType.LOG_LOGIN  :
            log_file_name=log_data.log_file_name.log_file_login;
            break;
        case log_data.logType.LOG_CLIENT_ERROR  :
            log_file_name=log_data.log_file_name.log_file_error;
            break;
    }

    global.log2(log_file_name,logData);
};
exports.log=log;