/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-30
 * Time: 下午4:13
 * To change this template use File | Settings | File Templates.
 */

var make_db = require("./make_db");
var ds = require("./data_struct");
var define_code = require("./define_code");
var card_data = require("./card_data");
var item_data = require("./item_data");
var formation_data = require("./formation_data");
var card_exp_data = require("./card_exp_data");
var card_frag_data=require("./card_frag_data");
var town_data = require("./town_data");
var log_data=require("./log_data");

var log_data_logic=require("./help_log_data_logic");
var money_logic=require("./help_money_logic");
var common_func = require("./common_func");
var role_data_logic=require("./help_role_data_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;



var g_server = null;
exports.init = function(s)
{
    g_server = s;
};

//给角色创建一张卡牌，放入背包
function help_create_role_card(role,card_id)
{
    global.log("help_create_role_card");
    if(role == undefined || card_id == undefined)
    {
        global.log("role == undefined || card_id == undefined");
        return;
    }


    var card_json_data = card_data.card_data_list[card_id];
    if(card_json_data == undefined)
    {
        global.log("card_json_data == undefined");
        return;
    }

    if(card_json_data.star==5)
    {
        role.achievement[const_value.ACHI_TYPE_CARD_STAR].times++;
    }

    var _card = new ds.Role_Card_Data();

    _card.unique_id = make_db.get_global_unique_id();

    _card.card_id = card_json_data.card_id;
    _card.level = card_json_data.level;
    _card.gain_time = (new Date()).getTime();

    //放入用户卡牌背包
    role.card_bag[_card.unique_id] = _card;

    var log_content={"card" : _card};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_create_role_card",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

    return _card.unique_id;
}
exports.help_create_role_card = help_create_role_card;

//给角色创建一个卡牌碎片，放入背包
function help_create_card_piece(role,card_id,num)
{
    global.log("help_create_card_piece");
    if(role == undefined || card_id == undefined || num==undefined)
    {
        global.log("role == undefined || card_id == undefined || num==undefined");
        return;
    }

    var num=Number(num);

    var card_json_data = card_data.card_data_list[card_id];
    if(card_json_data == undefined)
    {
        global.log("card_json_data == undefined");
        return;
    }

    var _card = role.card_piece[card_id];
    if(_card==undefined)
    {
        _card = new ds.Role_Card_Piece_Data();
        _card.card_id=card_id;

        role.card_piece[card_id]=_card;
    }
    _card.num += num;

    var log_content={"card" : _card};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_create_card_piece",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.help_create_card_piece = help_create_card_piece;

//获取卡牌背包信息
function on_card_bag_data(data,send,s)
{
    global.log("on_card_bag_data");

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

    var role_card_bag=role.card_bag;
    var role_card_piece=role.card_piece;
    if(role_card_bag==undefined || role_card_piece==undefined)
    {
        global.log("role_card_bag==undefined || role_card_piece==undefined");
        return;
    }

    var _formation_data=formation_data.formation_list[role.grid];
    if(_formation_data==undefined)
    {
        global.log("_formation_data == undefined");
        return;
    }

    //武将数据
    var warriors=[];
    for(var key in role_card_bag)
    {
        var card_bag_data=role_card_bag[key];
        if(card_bag_data)
        {
            var obj=new Object();
            obj.uid=card_bag_data.unique_id;
            obj.xid=card_bag_data.card_id;
            obj.exp=card_bag_data.exp;
            obj.level=card_bag_data.level;
            obj.reborn_level=card_bag_data.b_level;
            obj.equipments =[];
            for(var i=0;i<card_bag_data.e_list.length;i++)
            {
                var e_obj={};
                if(card_bag_data.e_list[i])
                {
                    e_obj.xid=card_bag_data.e_list[i].equip_id;
                }
                obj.equipments.push(e_obj);
            }

            if(card_bag_data.guard)
            {
                obj.status=const_value.CARD_STATUS_GUARD;
            }
            else
            {       //状态判断
                obj.status=const_value.CARD_STATUS_OFF;
                if(card_bag_data.used)
                {
                    obj.status=const_value.CARD_STATUS_ON;
                }
                var card_ls=_formation_data.card_ls;
                for(var j=0;j<3;j++)
                {
                    if(card_ls[j]&&card_ls[j].unique_id==obj.uid)
                    {
                        switch (j)
                        {
                            case 0:
                                obj.status=const_value.CARD_STATUS_LEADER;
                                break;
                            case 1:
                            case 2:
                                obj.status=const_value.CARD_STATUS_VAN;
                                break;
                            default :
                                break;
                        }
                    }
                }
            }
       }
       else
       {
           obj.status=const_value.CARD_STATUS_OFF;
       }
       warriors.push(obj);

    }
    //武将碎片数据
    var pieces=[];
    for(var key in role_card_piece)
    {
        var card_piece_data=role_card_piece[key];
        if(card_piece_data)
        {
            var obj=new Object();
            obj.card_id=card_piece_data.card_id;
            obj.num=card_piece_data.num;
            pieces.push(obj);
        }
    }

    var msg = {
        "op" : msg_id.NM_CARD_BGA_DATA,
        "limit":role.cbag_limit,
        "warriors" : warriors,
        "pieces" : pieces,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"warriors":warriors};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_card_bag_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_card_bag_data = on_card_bag_data;

//卡牌碎片合成
function on_card_piece_compose(data,send,s)
{
    global.log("on_card_piece_compose");

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

    var xid=data.xid;
    if(xid==undefined)
    {
        global.log("xid == undefined");
        return;
    }

    if(Object.keys(role.card_bag).length>=role.cbag_limit)
    {
        var msg = {
            "op" :msg_id.NM_CAED_PIECE_COMPOSE,
            "ret" : msg_code.CARD_BAG_IS_FULL
        };
        send(msg);
        return;
    }

    var card_piece_data=role.card_piece[xid];
    if(card_piece_data==undefined)
    {
        global.log("card_piece_data == undefined");
        return;
    }

    var card_piece_x_data=card_frag_data.card_frag_data_list[xid];
    if(card_piece_x_data==undefined)
    {
        global.log("card_piece_x_data == undefined");
        return;
    }

    if(card_piece_data.num<card_piece_x_data.num)
    {
        var msg = {
            "op" : msg_id.NM_CAED_PIECE_COMPOSE,
            "ret" : msg_code.PIECE_NOT_ENOUCH
        };
        send(msg);
        return;
    }

    var uid=help_create_role_card(role,xid);
    card_piece_data.num-=card_piece_x_data.num;
    if(card_piece_data.num<=0)
    {
        delete  role.card_piece[xid];
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_CAED_PIECE_COMPOSE,
        "uid" : uid,
        "xid" : xid,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //通知消息提醒
    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"uid":uid};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_card_piece_compose",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_card_piece_compose = on_card_piece_compose;

//卡牌强化
function on_card_strengthen(data,send,s)
{
    global.log("on_card_strengthen");

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

    var card_uid = data.warrior_uid ; //升级卡牌uid
    var material_uids = data.material_uids ; //消耗的武将uids
    if(card_uid == undefined || material_uids == undefined)
    {
        global.log("card_uid == undefined || material_uids == undefined");
        return;
    }

    var _card_data=role.card_bag[card_uid];
    if(_card_data==undefined)
    {
        global.log("_card_data == undefined");
        return;
    }

    var card_json_data=card_data.card_data_list[_card_data.card_id];
    if(card_json_data==undefined)
    {
        global.log("card_json_data == undefined");
        return;
    }

    //不能超过角色+10
    if(_card_data.level>role.level+const_value.CARD_EXCEED_ROLE_LIMIT)
    {
        var msg = {
            "op" : msg_id.NM_CARD_STRENGTH,
            "ret" : msg_code.LEVEL_EXCEED_ROLE_LIMIT
        };
        send(msg);
        return;
    }

    //等级限制
    var lv_limit=card_json_data.level_limit;
    switch(_card_data.b_level)
    {
        case 3:
            lv_limit=const_value.REBORN_LEVEL_FOUR;
            break;
        case 4:
            lv_limit=const_value.REBORN_LEVEL_FIVE;
            break;
        case 5:
            lv_limit=const_value.REBORN_LEVEL_SIX;
            break;
        case 6:
            lv_limit=const_value.REBORN_LEVEL_SEVEN;
            break;
    }

    if(_card_data.level>lv_limit)
    {
        var msg = {
            "op" : msg_id.NM_CARD_STRENGTH,
            "ret" : msg_code.LEVEL_EXCEED_LIMIT
        };
        send(msg);
        return;
    }


    var gain_exp=0;
    for(var i=0;i<material_uids.length;i++)
    {
        var material_data=role.card_bag[material_uids[i]];
        if(material_data==undefined)
        {
            global.log("material_data == undefined,uid:"+material_uids[i]);
            return;
        }
        //不能强化城守和上阵武将
        if(material_data.guard || material_data.used)
        {
            var msg = {
                "op" : msg_id.NM_CARD_STRENGTH,
                "ret" : msg_code.CARD_STRENGTH_ERROR
            };
            send(msg);
            return;
        }
        //不能强化自己
        if(material_data.unique_id==card_uid)
        {
            var msg = {
                "op" : msg_id.NM_CARD_STRENGTH,
                "ret" : msg_code.CARD_STRENGTH_ERROR
            };
            send(msg);
            return;
        }

        var material_json_data=card_data.card_data_list[material_data.card_id];
        if(material_json_data==undefined)
        {
            global.log("material_json_data == undefined,uid:"+material_uids[i]);
            return;
        }
        var material_exp=material_json_data.exp+material_json_data.exp_add*(material_data.level-1);
        if(material_json_data.race==card_json_data.race)
        {
            material_exp*=2;
        }
        gain_exp+=material_exp;
    }

    var cost_money=gain_exp*const_value.Up_CARD_COST_MONEY_RATIO;
    //升级
    var pay_ok=money_logic.help_pay_money(role,cost_money);
    if(pay_ok)
    {
        //卡牌升级处理
        help_card_level_up(role,_card_data,gain_exp);

        //除去材料
        for(var i=0;i<material_uids.length;i++)
        {
            delete role.card_bag[material_uids[i]];
        }
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_CARD_STRENGTH,
            "ret" : msg_code.GOLD_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_CARD_STRENGTH,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "gold":role.gold,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_card_strengthen",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_card_strengthen = on_card_strengthen;

//卡牌转生
function on_card_reborn(data,send,s)
{
    global.log("on_card_reborn");

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

    var w_unique_id = data.warrior_uid ; //目标卡牌唯一ID
    if(w_unique_id == undefined)
    {
        global.log("w_unique_id == undefined");
        return;
    }

    var _card_data=role.card_bag[w_unique_id];
    var _card_json_data=card_data.card_data_list[_card_data.card_id];
    if(_card_data==undefined||_card_json_data==undefined)
    {
        global.log("_card_data==undefined||_card_json_data==undefined");
        return;
    }

    if(_card_data.b_level>=_card_json_data.reborn_limit)
    {
        var msg = {
            "op" : msg_id.NM_CARD_REBORN,
            "ret" : msg_code.REBORN_EXCEED_LIMIT
        };
        send(msg);
        return;
    }

    var lv_limit=0;
    switch(_card_data.b_level)
    {
        case 0:
            lv_limit=const_value.REBORN_LEVEL_ONE;
            break;
        case 1:
            lv_limit=const_value.REBORN_LEVEL_TWO;
            break;
        case 2:
            lv_limit=const_value.REBORN_LEVEL_THREE;
            break;
        case 3:
            lv_limit=const_value.REBORN_LEVEL_FOUR;
            break;
        case 4:
            lv_limit=const_value.REBORN_LEVEL_FIVE;
            break;
        case 5:
            lv_limit=const_value.REBORN_LEVEL_SIX;
            break;
        case 6:
            lv_limit=const_value.REBORN_LEVEL_SEVEN;
            break;
    }

    if(_card_data.level<lv_limit)
    {
        var msg = {
            "op" : msg_id.NM_CARD_REBORN,
            "ret" : msg_code.REBORN_LEVEL_LOW
        };
        send(msg);
        return;
    }

    //检测装备是否齐全
    for(var i=0;i<_card_data.e_list.length;i++)
    {
        if(_card_data.e_list[i]==0)
        {
            var msg = {
                "op" : msg_id.NM_CARD_REBORN,
                "ret" : msg_code.EVOLVE_EQUIP_LACK
            };
            send(msg);
            return;
        }
    }


    //检测是否需要消耗武将
    var material_arr=[];
    if(_card_data.b_level>=3)
    {
        for(var key in role.card_bag)
        {
            var _material_data=role.card_bag[key];
            if(_material_data.card_id==_card_data.card_id&&_material_data.unique_id!=_card_data.unique_id&&_material_data.b_level==0)
            {
                material_arr.push(_material_data);
            }
        }

        if(material_arr.length<=0)
        {
            var msg = {
                "op" : msg_id.NM_CARD_REBORN,
                "ret" : msg_code.CARD_NOT_ENOUGH
            };
            send(msg);
            return;
        }
    }


    var cost_money=Math.floor(1380000*(_card_data.b_level+1)/66);
    var pay_ok=money_logic.help_pay_money(role,cost_money);
    if(pay_ok)
    {
        //转生等级提升
        _card_data.b_level++;
        //成就
        if(_card_data.b_level==1)
        {
            //转生武将个数
            role.achievement[const_value.ACHI_TYPE_CARD_EVOLVE_COUNT].times++;
        }
        if(_card_data.b_level>role.achievement[const_value.ACHI_TYPE_CARD_EVOLVE_LEVEL].times)
        {
            //转生武将等级
            role.achievement[const_value.ACHI_TYPE_CARD_EVOLVE_LEVEL].times=_card_data.b_level;
        }


        //去除材料
        var min_level=0;
        var min_uid=0;
        for(var i=0;i<material_arr.length;i++)
        {
            if(min_level==0||material_arr[i].level<min_level)
            {
                min_level=material_arr[i].level;
                min_uid=material_arr[i].unique_id;
            }
        }

        delete role.card_bag[min_uid];
        //去除装备
        _card_data.e_list.splice(0,3,0,0,0);

        //更新阵型
        if(_card_data.used)
        {
            var _formation_data=formation_data.formation_list[role.grid];
            for(var j=0;i<_formation_data.card_ls.length;i++)
            {
                if(_formation_data.card_ls[i].unique_id==_card_data.unique_id)
                {
                    _formation_data.card_ls[i].b_level=_card_data.b_level;
                    _formation_data.card_ls[i].e_list=[0,0,0];
                }
            }
        }
        //更新守城武将
        if(_card_data.guard)
        {
            for(var key in town_data.town_data_list)
            {
                if(town_data.town_data_list[key].owner_grid==role.grid&&town_data.town_data_list[key].guard_data.unique_id==_card_data.unique_id)
                {
                    town_data.town_data_list[key].guard_data.b_level=_card_data.b_level;
                    town_data.town_data_list[key].guard_data.equips=[0,0,0];
                    break;
                }
            }
        }


        user.nNeedSave=1;

        var msg = {
            "op" : msg_id.NM_CARD_REBORN,
            "uid":min_uid,
            "ret" : msg_code.SUCC
        };
        send(msg);

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_ENTER_GAME,
            "gold":role.gold ,
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_CARD_REBORN,
            "ret" : msg_code.GOLD_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_card_reborn",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_card_reborn = on_card_reborn;

//卡牌出售
function on_sell_cards(data,send,s)
{
    global.log("on_sell_cards");

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
    if(uid == undefined)
    {
        global.log("uid == undefined");
        return;
    }

    var _card_data=role.card_bag[uid];
    var _card_json_data=card_data.card_data_list[_card_data.card_id];
    if(_card_data==undefined||_card_json_data==undefined)
    {
        global.log("_card_data==undefined||_card_json_data==undefined");
        return;
    }

    if(_card_data.used)
    {
        var msg = {
            "op" : msg_id.NM_CARD_SELL,
            "ret" : msg_code.CARD_ON_FORMATION
        };
        send(msg);
        return;
    }
    if(_card_data.guard)
    {
        var msg = {
            "op" : msg_id.NM_CARD_SELL,
            "ret" : msg_code.CARD_ON_GUARD
        };
        send(msg);
        return;
    }
    var gain_money=_card_json_data.money+(_card_json_data.money_add*(_card_data.level-1));
    for(var j=0;j<_card_data.e_list.length;j++)
    {
        if(_card_data.e_list[j])
        {
            var _item_id=_card_data.e_list[j].equip_id;
            gain_money+=item_data.item_data_list[_item_id].price;
        }

    }
    var is_notice=_card_data.gain_time>role.cbag_time?1:0;
    delete role.card_bag[uid];

    money_logic.help_gain_money(role,gain_money);

    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_CARD_SELL,
        "ret" : msg_code.SUCC
    };
    send(msg);

    if(is_notice)
    {
        role_data_logic.help_notice_role_msg(role,send);
    }

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "gold":role.gold,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sell_cards",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_sell_cards = on_sell_cards;

//卡牌碎片出售
function on_sell_card_fragment(data,send,s)
{
    global.log("on_sell_card_fragment");

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
    var xid=data.xid;
    var num=Number(data.num);
    if(xid == undefined||num == undefined)
    {
        global.log("xid == undefined||num == undefined");
        return;
    }

    var _card_frag_data=role.card_piece[xid];
    var _card_frag_json_data=card_frag_data.card_frag_data_list[xid];
    if(_card_frag_data==undefined||_card_frag_json_data==undefined)
    {
        global.log("_card_frag_data==undefined||_card_frag_json_data==undefined");
        return;
    }

    if(_card_frag_data.num<num)
    {
        var msg = {
            "op" : msg_id.NM_CARDFRAGMENT_SELL,
            "ret" : msg_code.PIECE_NOT_ENOUCH
        };
        send(msg);
    }

    var gain_money=_card_frag_json_data.price*num;
    _card_frag_data.num-=num;
    if(_card_frag_data.num<=0)
    {
        delete role.card_piece[xid];
    }

    money_logic.help_gain_money(role,gain_money);
    user.nNeedSave=1;

    var msg = {
        "op" : msg_id.NM_CARDFRAGMENT_SELL,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
        "gold":role.gold,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sell_card_fragment",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_sell_card_fragment = on_sell_card_fragment;


//卡牌升级
var help_card_level_up=function(role,role_card_data,exp)
{
    global.log("help_card_level_up");
    if(role==undefined||role_card_data==undefined||exp==undefined)
    {
        global.log("role==undefined||role_card_data==undefined||exp==undefined");
        return;
    }

    var card_json_data=card_data.card_data_list[role_card_data.card_id];
    if(card_json_data==undefined)
    {
        global.log("card_json_data == undefined");
        return;
    }
    role_card_data.exp+=exp;

    var _card_exp_data=card_exp_data.card_exp_data_list[role_card_data.level];

    /*
    * 1：武将等级不能超过角色等级+10；
    * 2：武将在满足条件1的情况下，可以不受限制的升级到30；
    * 3：武将1,2转最高等级上限是30.
    * 3：武将超过30级，必须转生才能提高等级上限
    * 4：武将等级上限是下次转生限制等级
    * */

    //等级限制
    var lv_limit=card_json_data.level_limit;
    switch(role_card_data.b_level)
    {
        case 3:
            lv_limit=const_value.REBORN_LEVEL_FOUR;
            break;
        case 4:
            lv_limit=const_value.REBORN_LEVEL_FIVE;
            break;
        case 5:
            lv_limit=const_value.REBORN_LEVEL_SIX;
            break;
        case 6:
            lv_limit=const_value.REBORN_LEVEL_SEVEN;
            break;
    }



     while(_card_exp_data
     &&role_card_data.exp>=_card_exp_data.exp_limit*card_json_data.exp_param
     &&role_card_data.level<=role.level+const_value.CARD_EXCEED_ROLE_LIMIT
     &&role_card_data.level<=lv_limit)
    {
        role_card_data.exp-=_card_exp_data.exp_limit*card_json_data.exp_param;
        role_card_data.level++;
        _card_exp_data=card_exp_data.card_exp_data_list[role_card_data.level];
    }

    //更新阵型
    if(role_card_data.used)
    {
        var _formation_data=formation_data.formation_list[role.grid];
        for(var i=0;i<_formation_data.card_ls.length;i++)
        {
            if(_formation_data.card_ls[i].unique_id==role_card_data.unique_id)
            {
                _formation_data.card_ls[i].level=role_card_data.level;
                break;
            }
        }
    }
    //更新守城武将
    if(role_card_data.guard)
    {
        for(var key in town_data.town_data_list)
        {
            if(town_data.town_data_list[key].owner_grid==role.grid&&town_data.town_data_list[key].guard_data.unique_id==role_card_data.unique_id)
            {
                town_data.town_data_list[key].guard_data.level=role_card_data.level;
                break;
            }
        }
    }

};
exports.help_card_level_up = help_card_level_up;
