var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var make_db = require("./make_db");

var ds = require("./data_struct");
var define_code=require("./define_code");
var formation=require("./formation_data");
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

//初始化创建阵型数据
var help_init_formation_data=function(role)
{
    global.log("help_init_formation_data");
    if(role==undefined)
    {
        global.log("role==undefined");
        return;
    }
    var role_formation_data=new formation.FormationData();
    role_formation_data.gid=role.gid;
    role_formation_data.grid=role.grid;
    role_formation_data.level=role.level;
    role_formation_data.name=role.name;


     global.log("role.card_bag:"+JSON.stringify(role.card_bag));

    for(var card_uid in role.card_bag)
    {
        global.log("card_uid:"+card_uid);
        var card_bag_data=role.card_bag[card_uid];

        var me_card_base=new formation.FormationCardBase();
        me_card_base.unique_id=card_uid;
        me_card_base.card_id=card_bag_data.card_id;
        me_card_base.level=card_bag_data.level;

        card_bag_data.used=1;//在阵型上
        role_formation_data.card_ls.push(me_card_base);
        if(role_formation_data.card_ls.length>=5)
        {
            break;
        }
    }

    for(var beauty_uid in role.beauty_bag)
    {
        global.log("beauty_uid:"+beauty_uid);
        role_formation_data.beauty_uid=beauty_uid;//在阵型上
        break;
    }

    formation.formation_list[role_formation_data.grid]=role_formation_data;
    //保存到数据库
    make_db.insert_formation_data(role_formation_data);
    //放入到排行榜队列
    var new_rank_data=new formation.HurtRankData();
    new_rank_data.grid=role.grid;
    formation.top_hurt_rank.push(new_rank_data);
};
exports.help_init_formation_data=help_init_formation_data;

//队伍编辑
var on_formation_edit=function(data,send,s)
{
    global.log("on_formation_edit");

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

    var arr=data.formation;
    if(arr==undefined)
    {
        global.log("arr==undefined");
        return;
    }

    if(arr.length<3||arr.length>9)
    {
        global.err("arr error, arr:"+JSON.stringify(arr));
        var msg = {
            "op" : msg_id.NM_FORMATION_EDIT,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
        return;
    }

    var role_formation_data=formation.formation_list[role.grid];
    if(role_formation_data==undefined)
    {
        global.log("role_formation_data == undefined");
        return;
    }

    for(var i=0;i<arr.length;i++)
    {
        var _card_data=role.card_bag[arr[i]];
        if(_card_data==undefined)
        {
            global.log("_card_data==undefined");
            return;
        }
        if(_card_data.guard)
        {
            var msg = {
                "op" : msg_id.NM_FORMATION_EDIT,
                "ret" : msg_code.CARD_ON_GUARD
            };
            send(msg);
            return;
        }
    }

    for(var i=0;i<role_formation_data.card_ls.length;i++)
    {
        //更新武将背包状态是下阵
        role.card_bag[role_formation_data.card_ls[i].unique_id].used=0;
    }

    //清空原阵型
    role_formation_data.card_ls=[];
    for(var i=0;i<arr.length;i++)
    {
        var _card_data=role.card_bag[arr[i]];
        //设置阵型状态
        _card_data.used=1;

        var formation_card=new formation.FormationCardBase();
        formation_card.unique_id =_card_data.unique_id;
        formation_card.card_id =_card_data.card_id;
        formation_card.level = _card_data.level;
        formation_card.b_level = _card_data.b_level;
        for(var j=0;j<_card_data.e_list.length;j++)
        {
            var _e_data=_card_data.e_list[j];
            if(_e_data)
            {
                var formation_equip=new formation.FormationEquipData();
                formation_equip.equip_id=_e_data.equip_id;
                formation_card.e_list.splice(j,1,formation_equip);
            }

        }
        role_formation_data.card_ls[i]=formation_card;
    }

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_FORMATION_EDIT,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_formation_edit",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
};
exports.on_formation_edit=on_formation_edit;


//获取用户信息
var on_formation_data=function(data,send,s)
{
    global.log("on_formation_data");
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


    var role_formation_data=formation.formation_list[role.grid];
    if(role_formation_data==undefined)
    {
        global.log("role_formation_data == undefined");
        return;
    }


    var card_ls=role_formation_data.card_ls;
    var client_formation=[];
    for(var i=0;i<card_ls.length;i++)
    {
        client_formation.push(card_ls[i].unique_id);
    }

    var msg = {
        "op" : msg_id.NM_FORMATION_DATA,
        "beauty_uid":role_formation_data.beauty_uid,
        "formation":client_formation,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_formation_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

};
exports.on_formation_data=on_formation_data;


//战前更换美女
var on_select_beauty=function(data,send,s)
{
    global.log("on_select_beauty");
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
        global.log("uid==undefined");
        return;
    }

    var _beauty_data=role.beauty_bag[uid];
    if(_beauty_data==undefined)
    {
        var msg = {
            "op" : msg_id.NM_SELECT_BEAUTY,
            "ret" : msg_code.BEAUTY_NOT_EXIST
        };
        send(msg);
        return;
    }

    var role_formation_data=formation.formation_list[role.grid];
    if(role_formation_data==undefined)
    {
        global.log("role_formation_data == undefined");
        return;
    }
    var old_beauty_data=role.beauty_bag[role_formation_data.beauty_uid];

    role_formation_data.beauty_uid=uid;
    old_beauty_data.used=0;
    _beauty_data.used=1;

    var msg = {
        "op" : msg_id.NM_SELECT_BEAUTY,
        "ret" : msg_code.SUCC
    };
    send(msg);

    user.nNeedSave=1;

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_select_beauty",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

};
exports.on_select_beauty=on_select_beauty;

//自动保存用户阵型数据
var sava_role_formation=function(role)
{
    global.log("sava_role_formation");

    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var formation_data=formation.formation_list[role.grid];
    if(formation_data==undefined)
    {
        global.log("formation_data == undefined");
        return;
    }

    //更新入库
    make_db.update_formation_data(formation_data);
};
exports.sava_role_formation=sava_role_formation;