/***
 *
 * 好友逻辑
 *
 */

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var friend_data=require("./friend_data");
var formation=require("./formation_data");
var robot_data=require("./robot_data");

var money_logic=require("./help_money_logic");
var role_data_logic=require("./help_role_data_logic");
var arena_logic=require("./help_arena_logic");

var ds = require("./data_struct");
var define_code=require("./define_code");
var make_db=require("./make_db");
var comm_fun=require("./common_func");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;


//申请添加好友
function on_add_friend(data,send,s)
{
    global.log("on_add_friend");

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

    var ask_id=data.uid;
    if(ask_id == undefined)
    {
        global.log("ask_id == undefined");
        return;
    }

    if(robot_data.robot_data_list[ask_id])
    {
        global.log("uid is robot");
        var msg = {
            "op" : msg_id.NM_ADD_FRIEND,
            "ret" : msg_code.SUCC
        };
        send(msg);
        return;
    }

    if(ask_id==role.grid)
    {
        var msg = {
            "op" : msg_id.NM_ADD_FRIEND,
            "ret" : msg_code.FRIEND_IS_SELF
        };
        send(msg);
        return;
    }

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data == undefined");
        return;
    }
    //查看是否已经是好友
    for(var i=0;i<me_friend_data.friends.length;i++)
    {
        if(me_friend_data.friends[i].grid==ask_id)
        {
            var msg = {
                "op" : msg_id.NM_ADD_FRIEND,
                "ret" : msg_code.SUCC
            };
            send(msg);

            /*
            var msg = {
                "op" : msg_id.NM_ADD_FRIEND,
                "ret" : msg_code.FRIEND_IS_EXIST
            };
            send(msg);

            */

            return;
        }
    }

    if(me_friend_data.friends.length>=const_value.FRIEND_INIT_LIMIT[role.vip])
    {
        var msg = {
            "op" : msg_id.NM_ADD_FRIEND,
            "ret" : msg_code.FRIEND_ME_LIMIT
        };
        send(msg);
        return;
    }

    var ask_formation_data=formation.formation_list[ask_id];
    var ask_friend_data=friend_data.friend_data_list[ask_id];
    if(ask_formation_data==undefined || ask_friend_data==undefined)
    {
        global.log("ask_formation_data==undefined || ask_friend_data==undefined");
        return;
    }

    //剔除重复申请
    for(var i=0;i<ask_friend_data.asks.length;i++)
    {
        if(ask_friend_data.asks[i]==role.grid)
        {
            ask_friend_data.asks.splice(i,1);
            i--;
        }
    }
    ask_friend_data.asks.push(role.grid);
    if(ask_friend_data.asks.length>=const_value.FRIEND_INIT_LIMIT[ask_formation_data.vip])
    {
        //删除最早的一个
        ask_friend_data.asks.shift();
    }

    friend_data.friend_update_db_list.push(ask_id);

    var msg = {
        "op" : msg_id.NM_ADD_FRIEND,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var ask_user=ds.user_list[ask_friend_data.gid];

    if(ask_user && ask_user.online && ask_user.send)
    {
        global.log("ask_user is online!");
        var ask_role=ds.get_cur_role(ask_user);
        role_data_logic.help_notice_role_msg(ask_role,ask_user.send);
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_add_friend",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_add_friend = on_add_friend;

//删除好友
function on_delete_friend(data,send,s)
{
    global.log("on_delete_friend");

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

    var friend_id=data.uid;
    if(friend_id == undefined)
    {
        global.log("friend_id == undefined");
        return;
    }

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data==undefined");
        return;
    }

    for(var i=0;i<me_friend_data.friends.length;i++)
    {
        if(me_friend_data.friends[i].grid==friend_id)
        {
            me_friend_data.friends.splice(i,1);
            break;
        }
    }

    var other_friend_data=friend_data.friend_data_list[friend_id];
    if(other_friend_data==undefined)
    {
        global.log("other_friend_data==undefined");
        return;
    }
    for(var j=0;j<other_friend_data.friends.length;j++)
    {
        if(other_friend_data.friends[j].grid==role.grid)
        {
            other_friend_data.friends.splice(j,1);
            break;
        }
    }
    friend_data.friend_update_db_list.push(friend_id);
    friend_data.friend_update_db_list.push(role.grid);



    var msg = {
        "op" : msg_id.NM_DELETE_FRIEND,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"friend_id":friend_id};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_delete_friend",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_delete_friend = on_delete_friend;

//查看好友列表
function on_friend_data_list(data,send,s)
{
    global.log("on_friend_data_list");

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

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data == undefined");
        return;
    }

    var friend_arr=[];
    for(var i=0;i<me_friend_data.friends.length;i++)
    {
        friend_arr.push(help_organize_client_friend_data(me_friend_data.friends[i].grid));
    }

    var msg = {
        "op" : msg_id.NM_FRIEND_DATA_LIST,
        "limit":const_value.FRIEND_INIT_LIMIT[role.vip],
        "friends":friend_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);
    var log_content={"friend_arr":friend_arr};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_friend_data_list",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_friend_data_list = on_friend_data_list;

//查看申请列表
function on_friend_request_list(data,send,s)
{
    global.log("on_friend_request_list");

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

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data==undefined");
        return;
    }

    var ask_arr=[];
    for(var i=0;i<me_friend_data.asks.length;i++)
    {
        ask_arr.push(help_organize_client_friend_data(me_friend_data.asks[i]));
    }

    var msg = {
        "op" : msg_id.NM_FRIEND_REQUEST_LIST,
        "limit":const_value.FRIEND_INIT_LIMIT[role.vip],
        "requests" : ask_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_friend_request_list",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_friend_request_list = on_friend_request_list;

//清空申请列表
function on_clear_request_list(data,send,s)
{
    global.log("on_clear_request_list");

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

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data==undefined");
        return;
    }
    me_friend_data.asks=[];
    friend_data.friend_update_db_list.push(role.grid);


    var msg = {
        "op" : msg_id.NM_CLEAR_FRIEND_LIST,
        "ret" : msg_code.SUCC
    };
    send(msg);

    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_clear_request_list",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_clear_request_list = on_clear_request_list;

//同意好友请求
function on_agree_request(data,send,s)
{
    global.log("on_agree_request");

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

    var ask_id=data.uid;
    if(ask_id == undefined)
    {
        global.log("ask_id == undefined");
        return;
    }

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data==undefined");
        return;
    }

    //判断是否好友数量超过上限
    if(me_friend_data.friends.length>=const_value.FRIEND_INIT_LIMIT[role.vip])
    {
        var msg = {
            "op" : msg_id.NM_AGREE_REQUEST,
            "ret" : msg_code.FRIEND_ME_LIMIT
        };
        send(msg);
        return;
    }

    var other_formation_data=formation.formation_list[ask_id];
    var other_friend_data=friend_data.friend_data_list[ask_id];
    if(other_formation_data==undefined || other_friend_data==undefined)
    {
        global.log("other_formation_data==undefined || other_friend_data==undefined");
        return;
    }
    if(other_friend_data.friends.length>=const_value.FRIEND_INIT_LIMIT[other_formation_data.vip])
    {
        var msg = {
            "op" : msg_id.NM_AGREE_REQUEST,
            "ret" : msg_code.FRIEND_OTHER_LIMIT
        };
        send(msg);
        return;
    }

    for(var i=0;i<me_friend_data.friends.length;i++)
    {
        if(me_friend_data.friends[i].grid==ask_id)
        {
            var msg = {
                "op" : msg_id.NM_AGREE_REQUEST,
                "ret" : msg_code.FRIEND_IS_EXIST
            };
            send(msg);
            return;
        }
    }

    var is_exist=0;
    for(var i=0;i<me_friend_data.asks.length;i++)
    {
        if(me_friend_data.asks[i]==ask_id)
        {
            is_exist=1;
            me_friend_data.asks.splice(i,1);
        }
    }

    if(is_exist)
    {
        //自己添加好友
        var add_friend_data=new friend_data.FriendBaseData();
        add_friend_data.grid=ask_id;
        me_friend_data.friends.push(add_friend_data);

        //对方添加好友
        var other_add_friend_data=new friend_data.FriendBaseData();
        other_add_friend_data.grid=role.grid;
        other_friend_data.friends.push(other_add_friend_data);
        for(var i=0;i<other_friend_data.asks.length;i++)
        {
            if(other_friend_data.asks[i]==role.grid)
            {
                is_exist=1;
                other_friend_data.asks.splice(i,1);
            }
        }

    }
    else
    {
        var msg = {
            "op" : msg_id.NM_AGREE_REQUEST,
            "ret" : msg_code.FRIEND_NOT_EXIST
        };
        send(msg);
    }
    friend_data.friend_update_db_list.push(ask_id);
    friend_data.friend_update_db_list.push(role.grid);

    var msg = {
        "op" : msg_id.NM_AGREE_REQUEST,
        "ret" : msg_code.SUCC
    };
    send(msg);

    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_agree_request",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_agree_request = on_agree_request;

//拒绝好友请求
function on_refuse_request(data,send,s)
{
    global.log("on_refuse_request");

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

    var ask_id=data.uid;
    if(ask_id== undefined)
    {
        global.log("ask_id == undefined");
        return;
    }

    var me_friend_data=friend_data.friend_data_list[role.grid];
    if(me_friend_data==undefined)
    {
        global.log("me_friend_data==undefined");
        return;
    }
    for(var i=0;i<me_friend_data.asks.length;i++)
    {
        if(me_friend_data.asks[i]==ask_id)
        {
            me_friend_data.asks.splice(i,1);
        }
    }

    friend_data.friend_update_db_list.push(role.grid);
    var msg = {
        "op" : msg_id.NM_REFUSE_REQUEST,
        "ret" : msg_code.SUCC
    };
    send(msg);

    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_refuse_request",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_refuse_request = on_refuse_request;

//邀请战斗好友
function on_fight_friend_data(data,send,s)
{
    global.log("on_fight_friend_data");
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

    var now_time=new Date().getTime();

    //战斗缓存列表
    var fight_list_data=friend_data.fight_friend_data_list[role.grid];

    //大于6小时或者数量小于三个刷新一次
    if(fight_list_data==undefined||
        fight_list_data.date-now_time>21600000||
        fight_list_data.friends.length+fight_list_data.strangers.length<=3)
    {
        if(fight_list_data)
        {
            delete friend_data.fight_friend_data_list[role.grid];
        }

        fight_list_data=new friend_data.FightFriendData();
        fight_list_data.grid=role.grid;
        fight_list_data.date=now_time;
        friend_data.fight_friend_data_list[role.grid]=fight_list_data;


        var _friend_data=friend_data.friend_data_list[role.grid];
        if(_friend_data==undefined)
        {
            global.log("_friend_data==undefined");
            return;
        }

        //好友助战
        var temp_friend_arr=[];
        for(var i=0;i<_friend_data.friends.length;i++)
        {
            if(!comm_fun.help_judge_today(_friend_data.friends[i].f_time))
            {
                //重置次数
                _friend_data.friends[i].times=0;
                _friend_data.friends[i].f_time=now_time;
            }

            if(_friend_data.friends[i].times<const_value.FRIEND_USE_TIMES)
            {
                temp_friend_arr.push(_friend_data.friends[i].grid);
            }
        }

        if(temp_friend_arr.length>const_value.FIGHT_FRIEND_NUM)
        {
            var random_arr =comm_fun.help_make_random(const_value.FIGHT_FRIEND_NUM,0,temp_friend_arr.length-1);
            for(var i=0;i<random_arr.length;i++)
            {
                fight_list_data.friends.push(help_organize_client_friend_data(temp_friend_arr[random_arr[i]]));
            }
        }
        else
        {
            for(var i=0;i<temp_friend_arr.length;i++)
            {
                fight_list_data.friends.push(help_organize_client_friend_data(temp_friend_arr[i]));
            }
        }

        //陌生人助战
        if(fight_list_data.friends.length<const_value.FIGHT_FRIEND_NUM)
        {
            var diff_num=const_value.FIGHT_FRIEND_NUM-fight_list_data.friends.length;
            var temp_arr=[];

            var num=0;
            for(var key in formation.formation_list)
            {
                var temp_formation_data=formation.formation_list[key];
                if(temp_formation_data.level>=(role.level-20)&&temp_formation_data.level<=(role.level+5)&&temp_formation_data.grid !=role.grid)
                {
                    var temp_grid=temp_formation_data.grid;
                    var is_friend=0;
                    for(var i=0;i<_friend_data.friends.length;i++)
                    {
                        //非好友
                        if(_friend_data.friends[i].grid==temp_grid)
                        {
                            is_friend=1;
                            break;
                        }
                    }
                    //除去好友
                    if(!is_friend)
                    {
                        temp_arr.push(temp_grid);
                        num++;
                        if(num>=2*diff_num)
                        {
                            break;
                        }
                    }
                }
            }


            var random_arr =comm_fun.help_make_random(diff_num,0,temp_arr.length-1);

            for(var i=0;i<random_arr.length;i++)
            {
                fight_list_data.strangers.push(help_organize_client_friend_data(temp_arr[random_arr[i]]));
            }
        }

        //机器人
        if(fight_list_data.friends.length==0&&fight_list_data.strangers.length==0)
        {
            fight_list_data.strangers.push(help_create_robot("1"));
        }
    }

    var msg=
    {
        "op":msg_id.NM_FIGHT_FRIEND_DATA,
        "friends":fight_list_data.friends,
        "users":fight_list_data.strangers,
        "ret": msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_fight_friend_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_fight_friend_data = on_fight_friend_data;

//选择战斗好友
function on_select_fight_friend(data,send,s)
{
    global.log("on_select_fight_friend");
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
    //去掉isFriend字段
    var f_uid=data.uid;
    if(f_uid == undefined)
    {
        global.log("f_uid == undefined");
        return;
    }

    var isFriend=0;
    var me_friend_data=friend_data.friend_data_list[role.grid];

    for(var i=0;i<me_friend_data.friends.length;i++)
    {
        if(me_friend_data.friends[i].grid==f_uid)
        {
            me_friend_data.friends[i].times++;
            isFriend=1;
            break;
        }
    }

    var fight_friend_list=friend_data.fight_friend_data_list[role.grid];
    var delete_arr=fight_friend_list.strangers;
    if(isFriend)
    {
        delete_arr=fight_friend_list.friends;
    }
    for(var i=0;i<delete_arr.length;i++)
    {
        if(delete_arr[i].uid==f_uid)
        {
            delete_arr.splice(i,1);
            break;
        }
    }


    //保存战斗数据
    var fight_user_data=new formation.FightUserData();
    fight_user_data.gid=role.gid;
    fight_user_data.grid=role.grid;
    fight_user_data.is_friend=isFriend;
    fight_user_data.friend_uid=f_uid;
    formation.fight_user_data_list[role.grid]=fight_user_data;

    var msg=
    {
        "op":msg_id.NM_SELECT_FIGHT_FRIEND,
        "ret": msg_code.SUCC
    };
    send(msg);
    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_select_fight_friend",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_select_fight_friend = on_select_fight_friend;

//好友搜索
function on_search_friend(data,send,s)
{
    global.log("on_search_friend");
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

    var name=data.name;
    if(comm_fun.isEmpty(name))
    {
        global.log("name==undefined");
        return;
    }

    var friend_uid=0;
    for(var key in formation.formation_list)
    {
        if(formation.formation_list[key].name==name)
        {
            friend_uid=formation.formation_list[key].grid;
            break;
        }
    }

    if(!friend_uid)
    {
        var msg = {
            "op":msg_id.NM_SEARCH_FRIEND,
            "ret": msg_code.FRIEND_NOT_EXIST
        };
        send(msg);
    }

    var user_info=help_organize_client_friend_data(friend_uid);
    if(user_info)
    {
        var msg = {
            "op":msg_id.NM_SEARCH_FRIEND,
            "uid":user_info.uid,
            "name": user_info.name,
            "level": user_info.level,
            "warriors":user_info.warriors,
            "ret": msg_code.SUCC
        };
        send(msg);
    }
    else
    {
        var msg = {
            "op":msg_id.NM_SEARCH_FRIEND,
            "ret": msg_code.FRIEND_NOT_EXIST
        };
        send(msg);
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_search_friend",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_search_friend = on_search_friend;

//好友详情
function on_friend_detail(data,send,s)
{
    global.log("on_friend_detail");
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

    var id=data.uid;
    if(id == undefined)
    {
        global.log("id==undefined");
        return;
    }

    var _formation_data=formation.formation_list[id];
    if(_formation_data==undefined)
    {
        var msg = {
            "op":msg_id.NM_FRIEND_DETAIL,
            "ret": msg_code.FRIEND_NOT_EXIST
        };
        send(msg);
        return;
    }

    var leader_data=new Object();
    var warriors=[];
    for(var i=0;i<_formation_data.card_ls.length;i++)
    {
        var _card_data=_formation_data.card_ls[i];
        if(i==0)
        {
            leader_data.xid=_card_data.card_id;
            leader_data.uid=_card_data.unique_id;
            leader_data.level=_card_data.level;
            leader_data.reborn_level=_card_data.b_level;
            leader_data.equipments =[];

            for(var j=0;j<_card_data.e_list.length;j++)
            {
                var e_obj={};
                e_obj.xid=_card_data.e_list[j].equip_id;
                leader_data.equipments.push(e_obj);
            }

        }
        else
        {
            warriors.push(_card_data.card_id);
        }
    }

    var rank=arena_logic.help_get_hurt_rank(id,_formation_data.top_hurt);

    var msg = {
        "op":msg_id.NM_FRIEND_DETAIL,
        "uid" : _formation_data.grid,
        "hurt":_formation_data.top_hurt,
        "town_num":_formation_data.town_num,
        "rank":rank,
        "name" : _formation_data.name,
        "level" : _formation_data.level,
        "leader":leader_data,
        "warriors":warriors,
        "ret": msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_friend_detail",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_friend_detail = on_friend_detail;

//获得用户信息
function on_get_user_info(data,send,s)
{
    global.log("on_get_user_info");

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

    var uid=data.uid;
    if(uid==undefined)
    {
        global.log("uid == undefined");
        return;
    }

    var _friend_data=friend_data.friend_data_list[role.grid];
    if(_friend_data==undefined)
    {
        global.log("_friend_data==undefined");
        return;
    }

    var friend=0;
    for(var i=0;i<_friend_data.friends.length;i++)
    {
        if(_friend_data.friends[i].grid==uid)
        {
            friend=1;
            break;
        }
    }


    var user_info=help_organize_client_friend_data(uid);

    if(user_info)
    {
        var msg = {
            "op" : msg_id.NM_GET_USER_INFO,
            "uid":user_info.uid,
            "name":user_info.name,
            "level":user_info.level,
            "score":user_info.score,
            "friend":friend,
            "warriors":user_info.warriors,
            "ret" : msg_code.SUCC
        };
        send(msg);
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_GET_USER_INFO,
            "ret" : msg_code.USER_NOT_FIND
        };
        send(msg);
    }
    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_user_info",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_get_user_info = on_get_user_info;


//更新入库用户好友数据
var update_friend_data_list=function()
{
    global.log("update_friend_data_list");

    if(friend_data.friend_update_db_list.length==0)
    {
        return;
    }
    else
    {
        for(var i in friend_data.friend_update_db_list)
        {

            var grid=friend_data.friend_update_db_list[i];
            var _friend_data=friend_data.friend_data_list[grid];

            if(_friend_data==undefined)
            {
                continue;
            }

            make_db.update_friend_data(_friend_data);
        }
    }

    friend_data.friend_update_db_list=[];
};
exports.update_friend_data_list=update_friend_data_list;

//返回好友信息
var help_organize_client_friend_data=function(role_id)
{
    if(role_id==undefined)
    {
        global.log("role_id==undefined");
        return;
    }

    var _formation_data=formation.formation_list[role_id];
    if(_formation_data==undefined)
    {
        global.log("_formation_data == undefined,role_id:"+role_id);
        return;
    }

    var _friend_data=new Object();
    _friend_data.uid=_formation_data.grid;
    _friend_data.name=_formation_data.name;
    _friend_data.level=_formation_data.level;
    _friend_data.warriors=[];


    var warrior=new Object();
    var leader_data=_formation_data.card_ls[0];
    warrior.xid=leader_data.card_id;
    warrior.uid=leader_data.unique_id;
    warrior.level=leader_data.level;
    warrior.reborn_level=leader_data.b_level;
    warrior.equipments =[];

    for(var j=0;j<leader_data.e_list.length;j++)
    {
        var e_obj={};
        e_obj.xid=leader_data.e_list[j].equip_id;
        warrior.equipments.push(e_obj);
    }
    _friend_data.warriors.push(warrior);
    return _friend_data;
};


//生成机器人
function help_create_robot(robot_id)
{
    if(robot_id==undefined)
    {
        global.log("robot_id==undefined");
        return;
    }

    var _robot_data=robot_data.robot_data_list[robot_id];
    if(_robot_data==undefined)
    {
        global.log("_robot_data==undefined");
        return;
    }

    var _friend_data=new Object();
    _friend_data.uid=_robot_data.id;
    _friend_data.name=_robot_data.name;
    _friend_data.level=_robot_data.level;
    _friend_data.warriors=[];

    for(var i=0;i<3;i++)
    {
        var warrior={};
        if(i==0)
        {
            warrior.xid=_robot_data.card_one;
        }
        else if(i==1)
        {
            warrior.xid=_robot_data.card_two;
        }
        else
        {
            warrior.xid=_robot_data.card_three;
        }
        warrior.uid=1;
        warrior.level=1;
        warrior.reborn_level=0;
        warrior.equipments=[];
        _friend_data.warriors.push(warrior);
    }
    return _friend_data;

}


//初始化创建好友数据
var help_init_friend_data=function(role)
{
    global.log("help_init_friend_data");
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }
    var _friend_data=new friend_data.FriendData();
    _friend_data.gid=role.gid;
    _friend_data.grid=role.grid;
    friend_data.friend_data_list[role.grid]=_friend_data;

    //保存到数据库
    make_db.insert_friend_data(_friend_data);
};
exports.help_init_friend_data=help_init_friend_data;

//定时清理战斗好友缓存
var auto_clear_fight_list=function()
{
    global.log("auto_clear_fight_list");
    for(var grid_key in friend_data.fight_friend_data_list)
    {
        var fight_friend_list=friend_data.fight_friend_data_list[grid_key];
        if(fight_friend_list==undefined)
        {
            continue;
        }

        var now_time=new Date().getTime();
        if(fight_friend_list.date-now_time>21600000)
        {
            delete friend_data.fight_friend_data_list[grid_key];
        }
    }
};
exports.auto_clear_fight_list=auto_clear_fight_list;








