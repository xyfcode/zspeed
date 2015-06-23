/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-8-16
 * Time: 下午6:26
 * To change this template use File | Settings | File Templates.
 */
var make_db = require("./make_db");
var ds = require("./data_struct");
var define_code = require("./define_code");
var common_func = require("./common_func");
var recruit_data = require("./recruit_data");
var log_data=require("./log_data");
var log_data_logic = require("./help_log_data_logic");

var money_logic=require("./help_money_logic");
var drop_logic=require("./help_drop_logic");

var role_data_logic=require("./help_role_data_logic");
var const_value=define_code.const_value;
var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;


var g_server = null;

/**
 * 初始化
 * @param s
 */
function init(s)
{
    g_server = s;
}
exports.init=init;


//用户招募信息
function on_user_recruit_data(data,send,s)
{
    global.log("on_user_recruit_data");
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
    //用户注册时间
    var c_date=user.account_data.c_date;
    var now=new Date();
    var arr=[];
    for(var key in recruit_data.recruit_data_list)
    {
        var _recruit_data=recruit_data.recruit_data_list[key];
        if(_recruit_data==undefined)
        {
            global.log("_recruit_data == undefined");
            return;
        }
        var role_recruit_data=role.recruit[_recruit_data.recruit_id];

        if(role_recruit_data == undefined)
        {
            //临时添加用户属性，可以用于以后上线后数据结构扩展
            role_recruit_data=new ds.Role_Recruit_Data();
            role_recruit_data.time=c_date;
            role_recruit_data.l_pro=100;//低级概率初始化为100
            role.recruit[_recruit_data.recruit_id]=role_recruit_data;
            user.nNeedSave=1;
        }

        var client_recruit_data=new Object();
        client_recruit_data.recruit_id=_recruit_data.recruit_id;
        client_recruit_data.first=0;//是否首次

        //免费抽卡时间间隔
        var need_time=(_recruit_data.free_minute)*60*1000;
        //首次抽
        if(role_recruit_data.count==0)
        {
            client_recruit_data.first=1;
            need_time=(_recruit_data.first_free_minute)*60*1000;
        }

        if(!common_func.help_judge_today(role_recruit_data.time))
        {
            //每日次数重置
            role_recruit_data.t_count=0;
        }

        //黄金招募（剩余次数只是针对单抽）
        if(_recruit_data.recruit_id=="1")
        {
            //计算黄金招募五星剩余次数
            if(role_recruit_data.count==0)
            {
                //首次抽卡得四星
                client_recruit_data.left_count=1;
            }
            else if(role_recruit_data.count<4)
            {
                //第三次抽得五星
                client_recruit_data.left_count=4-role_recruit_data.count;//五星剩余次数
            }
            else
            {
                //总次数
                var total_count=_recruit_data.mid_add_limit+Math.ceil(100/(_recruit_data.mid_add));
                client_recruit_data.left_count=total_count- role_recruit_data.m_count;//五星剩余次数
            }
            //免费倒计时
            client_recruit_data.time=need_time-(now.getTime()-role_recruit_data.time);

        }
        else if(_recruit_data.recruit_id=="2")
        {
            //计算道具招募今日免费次数
            client_recruit_data.free_count=_recruit_data.free_times-role_recruit_data.t_count;
            client_recruit_data.free_count=client_recruit_data.free_count<=0?0:client_recruit_data.free_count;
            if(client_recruit_data.free_count>0)
            {
                client_recruit_data.time=need_time-(now.getTime()-role_recruit_data.time);
            }
            else
            {
                //今日没有免费次数，没有了倒计时
                client_recruit_data.time=0;
            }
        }
        client_recruit_data.time=client_recruit_data.time<0?0:client_recruit_data.time;

        arr.push(client_recruit_data);
    }

    var msg = {
        "op" : msg_id.NM_USER_RECRUIT_DATA,
        "arr" : arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_user_recruit_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_user_recruit_data = on_user_recruit_data;

//抽卡
function on_take_card(data,send,s)
{
    global.log("on_take_card");
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

    var recruitId = data.recruit_id;
    var type = data.type;//抽卡类别
    if(recruitId == undefined || type == undefined)
    {
        global.log("recruitId == undefined || type == undefined");
        return;
    }

    var recruit_json_data = recruit_data.recruit_data_list[recruitId];
    if(recruit_json_data == undefined)
    {
        global.log("recruit_json_data == undefined");
        return;
    }

    var role_recruit_data;
    var take_count=0;//抽卡次数
    var cost_resource_num=0;//消耗的资源数量
    var now=new Date();
    if(type==1)
    {
        //单抽
        take_count=1;

        role_recruit_data=role.recruit[recruitId];
        if(role_recruit_data == undefined)
        {
            global.log("role_recruit_data == undefined");
            return;
        }

        var need_time=(recruit_json_data.free_minute)*60*1000;
        if(role_recruit_data.count==0)
        {
            //首次抽卡
            need_time=(recruit_json_data.first_free_minute)*60*1000;
        }

        //今日免费抽卡次数已经用完
        if(recruit_json_data.recruit_id=="2"&&recruit_json_data.free_times<=role_recruit_data.t_count)
        {
            cost_resource_num=recruit_json_data.cost_num;
        }
        else if(now.getTime()-role_recruit_data.time<need_time)
        {
            //非免费抽卡
            cost_resource_num=recruit_json_data.cost_num;
        }
    }
    else if(type==2)
    {
        //十连抽
        take_count=10;

        role_recruit_data=role.ten_recruit[recruitId];
        if(role_recruit_data == undefined)
        {
            role_recruit_data=new ds.Role_Recruit_Data();
            role_recruit_data.l_pro=100;//低级概率初始化为100
            role.ten_recruit[recruitId]=role_recruit_data;
            user.nNeedSave=1;
        }
        cost_resource_num=recruit_json_data.cost_num*take_count;
        if(recruitId==1)
        {
            //优惠
            cost_resource_num*=const_value.RECRUIT_DISCOUNT;
        }
    }

    switch(recruit_json_data.cost_type)
    {
        case const_value.REWARD_TYPE_RMB: //人民币
            var pay_ok=money_logic.help_pay_rmb(role,cost_resource_num);
            if(!pay_ok)
            {
                //金币不足
                var msg ={
                    "op" : msg_id.NM_TAKE_CARD,
                    "ret" : msg_code.RMB_NOT_ENOUGH
                };
                send(msg);
                return;
            }
            break;
        case const_value.REWARD_TYPE_MONEY: //游戏币
            var pay_ok=money_logic.help_pay_money(role,cost_resource_num);
            if(!pay_ok)
            {
                //铜钱不足
                var msg ={
                    "op" : msg_id.NM_TAKE_CARD,
                    "ret" : msg_code.GOLD_NOT_ENOUGH
                };
                send(msg);
                return;
            }
            break;
    }

    var take_arr = [];//抽到的道具
    for(var i = 0;i<take_count;i++)
    {
        help_take_card(role,recruit_json_data,role_recruit_data,take_arr,type);
    }

    if(cost_resource_num==0)
    {
        //记录上次免费抽卡时间
        role_recruit_data.time=now.getTime();
        if(recruit_json_data.recruit_id=="2")
        {
            role_recruit_data.t_count++; //今日次数增加
        }
    }

    user.nNeedSave = 1;

    var left_count=0;
    if(type==1 && recruitId==1)
    {
        if(role_recruit_data.count<4)
        {
            //第四次抽五星
            left_count=4- role_recruit_data.count;//五星剩余次数
        }
        else
        {
            //总次数
            var total_count=recruit_json_data.mid_add_limit+Math.ceil(100/(recruit_json_data.mid_add));
            left_count=total_count- role_recruit_data.m_count;//五星剩余次数
        }
    }

    var msg = {
        "op" : msg_id.NM_TAKE_CARD,
        "arr" : take_arr,
        "left_count":left_count,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_USER_DATA,
        "gold":role.gold ,
        "rmb":role.rmb ,
        "ret" :msg_code.SUCC
    };
    send(g_msg);
    global.log(JSON.stringify(g_msg));

    role_data_logic.help_notice_role_msg(role,send);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_take_card",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_take_card = on_take_card;

//抽卡逻辑
function help_take_card(role,recruit_json_data,role_recruit_data,take_arr,type)
{
    var take_item;//抽到的道具id

    if(type==1 && role_recruit_data.count==0)
    {
        //首抽(十连抽不计算在首抽里面，单独计算)
        take_item = help_get_one_random_item(recruit_json_data.first_coll_arr);
        role_recruit_data.h_count++;
    }
    else if(type==1 && role_recruit_data.count==3 && recruit_json_data.recruit_id=="1")
    {
        //第四次抽必获五星武将(十连抽不计算在首抽里面，单独计算)
        take_item = help_get_one_random_item(recruit_json_data.mid_coll_arr);
        role_recruit_data.l_pro+=role_recruit_data.m_pro;
        role_recruit_data.m_pro=0; //概率重置
        role_recruit_data.m_count=0; //次数重置

        role_recruit_data.h_count++;
    }
    else
    {
        var data_arr = [];
        var random_num=common_func.help_make_one_random(1,100);
        global.log("random_num:"+random_num);

        //从普通集合中取卡牌
        if(random_num<=role_recruit_data.l_pro)
        {

            data_arr=recruit_json_data.low_coll_arr;

            //次数增长
            role_recruit_data.m_count++;
            role_recruit_data.h_count++;

            //高级概率增加
            if(role_recruit_data.h_count>=recruit_json_data.hig_add_limit)
            {
                if(role_recruit_data.l_pro<recruit_json_data.hig_add)
                {
                    //概率不够了（100）
                    role_recruit_data.h_pro += role_recruit_data.l_pro;
                    role_recruit_data.l_pro = 0;
                }
                else
                {
                    role_recruit_data.h_pro += recruit_json_data.hig_add;
                    role_recruit_data.l_pro -= recruit_json_data.hig_add;
                }
            }

            //中级概率增加
            if(role_recruit_data.m_count>=recruit_json_data.mid_add_limit)
            {
                if(role_recruit_data.l_pro<recruit_json_data.mid_add)
                {
                    //概率不够了（100）
                    role_recruit_data.m_pro += role_recruit_data.l_pro;
                    role_recruit_data.l_pro = 0;
                }
                else
                {
                    role_recruit_data.m_pro += recruit_json_data.mid_add;
                    role_recruit_data.l_pro -= recruit_json_data.mid_add;
                }
            }
        }
        else if(random_num<=(role_recruit_data.l_pro+role_recruit_data.m_pro))  //从中级集合中取卡牌（装备）
        {
            data_arr = recruit_json_data.mid_coll_arr;
            role_recruit_data.l_pro+=role_recruit_data.m_pro;
            role_recruit_data.m_pro=0; //概率重置
            role_recruit_data.m_count=0;  //次数重置
            //高级增加
            role_recruit_data.h_count++;
            if(role_recruit_data.h_count>= recruit_json_data.hig_add_limit)
            {
                if(role_recruit_data.l_pro<recruit_json_data.hig_add)
                {
                    role_recruit_data.h_pro += role_recruit_data.l_pro;
                    role_recruit_data.l_pro = 0;
                }
                else
                {
                    role_recruit_data.h_pro += recruit_json_data.hig_add;
                    role_recruit_data.l_pro -= recruit_json_data.hig_add;
                }
            }
        }
        else //从高级集合中取卡牌
        {
            data_arr = recruit_json_data.hig_coll_arr;
            role_recruit_data.l_pro=100;

            role_recruit_data.m_pro=0; //概率重置
            role_recruit_data.m_count=0;  //次数重置
            role_recruit_data.h_pro=0; //概率重置
            role_recruit_data.h_count=0; //次数重置
        }

        if(data_arr.length >1)
        {
            take_item = help_get_one_random_item(data_arr);
        }
    }

    //总次数增加
    role_recruit_data.count++;


    //获取物品
    var gain_item=drop_logic.help_put_item_to_role(role,take_item.id,take_item.num,take_item.type);
    take_arr.push({"type":take_item.type,"uids":gain_item.uids,"xid":take_item.id,"num":take_item.num});

}

//获取随机物品
function help_get_one_random_item(arr)
{
    if(arr == undefined)
    {
        return;
    }
    var ret_obj=new Object();
    var map = new Object();
    var sum = 0;
    for(var i = 0;i < arr.length;i++)
    {
        var split_arr=arr[i].split(",");
        sum += Number(split_arr[3]);
        map[sum]=split_arr;
    }

    var r = common_func.help_make_one_random(0,sum);

    for(var key in map)
    {
        if(Number(key) > r)
        {
            ret_obj.type = map[key][0];
            ret_obj.id = map[key][1];
            ret_obj.num = Number(map[key][2]);
            break;
        }
    }
    return ret_obj;
}

