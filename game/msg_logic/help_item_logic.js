/***
 *
 * 装备逻辑
 *
 */

var make_db = require("./make_db");
var ds = require("./data_struct");
var define_code=require("./define_code");
var formation_data=require("./formation_data");
var item_data=require("./item_data");
var card_data=require("./card_data");
var town_data=require("./town_data");
var log_data=require("./log_data");

var common_func=require("./common_func");
var log_data_logic=require("./help_log_data_logic");
var role_data_logic= require("./help_role_data_logic");
var drop_logic=require("./help_drop_logic");
var money_logic=require("./help_money_logic");

var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

//给角色创建一个道具，放入道具背包
function help_create_role_item(role,item_id,num)
{
    global.log("help_create_role_item");
    if(role == undefined || item_id == undefined || num==undefined)
    {
        global.log("role == undefined || item_id == undefined || num==undefined");
        return;
    }

    var item_json_data = item_data.item_data_list[item_id];
    if(item_json_data == undefined)
    {
        global.log("item_json_data == undefined");
        return;
    }

    var _item = role.item_bag[item_id];
    if(_item==undefined)
    {
        _item = new ds.Role_Item_Data();
        _item.item_id=item_id;
        _item.gain_time=(new Date()).getTime();

        role.item_bag[item_id]=_item;
    }
    _item.num += num;

    //装备成就更新
    if(item_json_data.type==const_value.ITEM_TYPE_EQUIP)
    {
        role.achievement[const_value.ACHI_TYPE_EQUIP_NUM].times+=num;
    }

    var log_content={"item" : _item};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_create_role_item",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.help_create_role_item = help_create_role_item;

//获取道具背包信息
function on_item_bag_data(data,send,s)
{
    global.log("on_item_bag_data");

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
    var items=[];

    var _item_bag=role.item_bag;
    if(_item_bag==undefined)
    {
        global.log("_item_bag == undefined");
        return;
    }

    for(var key in _item_bag)
    {
        var _item_data=_item_bag[key];
        if(_item_data)
        {
            var client_item_data={};
            client_item_data.xid=_item_data.item_id;
            client_item_data.num=_item_data.num;
            client_item_data.timestamp=_item_data.gain_time;

            items.push(client_item_data);
        }
    }

    var msg = {
        "op" : msg_id.NM_EQUIP_BGA_DATA,
        "items" : items,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_item_bag_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);


}
exports.on_item_bag_data = on_item_bag_data;

//装备合成
function on_equip_compose(data,send,s)
{
    global.log("on_equip_compose");

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

    var item_x_data=item_data.item_data_list[xid];
    if(item_x_data==undefined)
    {
        global.log("item_x_data==undefined");
        return;
    }

    var units=item_x_data.unit;
    var unit_nums=item_x_data.unit_num;

    if(units.length==0)
    {
        var msg = {
            "op" : msg_id.NM_EQUIP_COMPOSE,
            "ret" : msg_code.EQUIP_CANT_COMPOSE
        };
        send(msg);
        return;
    }

    var is_ok=1;
    for(var i=0;i<units.length;i++)
    {
        var item_bag_data=role.item_bag[units[i]];
        if(item_bag_data&&item_bag_data.num>=unit_nums[i])
        {
            continue;
        }
        else
        {
            is_ok=0;
            break;
        }
    }

    if(!is_ok)
    {
        var msg = {
            "op" : msg_id.NM_EQUIP_COMPOSE,
            "ret" : msg_code.COMPOSE_MATERIAL_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    var pay_ok=money_logic.help_pay_money(role,item_x_data.s_price);
    if(pay_ok)
    {
        //创建道具
        help_create_role_item(role,xid,1);
        //去除材料
        for(var i=0;i<units.length;i++)
        {
            var item_bag_data=role.item_bag[units[i]];
            item_bag_data.num-=unit_nums[i];
            if(item_bag_data.num<=0)
            {
                delete  role.item_bag[units[i]];
            }
        }

        var msg = {
            "op" : msg_id.NM_EQUIP_COMPOSE,
            "ret" : msg_code.SUCC
        };
        send(msg);

        user.nNeedSave=1;

        //推送客户端全局修改信息
        var g_msg = {
            "op" : msg_id.NM_USER_DATA,
            "gold":role.gold,
            "ret" :msg_code.SUCC
        };
        send(g_msg);
        global.log(JSON.stringify(g_msg));

    }
    else
    {
        var msg = {
            "op" : msg_id.NM_EQUIP_COMPOSE,
            "ret" : msg_code.GOLD_NOT_ENOUGH
        };
        send(msg);
        return;
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_equip_compose",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_equip_compose = on_equip_compose;

//装备碎片合成
function on_equip_piece_compose(data,send,s)
{
    global.log("on_equip_piece_compose");

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

    var item_bag_data=role.item_bag[xid];
    if(item_bag_data==undefined)
    {
        global.log("item_bag_data == undefined");
        return;
    }

    var item_piece_x_data=item_data.item_data_list[xid];
    if(item_piece_x_data==undefined)
    {
        global.log("item_piece_x_data == undefined");
        return;
    }

    if(item_piece_x_data.type==const_value.ITEM_TYPE_EQUIP_FRAG)
    {
        if(item_bag_data.num<item_piece_x_data.num)
        {
            var msg = {
                "op" : msg_id.NM_EQUIP_PIECE_COMPOSE,
                "ret" : msg_code.PIECE_NOT_ENOUCH
            };
            send(msg);
            return;
        }
        //创建道具
        help_create_role_item(role,item_piece_x_data.equip_id,1);
        item_bag_data.num-=item_piece_x_data.num;

        if(item_bag_data.num<=0)
        {
            delete  role.item_bag[xid];
        }

        user.nNeedSave=1;
        var msg = {
            "op" : msg_id.NM_EQUIP_PIECE_COMPOSE,
            "ret" : msg_code.SUCC
        };
        send(msg);

        //通知消息提醒
        role_data_logic.help_notice_role_msg(role,send);
    }
    else
    {
        global.log("on_equip_piece_compose error");
        var msg = {
            "op" : msg_id.NM_EQUIP_PIECE_COMPOSE,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
        return;
    }

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_equip_piece_compose",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_equip_piece_compose = on_equip_piece_compose;

//装备装载
function on_equip_upload(data,send,s)
{
    global.log("on_equip_upload");

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

    var c_uid=data.warrior_uid;
    var position=Number(data.position);
    if(c_uid == undefined || position == undefined)
    {
        global.log("c_uid == undefined || position == undefined");
        return;
    }

    var _card_data=role.card_bag[c_uid];
    var x_card_data=card_data.card_data_list[_card_data.card_id];

    if(_card_data==undefined ||x_card_data==undefined)
    {
        global.log("_card_data==undefined || x_card_data==undefined");
        return;
    }

    if(position>=const_value.CARD_EQUIP_LIMIT||position<0)
    {
        global.err("position error,position :"+position);
        var msg = {
            "op" : msg_id.NM_EQUIP_UPLOAD,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
        return;
    }

    //该位置已经存在装备
    if(_card_data.e_list[position])
    {
        global.err("_card_data.e_list :"+_card_data.e_list+" position:"+position);
        var msg = {
            "op" : msg_id.NM_EQUIP_UPLOAD,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
        return;
    }


    var p=_card_data.b_level*const_value.CARD_EQUIP_LIMIT;
    var need_equip_id=x_card_data.equip_list[p+position];
    if(need_equip_id==undefined)
    {
        global.log("need_equip_id==undefined");
        return;
    }

    var _equip_data=role.item_bag[need_equip_id];
    if(_equip_data&&_equip_data.num>=1)
    {
        var card_equip_data=new ds.Card_Equip_Data();
        card_equip_data.equip_id= need_equip_id;
        _card_data.e_list.splice(position,1,card_equip_data);
        if(_card_data.used)
        {
            help_update_formation_equipment(role,_card_data);
        }
        if(_card_data.guard)
        {
            help_update_guard_equipment(role,_card_data);
        }

        _equip_data.num--;
        if(_equip_data.num<=0)
        {
             delete role.item_bag[need_equip_id];
        }
    }
    else
    {
        var msg = {
            "op" : msg_id.NM_EQUIP_UPLOAD,
            "ret" : msg_code.EQUIP_NOT_EXIST
        };
        send(msg);
        return;
    }

    var msg = {
        "op" : msg_id.NM_EQUIP_UPLOAD,
        "ret" : msg_code.SUCC
    };
    send(msg);
    user.nNeedSave=1;

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_equip_upload",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_equip_upload = on_equip_upload;


//道具出售
function on_sell_items(data,send,s)
{
    global.log("on_sell_items");

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

    var item_id=data.xid;
    var num=Number(data.num);
    if(item_id == undefined || num==undefined)
    {
        global.log("item_id == undefined || num==undefined");
        return;
    }

    var _item_data=role.item_bag[item_id];
    var _item_json_data=item_data.item_data_list[item_id];
    if(_item_data==undefined || _item_json_data==undefined)
    {
        global.log("_item_data || _item_json_data==undefined");
        return;
    }

    if(_item_data.num<num)
    {
        var msg = {
            "op" : msg_id.NM_ITEM_SELL,
            "ret" : msg_code.COUNT_EXCEED_LIMIT
        };
        send(msg);
        return;
    }

    var gain_money=_item_json_data.price*num;
    money_logic.help_gain_money(role,gain_money);

    _item_data.num-=num;
    if(_item_data.num<=0)
    {
        delete role.item_bag[item_id];
    }

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_ITEM_SELL,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "gold":role.gold,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));


    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_sell_items",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_sell_items = on_sell_items;

//使用道具
function on_use_item(data,send,s)
{
    global.log("on_use_item");

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

    var item_id=data.xid;
    var _item_data=role.item_bag[item_id];
    var _item_json_data=item_data.item_data_list[item_id];
    if(_item_data==undefined || _item_json_data==undefined)
    {
        global.log("_item_data==undefined || _item_json_data==undefined");
        return;
    }

    var rewards=[];
    switch(_item_json_data.type)
    {
        case const_value.ITEM_TYPE_STAMINA:
            role.stamina+=_item_json_data.power_num;
            var obj={};
            obj.type=const_value.REWARD_TYPE_POINT;
            obj.xid="";
            obj.num=_item_json_data.power_num;
            rewards.push(obj);
            break;
        case const_value.ITEM_TYPE_BOX:
            var key_id=_item_json_data.key_id;
            if(key_id)
            {
                //使用钥匙
                var key_item_data=role.item_bag[key_id];
                if(key_item_data==undefined)
                {
                    var msg = {
                        "op" : msg_id.NM_USE_ITEM,
                        "ret" : msg_code.KEY_NOT_ENOUGH
                    };
                    send(msg);
                    return;
                }
                //消耗一个钥匙
                key_item_data.num-=1;
                if(key_item_data.num<=0)
                {
                    delete role.item_bag[key_id];
                }
            }
            drop_logic.help_gain_drop_data(_item_json_data.drop_id,rewards);
            for(var i=0;i<rewards.length;i++)
            {
                var gain_item=drop_logic.help_put_item_to_role(role,rewards[i].xid,rewards[i].num,rewards[i].type);
                rewards[i].uids=gain_item.uids;
            }
            break;
    }

    //道具结算
    _item_data.num--;
    //如果道具个数为零
    if(_item_data.num<=0)
    {
        delete role.item_bag[item_id];
    }

    var msg = {
        "op" : msg_id.NM_USE_ITEM,
        "rewards" :rewards,
        "ret" : msg_code.SUCC
    };
    send(msg);

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

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_use_item",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_use_item = on_use_item;

function help_auto_equip_card(role,_card_data)
{
    global.log("help_auto_equip_card");
    if(role==undefined || _card_data==undefined)
    {
        global.log("role==undefined || _card_data==undefined");
        return;
    }

    var equipment_uids=[];
    var x_card_data=card_data.card_data_list[_card_data.card_id];
    if(x_card_data==undefined)
    {
        global.log("x_card_data==undefined");
        return;
    }

    var equip_arr=[];
    var equip_d_arr=[];
    for(var key in role.equip_bag)
    {
        var equip_bag_data=role.equip_bag[key];
        var x_equip_data=equip_data.equip_data_list[equip_bag_data.equip_id];
        if(!equip_bag_data.card_uid && x_equip_data.type==x_card_data.race)
        {
            var obj={};
            obj.equip_uid=key;
            obj.grade=x_equip_data.grade;
            obj.level=equip_bag_data.level;

            if(equip_arr.length==0)
            {
                equip_arr.push(obj);
            }
            else
            {
                for(var i=0;i<equip_arr.length;i++)
                {
                    if(obj.grade>equip_arr[i].grade)
                    {
                        if(i==0)
                        {
                            equip_arr.unshift(obj);
                        }
                        else
                        {
                            equip_arr.splice(i,0,obj);
                        }

                        break;
                    }
                    else if(obj.grade==equip_arr[i].grade)
                    {
                        if(obj.level>=equip_arr[i].level)
                        {
                            if(i==0)
                            {
                                equip_arr.unshift(obj);
                            }
                            else
                            {
                                equip_arr.splice(i-1,0,obj);
                            }
                            break;
                        }
                        else
                        {
                            equip_arr.splice(i,0,obj);
                            break;
                        }
                    }
                }
            }
        }
        else if(!equip_bag_data.card_uid && x_equip_data.type==const_value.EQUIP_TYPE_DEFEND)
        {
            var obj={};
            obj.equip_uid=key;
            obj.grade=x_equip_data.grade;
            obj.level=equip_bag_data.level;

            if(equip_d_arr.length==0)
            {
                equip_d_arr.push(obj);
            }
            else
            {
                for(var i=0;i<equip_d_arr.length;i++)
                {
                    if(obj.grade>equip_d_arr[i].grade)
                    {
                        if(i==0)
                        {
                            equip_d_arr.unshift(obj);
                        }
                        else
                        {
                            equip_d_arr.splice(i,0,obj);
                        }

                        break;
                    }
                    else if(obj.grade==equip_d_arr[i].grade)
                    {
                        if(obj.level>=equip_d_arr[i].level)
                        {
                            if(i==0)
                            {
                                equip_d_arr.unshift(obj);
                            }
                            else
                            {
                                equip_d_arr.splice(i-1,0,obj);
                            }
                            break;
                        }
                        else
                        {
                            equip_d_arr.splice(i,0,obj);
                            break;
                        }
                    }
                }
            }
        }
    }

    //合并两个数组
    for(var i=0;i<equip_d_arr.length;i++)
    {
        equip_arr.push(equip_d_arr[i]);
    }
    global.log("_card_data.e_list:"+_card_data.e_list);
    for(var i=0;i<_card_data.e_list.length;i++)
    {
        var equip_uid=_card_data.e_list[i];
        if(equip_uid==0&&equip_arr.length>0)
        {
            _card_data.e_list.splice(i,1,equip_arr[0].equip_uid);
            var equip_bag_data=role.equip_bag[equip_arr[0].equip_uid];
            equip_bag_data.card_uid=_card_data.unique_id;
            equipment_uids.push(Number(equip_arr[0].equip_uid));
            equip_arr.shift();
        }
    }

    return equipment_uids;
}

//更新阵型上的装备
function help_update_formation_equipment(role,_card_data)
{
    global.log("help_update_formation_equipment");

    if(role==undefined || _card_data==undefined)
    {
        global.log(role==undefined || _card_data==undefined);
        return;
    }

    //更新阵型
    var _formation_data=formation_data.formation_list[role.grid];

    for(var i=0;i<_formation_data.card_ls.length;i++)
    {
        var formation_card_data=_formation_data.card_ls[i];
        if(formation_card_data.unique_id==_card_data.unique_id)
        {
            for(var j=0;j<_card_data.e_list.length;j++)
            {
                if(_card_data.e_list[j])
                {
                    var formation_equip_data= formation_card_data.e_list[j];
                    if(!formation_equip_data)
                    {
                        formation_equip_data= new formation_data.FormationEquipData();
                        formation_card_data.e_list.splice(j,1,formation_equip_data);
                    }
                    formation_equip_data.equip_id=_card_data.e_list[j].equip_id;
                }
            }
            break;
        }
    }

}

//更新守城武将上的装备
function help_update_guard_equipment(role,_card_data)
{
    global.log("help_update_guard_equipment");

    if(role==undefined || _card_data==undefined)
    {
        global.log(role==undefined || _card_data==undefined);
        return;
    }

    //更新阵型
    for(var key in town_data.town_data_list)
    {
        if(town_data.town_data_list[key].owner_grid==role.grid&&town_data.town_data_list[key].guard_data.unique_id==_card_data.unique_id)
        {
            for(var i=0;i<_card_data.e_list.length;i++)
            {
                if(_card_data.e_list[i])
                {
                    var guard_equip_data= town_data.town_data_list[key].guard.equips[i];
                    if(!guard_equip_data)
                    {
                        guard_equip_data= new town_data.GuardEquipData();
                        town_data.town_data_list[key].guard.equips.splice(i,1,guard_equip_data);
                    }
                    guard_equip_data.equip_id=_card_data.e_list[i].equip_id;
                }
            }
            break;
        }
    }

}








