/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-13
 * Time: 下午2:29
 * To change this template use File | Settings | File Templates.
 */
var mail_data = require("./mail_data");
var make_db = require("./make_db");
var ds=require("./data_struct");
var define_code = require("./define_code");
var log_data=require("./log_data");
var recharge_reward_data=require("./recharge_reward_data");

var log_data_logic=require("./help_log_data_logic");
var common_func=require("./common_func");
var role_data_logic=require("./help_role_data_logic");
var drop_logic=require("./help_drop_logic");

var user_list=ds.user_list;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;

var create_mail_data=function(recev_gid,recev_grid,type,content,attachment)
{
    global.log("create_mail_data");
    if(recev_gid==undefined || recev_grid==undefined ||type==undefined || content==undefined || attachment==undefined)
    {
        global.log("recev_gid==undefined || recev_grid==undefined ||type==undefined || content==undefined || attachment==undefined");
        return;
    }

    var mail=new mail_data.MailBaseData();
    mail.id=make_db.get_global_unique_id();
    mail.type=type;
    mail.content=content;
    mail.attachment=attachment;

    var now=new Date();
    mail.date= now.getTime();

    var role_mail_date=mail_data.mail_list[recev_grid];
    if(role_mail_date==undefined)
    {
        var mail_data_db=new mail_data.MailDataDB();
        mail_data_db.gid=recev_gid;
        mail_data_db.grid=recev_grid;
        mail_data_db.mail_arr.unshift(mail);

        //数据入库
        make_db.insert_mail_data(mail_data_db);
        //存放全局变量中
        mail_data.mail_list[recev_grid]=mail_data_db;
    }
    else
    {
        if(role_mail_date.mail_arr.length>=const_value.MAIL_MAX)
        {
            role_mail_date.mail_arr.pop();
        }
        role_mail_date.mail_arr.unshift(mail);
        //放入更新列表中，定时入库
        mail_data.mail_update_db_list.push(recev_grid);
    }
    return mail;
};
/*
 recev_gid:邮件接收者gid
 recev_grid:邮件接收者grid
 content:邮件内容
 item:奖励
 not_send:不立即发送给用户。
 */
var help_create_mail_data=function(recev_gid, recev_grid,type,content,attachment,not_send)
{
    global.log("help_create_mail_data");

    if(recev_gid==undefined || recev_grid== undefined || type==undefined)
    {
        global.log("recev_gid==undefined || recev_grid== undefined || type==undefined");
        return;
    }

    if(content==undefined)
    {
        global.log("content==undefined");
        return;
    }

    if(attachment==undefined)
    {
        attachment="";
    }

    var mail=create_mail_data(recev_gid, recev_grid,type,content,attachment);
    var client_mails=[];

    if(mail!=undefined)
    {
        client_mails.push(mail);
        var user=user_list[recev_gid];

        if(user==undefined || not_send)
        {
            //用户不在线
        }
        else if(user.online && user.send)
        {
            //用户在线，则发送邮件
            var msg=
            {
                "op":msg_id.NM_MAIL_DATA,
                "mails":client_mails,
                "ret": msg_code.SUCC
            };

            user.send(msg);
            global.log("msg:"+JSON.stringify(msg));
        }
    }

};
exports.help_create_mail_data=help_create_mail_data;

//发送用户邮件列表
var on_role_mail_list=function(data,send,s)
{
    global.log("on_role_mail_list");

    var gid= s.gid;
    if(gid==undefined)
    {
        global.log("gid==undefined");
        return;
    }
    var user=user_list[gid];
    if(user==undefined)
    {
        global.log("user==undefined");
        return;
    }

    var role=ds.get_cur_role(user);
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }

    var _mail_data=mail_data.mail_list[role.grid];

    var client_mail;

    if(_mail_data==undefined)
    {
        client_mail=[];
    }
    else
    {
        client_mail=_mail_data.mail_arr;
    }

    var msg=
    {
        "op":msg_id.NM_ROLE_MAIL_LIST,
        "mails":client_mail,
        "ret": msg_code.SUCC
    };
    send(msg);

    var log_content={"client_mail":client_mail};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_role_mail_list",log_content,log_data.logType.LOG_MAIL);
    log_data_logic.log(logData);

};
exports.on_role_mail_list=on_role_mail_list;

//领取邮件奖励
var on_gain_mail_reward=function(data,send,s)
{
    global.log("on_gain_mail_reward");

    var gid= s.gid;
    if(gid==undefined)
    {
        global.log("gid==undefined");
        return;
    }
    var user=user_list[gid];
    if(user==undefined)
    {
        global.log("user==undefined");
        return;
    }

    var role=ds.get_cur_role(user);
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }

    var type=data.type;
    if(type==undefined)
    {
        global.log("type==undefined");
        return;
    }

    var role_mail_data=mail_data.mail_list[role.grid];
    if(role_mail_data==undefined)
    {
        global.log("role_mail_data==undefined");
        return;
    }

    if(role_mail_data.mail_arr.length<=0)
    {
        var msg = {
            "op" :msg_id.NM_GAIN_MAIL_REWARD,
            "ret" : msg_code.MAIL_NOT_EXIST
        };
        send(msg);
        return;
    }

    var rewards=[];
    var delete_mail=[];
    var is_full=0;
    //单个领取
    if(type==1)
    {
        var id=data.id;
        if(id==undefined)
        {
            global.log("id==undefined");
            return;
        }

        for(var i=0;i<role_mail_data.mail_arr.length;i++)
        {
            if(role_mail_data.mail_arr[i].id==id&&role_mail_data.mail_arr[i].type==const_value.MAIL_TYPE_REWARD)
            {
                var item_data=role_mail_data.mail_arr[i].attachment;
                //奖励存在
                if(item_data)
                {
                    //获取奖励
                    var gain_item=drop_logic.help_put_item_to_role(role,item_data.id,item_data.num,item_data.type);
                    if(gain_item.uids.length>0)
                    {
                        rewards.push({"type":item_data.type,"uids":gain_item.uids,"xid":item_data.id,"num":item_data.num});
                    }
                    delete_mail.push(role_mail_data.mail_arr[i].id);
                    //删除邮件
                    role_mail_data.mail_arr.splice(i,1);
                    mail_data.mail_update_db_list.push(role_mail_data.grid);//放入更新列表中，定时入库
                }
                break;
            }
        }
    }
    else if(type==2)
    {
        var is_delete_mail=0;
        for(var i=0;i<role_mail_data.mail_arr.length;i++)
        {
            //是奖励邮件
            if(role_mail_data.mail_arr[i].type==const_value.MAIL_TYPE_REWARD)
            {
                var item_data=role_mail_data.mail_arr[i].attachment;
                //奖励存在
                if(item_data)
                {
                    //获取奖励
                    var gain_item=drop_logic.help_put_item_to_role(role,item_data.id,item_data.num,item_data.type);
                    if(gain_item.uids.length>0)
                    {
                        rewards.push({"type":item_data.type,"uids":gain_item.uids,"xid":item_data.id,"num":item_data.num});
                    }
                    delete_mail.push(role_mail_data.mail_arr[i].id);
                    //删除邮件
                    role_mail_data.mail_arr.splice(i,1);
                    is_delete_mail=1;
                    i--;
                }
            }
            else
            {
                //删除邮件,其它目前都是只读邮件。可直接删除
                role_mail_data.mail_arr.splice(i,1);
                is_delete_mail=1;
                i--;
            }
        }

        if(is_delete_mail)
        {
            mail_data.mail_update_db_list.push(role_mail_data.grid);//放入更新列表中，定时入库
        }
    }

    var msg = {
        "op" :msg_id.NM_GAIN_MAIL_REWARD,
        "delete_mail":delete_mail,
        "rewards":rewards,
        "ret" : msg_code.SUCC
    };

    send(msg);
    user.nNeedSave=1;

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "exp" : role.exp ,
        "level":role.level,
        "gold":role.gold,
        "rmb":role.rmb ,
        "score":role.score,
        "stamina":role.stamina, //体力
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));


    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gain_mail_reward",log_content,log_data.logType.LOG_MAIL);
    log_data_logic.log(logData);

};
exports.on_gain_mail_reward=on_gain_mail_reward;


//用户首次充值，发送首冲礼包邮件
var help_send_first_purchase_mail=function(recev_gid,recev_grid,account)
{
    global.log("help_send_first_purchase_mail");

    if(recev_gid == undefined||recev_grid==undefined)
    {
        global.log("recev_gid == undefined||recev_grid==undefined");
        return;
    }

    for(var key in recharge_reward_data.recharge_reward_data_list)
    {
        var _reward_data=recharge_reward_data.recharge_reward_data_list[key];
        if(_reward_data.item_num>0)
        {
            var recev_gid=recev_gid;
            var recev_grid=recev_grid;
            var content="首冲礼包";

            //邮件附件是道具
            var item=new Object();
            item.type=_reward_data.item_type;
            item.id=_reward_data.item_id;
            item.num=_reward_data.item_num;

            //创建角色的时候触发，不会立即给用户发送邮件
            help_create_mail_data(recev_gid, recev_grid,const_value.MAIL_TYPE_REWARD,content,item);
        }
    }

    var log_content={};
    var logData=log_data_logic.help_create_log_data(recev_gid,account,recev_grid,0,0,"help_send_first_purchase_mail",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
};
exports.help_send_first_purchase_mail=help_send_first_purchase_mail;

//用户排行榜奖励，发送邮件
var help_send_role_rank_mail=function(role_gid,role_grid,rank_reward)
{
    global.log("help_send_role_rank_mail");

    if(role_gid == undefined || role_grid == undefined || rank_reward == undefined)
    {
        global.log("role_gid == undefined || role_grid == undefined || rank_reward == undefined");
        return;
    }
    var content="排行榜奖励";
    var item=common_func.cloneObject(rank_reward);
    help_create_mail_data(role_gid, role_grid,const_value.MAIL_TYPE_REWARD, content,item);
};
exports.help_send_role_rank_mail=help_send_role_rank_mail;

//用户月卡奖励，发送邮件
var help_send_role_cd_reward_mail=function(gid,grid,num)
{
    global.log("help_send_role_cd_reward_mail");

    if(gid == undefined || grid == undefined || num == undefined)
    {
        global.log("gid == undefined || grid == undefined || num == undefined");
        return;
    }

    var recev_gid=gid;
    var recev_grid=grid;
    var content="每日月卡奖励";

    var item=new Object();
    item.type=const_value.REWARD_TYPE_RMB;
    item.id="";
    item.num=num;

    help_create_mail_data(recev_gid, recev_grid,const_value.MAIL_TYPE_REWARD,content,item);
};
exports.help_send_role_cd_reward_mail=help_send_role_cd_reward_mail;

//城池被占发送提醒邮件
var help_send_old_town_mail=function(recev_gid,recev_grid,town_name,tid,user_name)
{
    global.log("help_send_old_town_mail");

    if(recev_gid == undefined||recev_grid==undefined)
    {
        global.log("recev_gid == undefined||recev_grid==undefined");
        return;
    }

    var recev_gid=recev_gid;
    var recev_grid=recev_grid;
    var content="你的城池 "+town_name+" 被 "+user_name+" 夺走，快去抢回来吧！";
    var attachment=tid;
    help_create_mail_data(recev_gid, recev_grid,const_value.MAIL_TYPE_READ_FAIL, content,attachment);

    var log_content={};
    var logData=log_data_logic.help_create_log_data(recev_gid,0,recev_grid,0,0,"help_send_old_town_mail",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
};
exports.help_send_old_town_mail=help_send_old_town_mail;

//城池占领者发送提醒邮件
/**
 * town_name 城池名字
 * tid 城池ID
 * user_name 玩家名字
 * is_first 是否是第一个占领该城池的玩家
 * */
var help_send_new_town_mail=function(recev_gid,recev_grid,town_name,tid,user_name,is_first)
{
    global.log("help_send_new_town_mail");

    if(recev_gid == undefined||recev_grid==undefined)
    {
        global.log("recev_gid == undefined||recev_grid==undefined");
        return;
    }

    var recev_gid=recev_gid;
    var recev_grid=recev_grid;
    var content="";
    if(is_first)
    {
        content="你占领了城池"+town_name+",设置城守可以获得额外奖励哦！";
    }
    else
    {
        content="你击败了"+user_name+",占领了"+town_name+",设置城守可获得额外奖励";
    }

    var attachment=tid;
    help_create_mail_data(recev_gid, recev_grid,const_value.MAIL_TYPE_READ_SUCC,content,attachment);

    var log_content={};
    var logData=log_data_logic.help_create_log_data(recev_gid,0,recev_grid,0,0,"help_send_new_town_mail",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
};
exports.help_send_new_town_mail=help_send_new_town_mail;

//更新入库用户邮件
var update_mail_data_list=function()
{
    global.log("update_mail_data_list");

    if(mail_data.mail_update_db_list.length==0)
    {
        return;
    }
    else
    {
        for(var i in mail_data.mail_update_db_list)
        {

            var grid=mail_data.mail_update_db_list[i];
            var _mail_data=mail_data.mail_list[grid];
            if(_mail_data==undefined)
            {
                global.log("mail_data.mail_list:"+JSON.stringify(mail_data.mail_list));
                continue;
            }

            make_db.update_mail_data(_mail_data);
        }
    }

    mail_data.mail_update_db_list=[];
};
exports.update_mail_data_list=update_mail_data_list;

//定时清理邮件
var auto_clear_user_mail=function()
{
    global.log("auto_clear_user_mail");
    for(var grid_key in mail_data.mail_list)
    {
        var mail_arr=mail_data.mail_list[grid_key].mail_arr;
        if(mail_arr==undefined)
        {
            continue;
        }
        var is_del=false;//是否删除
        for(var i=0;i<mail_arr.length;i++)
        {
            //时间超过2天删除
            if(mail_arr[i].type!=const_value.MAIL_TYPE_REWARD&&(new Date().getTime())-Number(mail_arr[i].date)>(2*24*60*60*1000))
            {
                //删除已读邮件
                mail_arr.splice(i,1);
                i--;
                is_del=true;
            }
        }
        if(is_del)
        {
            make_db.update_mail_data(mail_data.mail_list[grid_key]);
        }
    }
};
exports.auto_clear_user_mail=auto_clear_user_mail;