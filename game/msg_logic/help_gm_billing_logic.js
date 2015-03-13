var fs=require("fs");

var server_config_data = require("./server_config_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var make_db = require("./make_db");
var mail_logic=require("./help_mail_logic");
var common_func=require("./common_func");

var const_value=define_code.const_value;
var server_list = server_config_data.server_config_data_list;

var g_server=null;

function init(s)
{
    g_server = s;
}
exports.init=init;

//更改活动
function on_change_activity(data,send,s)
{
    global.log("on_change_activity");

    var actid=data.actid;
    var beginTime=data.beginTime;
    var endTime=data.endTime;
    var type=data.type;

    var path="./dynamic.ini";
    var str=fs.readFileSync(path,'utf8');
    var dynamic_txt;
    if(str)
    {
        var sub_data=str.toString();
        dynamic_txt=JSON.parse(sub_data);
        global.log("dynamic_txt:"+JSON.stringify(dynamic_txt));
    }

    switch(Number(type))
    {
        case 1:
            //添加
            global.log("添加");
            if(actid&& beginTime&& endTime)
            {
                var _activity={};
                _activity.begin_time=beginTime;
                _activity.end_time=endTime;
                _activity.is_public=1;
                dynamic_txt.activity[actid]=_activity;
            }
            break;
        case 2:
            //编辑
            global.log("编辑");
            if(actid&& beginTime&& endTime &&dynamic_txt.activity[actid])
            {
                dynamic_txt.activity[actid].begin_time=beginTime;
                dynamic_txt.activity[actid].end_time=endTime;
            }
            break;
        case 3:
            //删除
            global.log("删除");
            if(actid &&dynamic_txt.activity[actid])
            {
                delete  dynamic_txt.activity[actid];
            }
            break;
    }
    fs.writeFile(path,JSON.stringify(dynamic_txt) , function (err) {
        if (err) throw err;
    });
}
exports.on_change_activity =on_change_activity;


//更改公告
function on_change_notice(data,send,s)
{
    global.log("on_change_notice");

    var id=data.id;
    var buttonID=data.buttonID;
    var buttonText=data.buttonText;
    var title=data.title;
    var text=data.text;
    var type=data.type;

    var path="./dynamic.ini";
    var str=fs.readFileSync(path,'utf8');
    var dynamic_txt;
    if(str)
    {
        var sub_data=str.toString();
        dynamic_txt=JSON.parse(sub_data);
        global.log("dynamic_txt:"+JSON.stringify(dynamic_txt));
    }

    switch(Number(type))
    {
        case 1:
            //添加
            global.log("添加");

            if(id&&buttonID&&buttonText&&title&&text)
            {
                var notice={};
                notice.buttonID=buttonID;
                notice.buttonText=buttonText;
                notice.title=title;
                notice.text=text;
                dynamic_txt.notice[id]=notice;
            }
            break;
        case 2:
            //编辑
            global.log("编辑");
            if(id&&buttonID&&buttonText&&title&&text&&dynamic_txt.notice[id])
            {
                dynamic_txt.notice[id].buttonID=buttonID;
                dynamic_txt.notice[id].buttonText=buttonText;
                dynamic_txt.notice[id].title=title;
                dynamic_txt.notice[id].text=text;
            }
            break;
        case 3:
            //删除
            global.log("删除");
            if(id&&dynamic_txt.notice[id])
            {
                delete  dynamic_txt.notice[id];
            }
            break;
    }
    fs.writeFile(path,JSON.stringify(dynamic_txt) , function (err) {
        if (err) throw err;
    });
}
exports.on_change_notice =on_change_notice;

//获取用户数据on_gm_role_data
function on_gm_role_data(data,send,s)
{
    global.log("on_gm_role_data");
    var gm_data={};
    gm_data.name=data.name;
    if(gm_data.name==undefined)
    {
        global.log("gm_data.name==undefined");
        return;
    }

    var gs = server_list[0];
    if(gs != undefined)
    {
        gm_data.server_id=gs.server_id;
    }
    g_server.db.find(make_db.t_role,{"data.name" : gm_data.name},function(arr){
        if(arr.length == 0)
        {
            gm_data.data=[];
            var msg = {
                "op" : 102,
                "gm_data":gm_data
            };
            send(msg);
        }
        else
        {
            gm_data.data=arr;
            var msg = {
                "op" : 102,
                "gm_data":gm_data
            };
            send(msg);
        }
    });
}
exports.on_gm_role_data =on_gm_role_data;


//编辑用户数据on_gm_edit_role_data
function on_gm_edit_role_data(data,send,s)
{
    global.log("on_gm_edit_role_data");
    var name=data.name;
    var attribute=data.attribute;
    var type=data.type;

    if(name==undefined || attribute==undefined || type==undefined)
    {
        global.log("name==undefined || attribute==undefined || type==undefined");
        return ;
    }

    var user=help_get_role_by_name(name);
    if(user)
    {
        //在线用户
        var role=ds.get_cur_role(user);
        if(role==undefined)
        {
            global.log("role==undefined");
            return;
        }
        switch(type)
        {
            case 1:
                //修改用户游戏币
                role.rmb+=Number(attribute);
                user.nNeedSave=1;
                break;
            case 2:
                //修改用户金币
                role.gold+=Number(attribute);
                user.nNeedSave=1;
                break;
            case 3:
                //修改用户体力
                role.stamina+=Number(attribute);
                user.nNeedSave=1;
                break;
            case 4:
                //修改用户积分
                role.score+=Number(attribute);
                user.nNeedSave=1;
                break;
            default :
                global.log("type is error ,type:"+type);
                break;
        }
    }
    else
    {
        //离线用户
        switch(type)
        {
            case 1:
                //修改用户游戏币
                if(Number(attribute))
                {
                    g_server.db.update(make_db.t_role,{"data.name":name},{"$inc":{"data.rmb":Number(attribute)}});
                }
                break;
            case 2:
                //修改用户金币
                if(Number(attribute))
                {
                    g_server.db.update(make_db.t_role,{"data.name":name},{"$inc":{"data.gold":Number(attribute)}});
                }
                break;
            case 3:
                //修改用户体力
                if(Number(attribute))
                {
                    g_server.db.update(make_db.t_role,{"data.name":name},{"$inc":{"data.stamina":Number(attribute)}});
                }
                break;
            case 4:
                //修改用户积分
                if(Number(attribute))
                {
                    g_server.db.update(make_db.t_role,{"data.name":name},{"$inc":{"data.score":Number(attribute)}});
                }
                break;
            default :
                global.log("type is error ,type:"+type);
                break;
        }
    }

}
exports.on_gm_edit_role_data =on_gm_edit_role_data;


//发送用户邮件on_gm_send_role_mail
function on_gm_send_role_mail(data,send,s)
{
    global.log("on_gm_send_role_mail");
    var content=data.content;
    var item=data.item;
    var nameArr=data.nameArr;
    var type=data.type;

    if(content==undefined || item==undefined || type==undefined || nameArr==undefined)
    {
        global.log("content==undefined || item==undefined || type==undefined || nameArr==undefined");
        return ;
    }

    switch (type)
    {
        //单服多个用户发送邮件（含单个用户）
        case 1:
            for(var i=0;i<nameArr.length;i++)
            {
                g_server.db.find(make_db.t_role,{"data.name":nameArr[i]},{"gid":1,"grid":1},function(arr){
                    if(arr.length>0)
                    {
                        for(var j=0;j<arr.length;j++)
                        {
                            var recev_gid=arr[j].gid;
                            var recev_grid=arr[j].grid;
                            mail_logic.help_create_mail_data(recev_gid,recev_grid,const_value.MAIL_TYPE_REWARD,content,common_func.cloneObject(item));
                        }
                    }
                    else
                    {
                        global.err("role in not exist!");
                    }
                });
            }
            break;
        //单服所有用户发送邮件
        case 2:
            g_server.db.find(make_db.t_role,{},{"gid":1,"grid":1},function(arr){
                for(var i=0;i<arr.length;i++)
                {
                    var recev_gid=arr[i].gid;
                    var recev_grid=arr[i].grid;
                    //var title=title;在回调函数中声明同样名称的变量，会覆盖外层环境的同名变量

                    mail_logic.help_create_mail_data(recev_gid, recev_grid,const_value.MAIL_TYPE_REWARD,content,common_func.cloneObject(item));
                }
            });
            break;
    }

}
exports.on_gm_send_role_mail =on_gm_send_role_mail;

var help_get_role_by_name=function(name)
{
    global.log("help_get_role_by_name");
    var user;

    for(var key in ds.user_account_list)
    {
        var user=ds.user_account_list[key];
        if(user && user.online == 1)
        {
            var _role = ds.get_cur_role(user);
            if(_role != undefined && _role.name==name)
            {
                user= user;
                break;
            }
        }
    }

    return user;

};



