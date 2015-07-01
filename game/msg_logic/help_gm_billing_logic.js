var fs=require("fs");

var server_config_data = require("./server_config_data");
var ds = require("./data_struct");
var define_code=require("./define_code");
var make_db = require("./make_db");
var mail_logic=require("./help_mail_logic");
var common_func=require("./common_func");

var const_value=define_code.const_value;
var server_list = server_config_data.server_config_data_list;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server=null,notice_data;

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


//发送用户公告
function on_user_notice(data,send,s)
{
    global.log("on_user_notice");

    var type=data.type;
    var content=data.content;

    if(type==undefined || content==undefined)
    {
        global.log("type==undefined || content==undefined");
        return;
    }

    var msg = {
        "op" : msg_id.NM_USER_NOTICE,
        "msg" : content,
        "force" : type,
        "ret" : msg_code.SUCC
    };

    notice_data=msg;

    help_send_user_notice();



}
exports.on_user_notice =on_user_notice;

function help_send_user_notice()
{
    if(notice_data)
    {
        for(var key in ds.user_account_list)
        {
            var user =  ds.user_account_list[key];

            if(user && user.online && user.send)
            {
                user.send(notice_data);
            }
        }
    }
}
exports.help_send_user_notice =help_send_user_notice;

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
    var attr=data.attr;

    if(name==undefined || attr==undefined)
    {
        global.log("name==undefined || attr==undefined");
        return ;
    }

    var user=help_get_user_by_name(name);
    if(user && user.online)
    {
        global.log("user is online");
        //在线用户
        var role=ds.get_cur_role(user);
        if(role==undefined)
        {
            global.log("role==undefined");
            return;
        }

        if(!common_func.isEmpty(attr.rmb))
        {
            //修改用户人民币
            role.rmb=Number(attr.rmb);
        }
        if(!common_func.isEmpty(attr.gold))
        {
            //修改用户金币
            role.gold=Number(attr.gold);
        }


        user.nNeedSave=1;

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_USER_DATA,
            "rmb":role.rmb,
            "gold":role.gold,
            "ret" :msg_code.SUCC
        };
        user.send(g_msg);
        global.log(JSON.stringify(g_msg));

    }
    else
    {

        global.log("user is offline");
        var setObj={};

        //离线用户
        if(!common_func.isEmpty(attr.rmb))
        {
            //修改用户人民币
            setObj["data.rmb"]=Number(attr.rmb);

        }
        if(!common_func.isEmpty(attr.gold))
        {
            //修改用户金币
            setObj["data.gold"]=Number(attr.gold);
        }


        g_server.db.update(make_db.t_role,{"data.name":name},{"$set":setObj});

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

var help_get_user_by_name=function(name)
{
    global.log("help_get_user_by_name");
    var _user;

    for(var key in ds.user_account_list)
    {
        var user=ds.user_account_list[key];
        if(user && user.online == 1)
        {
            var _role = ds.get_cur_role(user);
            if(_role != undefined && _role.name==name)
            {
                _user= user;
                break;
            }
        }
    }

    return _user;

};



