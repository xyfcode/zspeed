function LogType()
{
    this.LOG_DEBUG = 1;       //系统  调试
    this.LOG_CONFIG = 2;       //系统  启动日志
    this.LOG_BEHAVIOR = 3;    //行为日志
    this.LOG_MONEY = 4;      //金钱日志
    this.LOG_MAIL = 5;     //邮件日志
    this.LOG_REGISTER = 6;//注册
    this.LOG_LOGIN = 7;//登录
    this.LOG_CLIENT_ERROR = 8;//客户端错误
}

var logType=new LogType();
exports.logType=logType;

function LogData()
{
    this.gid=0;
    this.grid=0;
    this.account='';
    this.name='';
    this.level=0;
    this.date=''; //日期
    this.event='';
    this.content='';     //
    this.type=0;    //日志类型
}
exports.LogData=LogData;

function logFileName()
{
    this.log_file_debug="sys_debug";
    this.log_file_config ="master_sys_config";
    this.log_file_behavior="user_behavior";
    this.log_file_money="user_money";
    this.log_file_mail="user_mail";
    this.log_file_register = "user_register";
    this.log_file_login = "user_login";
}
var log_file_name=new logFileName();
exports.log_file_name=log_file_name;
