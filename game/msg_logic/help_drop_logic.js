var define_code=require("./define_code");
var drop = require("./drop_data");
var ds = require("./data_struct");
var card_logic=require("./help_card_logic");
var item_logic=require("./help_item_logic");
var money_logic=require("./help_money_logic");
var role_data_logic=require("./help_role_data_logic");
var common_func=require("./common_func");


var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;

var g_server = null;
exports.init = function(s)
{
    g_server = s;
};

//创建生成的物品 drop_item_id物品id，物品数量drop_item_num，类别
function help_put_item_to_role(role,item_id,item_num,item_type)
{
    global.log("help_put_item_to_role,item_id:"+item_id+",item_num:"+item_num+",item_type:"+item_type);
    if(role == undefined|| item_id==undefined||item_num ==undefined||item_type ==undefined)
    {
        global.log("role == undefined|| item_id==undefined||item_num ==undefined||item_type ==undefined");
        return;
    }

    var item_num=Number(item_num);

    var gain_item=new Object();
    gain_item.uids=[];
    gain_item.flag=0; //判断是否发送通知

    switch (Number(item_type))
    {
        //卡牌
        case const_value.REWARD_TYPE_CARD:
            for(var n=0;n<item_num;n++)
            {
                var item_uid=card_logic.help_create_role_card(role,item_id);
                gain_item.uids.push(item_uid);
                gain_item.flag=1;
            }
            break;
        //魂魄
        case const_value.REWARD_TYPE_SOUL:
            card_logic.help_create_card_piece(role,item_id,item_num);
            gain_item.flag=1;
            break;
        //道具
        case const_value.REWARD_TYPE_ITEM:
            item_logic.help_create_role_item(role,item_id,item_num);
            gain_item.flag=1;
            break;
        //人民币
        case const_value.REWARD_TYPE_RMB:
            money_logic.help_gain_rmb(role,item_num);
            break;
        //游戏币
        case const_value.REWARD_TYPE_MONEY:
            money_logic.help_gain_money(role,item_num);
            break;
        //积分
        case const_value.REWARD_TYPE_SCORE:
            role.score += item_num;
            break;
        //经验
        case const_value.REWARD_TYPE_EXP:
            role_data_logic.make_role_level(role,item_num);
            break;
        //体力
        case const_value.REWARD_TYPE_POINT:
            role.stamina += item_num;
            break;
        default :
            global.log("item_type is not exist,item_type:"+item_type);
            break;
    }

    return gain_item;
}
exports.help_put_item_to_role=help_put_item_to_role;


//获取掉落数据,根据drop_id drop表ID
function help_gain_drop_data(drop_id)
{
    global.log("help_gain_drop_data");
    if(common_func.isEmpty(drop_id))
    {
        global.log("param is empty");
        return;
    }
    global.log("drop_id:"+drop_id);
    var drop_json_data=drop.drop_data_list[drop_id];
    if(drop_json_data==undefined)
    {
        global.log("drop_json_data == undefined");
        return;
    }

    //概率
    var probability=drop_json_data.probability;
    var random_num=common_func.help_make_one_random(1,10000);

    var drop_data=[];
    if(probability*10000<=random_num)
    {
        //概率不足
        global.log("probability inadequate!");
        return drop_data;

        /*var client_drop_data=new Object();
        client_drop_data.type=-1;
        drop_data.push(client_drop_data); */

    }


    //全部掉落
    if(drop_json_data.is_all)
    {
        //概率获取物品
        for(var i=0;i<drop_json_data.drop_ls.length;i++)
        {
            var client_drop_data=new Object();
            //掉落类别
            client_drop_data.type=drop_json_data.drop_ls[i].type;
            //物品id
            client_drop_data.xid=drop_json_data.drop_ls[i].drop;
            //数量
            client_drop_data.count=drop_json_data.drop_ls[i].num;
            drop_data.push(client_drop_data);
        }
    }
    else
    {
        var drop_prob=common_func.help_make_one_random(1,10000);
        //概率获取物品
        for(var j=drop_json_data.drop_ls.length-1;j>=0;j--)
        {
            if((j==0)||(drop_prob>drop_json_data.drop_ls[j-1].probability&&drop_prob<=drop_json_data.drop_ls[j].probability))
            {
                var client_drop_data=new Object();
                //掉落类别
                client_drop_data.type=drop_json_data.drop_ls[j].type;
                //物品id
                client_drop_data.xid=drop_json_data.drop_ls[j].drop;
                //数量
                client_drop_data.count=drop_json_data.drop_ls[j].num;
                drop_data.push(client_drop_data);
                break;
            }
        }
    }

    return drop_data;

}
exports.help_gain_drop_data = help_gain_drop_data;

