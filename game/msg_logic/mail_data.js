/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-12
 * Time: 下午5:24
 * To change this template use File | Settings | File Templates.
 */
var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

function MailData()
{
    this.mail_id = "";
    this.content = "";
    this.item ={};
}

var g_server=null;

var init=function(s)
{
    g_server=s;
    load_mail_data_list();
};
exports.init=init;

var MailDataDB=function()
{
    this.gid=0; //用户gid
    this.grid=0;  //用户grid
    this.mail_arr=[];  //value:MailBaseData
};
exports.MailDataDB=MailDataDB;


var MailBaseData=function()
{
    this.id=0; //邮件id
    this.type=0;//邮件类型 1:可以领取的邮件，2：只读邮件
    this.content="";//邮件内容
    this.date=0;//邮件创建时间
    this.attachment="";//邮件附件
};
exports.MailBaseData=MailBaseData;


//邮件道具奖励数据结构
var MailItem=function()
{
    this.type=0;//道具类型
    this.id=0;//道具id
    this.num=0;//数量
};
exports.mail_item=MailItem;

//全局变量存放用户邮件
var mail_list={}; //key:用户grid,value: MailDataDB
exports.mail_list=mail_list;


//全局变量存放用户需要更新入库的邮件的用户grid
var mail_update_db_list=[]; //grid
exports.mail_update_db_list=mail_update_db_list;


var load_mail_data_list=function()
{
    global.log("load_mail_data_list");
    g_server.db.find("t_mail_list",{},function(arr){

        if(arr.length!=0)
        {
            for(var i in arr)
            {
                var grid=arr[i].grid
                mail_list[grid]=arr[i];
            }
        }
    })
};









