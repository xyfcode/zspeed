/***
 *
 * 竞技场逻辑
 *
 */

var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var ds = require("./data_struct");
var define_code=require("./define_code");
var arena_data=require("./arena_data");
var formation=require("./formation_data");
var make_db=require("./make_db");

var money_logic=require("./help_money_logic");
var mail_logic=require("./help_mail_logic");
var drop_logic=require("./help_drop_logic");
var role_data_logic=require("./help_role_data_logic");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;

//查看竞技场中玩家本人的信息
function on_arena_data(data,send,s)
{
    global.log("on_arena_data");

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

    //获取我的竞技场数据
    var me_rank=help_get_hurt_rank(role.grid,formation.formation_list[role.grid].top_hurt);

    var rank_arr=[];
    //至少显示前十名玩家
    for(var i=1;i<=10;i++)
    {
        var obj=help_gain_client_data_by_rank(i);
        if(obj)
        {
            rank_arr.push(obj);
        }
    }

    if(me_rank<66)
    {
        //前面4名玩家
        for(var i=4;i>0;i--)
        {
            var front_rank=me_rank-i;
            if(front_rank<=10)
            {
                //如果是前十位，则不用添加了
                break;
            }
            var obj=help_gain_client_data_by_rank(front_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
        //自己
        if(me_rank>10)
        {
            var obj=help_gain_client_data_by_rank(me_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
        //后面4名玩家
        for(var i=1;i<=4;i++)
        {
            var after_rank=me_rank+i;
            if(after_rank<=10)
            {
                //如果是前十位，则不用添加了
                break;
            }
            var obj=help_gain_client_data_by_rank(after_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
    }
    else
    {
        //前面4名玩家
        for(var i=4;i>0;i--)
        {
            var front_rank=help_gain_rank_by_rank(me_rank,i);
            if(front_rank<=10)
            {
                //如果是前十位，则不用添加了
                break;
            }
            var obj=help_gain_client_data_by_rank(front_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
        //自己
        if(me_rank>10)
        {
            var obj=help_gain_client_data_by_rank(me_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
        //后面4名玩家
        for(var i=-1;i>=-4;i--)
        {
            var after_rank=help_gain_rank_by_rank(me_rank,i);
            if(after_rank<=10)
            {
                //如果是前十位，则不用添加了
                break;
            }
            var obj=help_gain_client_data_by_rank(after_rank);
            if(obj)
            {
                rank_arr.push(obj);
            }
        }
    }

    var msg = {
        "op" : msg_id.NM_ARENA_DATA,
        "rank":rank_arr,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_arena_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_arena_data = on_arena_data;


//领取排行榜奖励
function on_gain_arena_reward(data,send,s)
{
    global.log("on_gain_arena_reward");

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

    var id=data.id;
    var reward_json_data=arena_data.rank_reward_data_list[id];
    if(id == undefined || reward_json_data==undefined)
    {
        global.log("id == undefined || reward_json_data==undefined");
        return;
    }

    var _formation_data=formation.formation_list[role.grid];
    if(_formation_data == undefined)
    {
        global.log("_formation_data == undefined");
        return;
    }

    if(_formation_data.top_hurt<reward_json_data.damage_record)
    {
        var msg = {
            "op" : msg_id.NM_GAIN_ARENA_REWARD,
            "ret" : msg_code.NO_AUTHORITY
        };
        send(msg);
        return;
    }

    for(var i=0;i<role.rank_reward.length;i++)
    {
        if(role.rank_reward[i]==id)
        {
            var msg = {
                "op" : msg_id.NM_GAIN_ARENA_REWARD,
                "ret" : msg_code.REWARD_IS_GAINED
            };
            send(msg);
            return;
        }
    }

    //获取奖励
    var u_ids=[];
    var is_flag=0;//是否发送通知
    for(var i=0;i<reward_json_data.reward_array.length;i++)
    {
        var gain_item=drop_logic.help_put_item_to_role(role,reward_json_data.reward_array[i].id,reward_json_data.reward_array[i].num,reward_json_data.reward_array[i].type);
        u_ids.push(gain_item.uids);
        if(gain_item.flag)
        {
            is_flag=1;
        }
    }
    //存储奖励信息
    role.rank_reward.push(id);

    role_data_logic.help_notice_role_msg(role,send);

    user.nNeedSave=1;
    var msg = {
        "op" : msg_id.NM_GAIN_ARENA_REWARD,
        "uids":u_ids,
        "ret" : msg_code.SUCC
    };
    send(msg);

    //推送客户端全局修改信息
    var g_msg = {
        "op" : msg_id.NM_ENTER_GAME,
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
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_gain_arena_reward",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_gain_arena_reward = on_gain_arena_reward;

//获取排行榜玩家阵型信息
function on_get_rank_role_detail(data,send,s)
{
    global.log("on_get_rank_role_detail");

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
            "op":msg_id.NM_ARENA_ROLE_DETAIL,
            "ret": msg_code.USER_NOT_FIND
        };
        send(msg);
        return;
    }


    var warriors=[];
    for(var i=0;i<_formation_data.card_ls.length;i++)
    {
        var _card_data=_formation_data.card_ls[i];
        var card_client_data=new Object();

        card_client_data.xid=_card_data.card_id;
        card_client_data.level=_card_data.level;
        card_client_data.reborn_level=_card_data.b_level;
        card_client_data.equipments =[];

        for(var j=0;j<_card_data.e_list.length;j++)
        {
            var e_obj={};
            e_obj.xid=_card_data.e_list[j].equip_id;
            card_client_data.equipments.push(e_obj);
        }
        warriors.push(card_client_data);
    }

    var msg = {
        "op":msg_id.NM_ARENA_ROLE_DETAIL,
        "uid" : _formation_data.grid,
        "name" : _formation_data.name,
        "level" : _formation_data.level,
        "warriors":warriors,
        "ret": msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_rank_role_detail",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_rank_role_detail = on_get_rank_role_detail;


//获取排行榜玩家奖励信息
function on_get_rank_reward_data(data,send,s)
{
    global.log("on_get_rank_reward_data");

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

    var msg = {
        "op":msg_id.NM_ARENA_RANK_REWARD_DATA,
        "rewards" : role.rank_reward,
        "ret": msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_get_rank_reward_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);
}
exports.on_get_rank_reward_data = on_get_rank_reward_data;



//根据排名获取排行榜用户数据
var help_gain_client_data_by_rank=function(rank)
{
    var _rank_data=formation.top_hurt_rank[rank-1];
    var obj=null;
    if(_rank_data)
    {
        obj=new Object();
        obj.uid=_rank_data.grid;
        obj.damage=_rank_data.hurt;
        obj.rank=rank;
        var _formation_data=formation.formation_list[obj.uid];
        if(_formation_data==undefined)
        {
            global.log("_formation_data==undefined");
            return;
        }
        //头像ID
        obj.xid=_formation_data.card_ls[0].card_id;
        obj.name=_formation_data.name;
        obj.level=_formation_data.level;
        obj.town_num=_formation_data.town_num;
    }
    return obj;
};

//获取排名
var help_gain_rank_by_rank=function(rank,num)
{
    if(rank==undefined)
    {
        return;
    }

    return Math.floor(rank*(1-num*(Math.pow(rank,0.651)/9999+0.01)));
};

//计算用户最高伤害排名
var help_count_hurt_rank=function(role_gid,role_grid,old_hurt,new_hurt)
{
    global.log("help_count_hurt_rank");
    if(role_gid==undefined||role_grid==undefined||old_hurt==undefined||new_hurt==undefined)
    {
        global.log("role_gid==undefined||role_grid==undefined||old_hurt==undefined||new_hurt==undefined");
        return;
    }

    var ret=new Object();
    ret.new_rank=0;
    ret.old_rank=0;
    ret.exceed=0;//超越百分比

    var rank_arr=formation.top_hurt_rank;
    if(old_hurt>=new_hurt)
    {
        //排名不变
        ret.new_rank=ret.old_rank=help_get_hurt_rank(role_grid,old_hurt);

        //计算超越玩家百分比，排名所占百分比
        //ret.exceed=Math.ceil((rank_arr.length-help_get_new_hurt_rank(new_hurt)+1)/rank_arr.length*100);
        return ret;
    }
    else
    {
        //生成新的排名数据结构
        var new_rank_data=new formation.HurtRankData();
        new_rank_data.gid=role_gid;
        new_rank_data.grid=role_grid;
        new_rank_data.hurt=new_hurt;

        //获取玩家旧排名，并删除用户旧排名数据
        ret.old_rank=help_get_hurt_rank(role_grid,old_hurt);
        rank_arr.splice(ret.old_rank-1,1);

        //二分查找 插入用户新伤害排行
        if(rank_arr.length>0)
        {
            var low=0,high=rank_arr.length-1;
            var mid=0;
            while(low<=high)
            {
                mid=Math.floor((low+high)/2);
                if(rank_arr[mid].hurt<new_hurt)
                {
                    high=mid-1;
                }
                else if(rank_arr[mid].hurt>new_hurt)
                {
                    low=mid+1;
                }
                else
                {
                    //伤害一样
                    break;
                }
            }

            global.log("mid:"+mid);
            //mid离伤害最近的位置
            if(new_hurt>rank_arr[mid].hurt)
            {
                rank_arr.splice(mid,0,new_rank_data);
                ret.new_rank=mid+1; //加1表示排序从1开始，不是0
            }
            else if(new_hurt<rank_arr[mid].hurt)
            {
                rank_arr.splice(mid+1,0,new_rank_data);
                ret.new_rank=(mid+1)+1;
            }
            else
            {
                while(mid<=rank_arr.length-1)
                {
                    //最后一名
                    if(mid==rank_arr.length-1)
                    {
                        ret.new_rank=rank_arr.length;
                        break;
                    }
                    else if(new_hurt>rank_arr[mid].hurt)
                    {
                        rank_arr.splice(mid,0,new_rank_data);
                        ret.new_rank=mid+1;
                        break;
                    }
                    mid++;

                }
            }
        }
        else
        {
            //只有一个玩家
            rank_arr.push(new_rank_data);
            ret.new_rank=1;
        }

        //计算超越玩家百分比，排名所占百分比
        ret.exceed=Math.ceil((rank_arr.length-ret.new_rank+1)/rank_arr.length*100);
        if(ret.exceed>=100)
        {
            global.log("ret.exceed:"+ret.exceed);
            global.log("rank_arr.length:"+rank_arr.length);
            global.log("rank_arr:"+JSON.stringify(rank_arr));
            global.log("ret.new_rank:"+ret.new_rank);
            global.err("exceed is error");
            ret.exceed=100;
        }
    }
    return ret;
};
exports.help_count_hurt_rank=help_count_hurt_rank;

//获取用户最高伤害排名 二分查找
var help_get_hurt_rank=function(role_grid,hurt)
{
    global.log("help_get_hurt_rank");

    if(role_grid==undefined||hurt==undefined)
    {
        global.log("role_grid==undefined||hurt==undefined");
        return;
    }

    var rank_arr=formation.top_hurt_rank;

    //用户排名
    var rank;
    if(rank_arr.length<=0)
    {
        return rank=1;
    }
    else
    {
        var low=0,high=rank_arr.length-1;

        while(low<=high)
        {
            var mid=Math.floor((low+high)/2);

            if(rank_arr[mid].hurt<hurt)
            {
                high=mid-1;
            }
            else if(rank_arr[mid].hurt>hurt)
            {
                low=mid+1;
            }
            else
            {
                //排除伤害一样的情况
                if(rank_arr[mid].grid==role_grid)
                {
                    return rank=mid+1; //就是自己(+1表示排名从1开始)
                }
                else
                {
                    var i=0;
                    while(1)
                    {
                        i++;
                        //从相邻的两边查找
                        if(mid+i<rank_arr.length&&rank_arr[mid+i].grid==role_grid)
                        {
                            return rank=mid+i+1;
                        }
                        else if(mid-i>=0&&rank_arr[mid-i].grid==role_grid)
                        {
                            return rank=mid-i+1;
                        }
                        else if(i>rank_arr.length)
                        {
                            return rank=rank_arr.length;
                        }
                    }
                }

            }
        }
    }

};
exports.help_get_hurt_rank=help_get_hurt_rank;

//获取用户本局新伤害排名 二分查找
var help_get_new_hurt_rank=function(new_hurt)
{
    global.log("help_get_new_hurt_rank");
    if(new_hurt==undefined)
    {
        global.log("new_hurt==undefined");
        return;
    }

    var rank;

    global.log("new_hurt:"+new_hurt);
    global.log("arr:"+JSON.stringify(arr));

    var arr=formation.top_hurt_rank;
    if(arr.length<=0)
    {
        rank=1;
        return rank;
    }
    else
    {
        var low=0,high=arr.length-1;
        var mid = 0;

        while(low<=high) {
            mid = Math.floor((low + high) / 2);

            if (arr[mid].hurt < new_hurt) {
                high = mid - 1;
            }
            else if (arr[mid].hurt > new_hurt) {
                low = mid + 1;
            }
            else {
                break;
            }

        }

        //mid离伤害最近的位置
        if(new_hurt>arr[mid].hurt)
        {
            return rank=mid+1; //加1表示排序从1开始，不是0
        }
        else if(new_hurt<arr[mid].hurt)
        {
            return rank=(mid+1)+1;
        }
        else
        {
            while(mid<arr.length-1)
            {
                mid++;
                if(new_hurt>arr[mid].hurt)
                {
                    return rank=mid+1;
                }
            }
        }
    }
};



//玩家如在排行榜前200名，则会每周三和周日22点收到排名奖励
var auto_provide_rank_reward=function()
{
    global.log("auto_provide_rank_reward");
    for(var key in arena_data.rank_time_reward_data_list)
    {
        var rank_time_reward=arena_data.rank_time_reward_data_list[key];
        for(var i=rank_time_reward.rand_low_limit-1;i<=rank_time_reward.rand_high_limit-1;i++)
        {
            var _rank_data=formation.top_hurt_rank[i];
            if(_rank_data)
            {
                mail_logic.help_send_role_rank_mail(_rank_data.gid,_rank_data.grid,rank_time_reward.reward);
            }
        }
    }
};
exports.auto_provide_rank_reward=auto_provide_rank_reward;






