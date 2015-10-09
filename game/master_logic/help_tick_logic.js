/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-3
 * Time: 下午9:36
 * To change this template use File | Settings | File Templates.
 */
var town_reward_data=require("./town_reward_data");


var common_func=require("./common_func");

var child_worker = null;

var init=function(worker)
{
    child_worker=worker;
    //启动定时器
    helpSetGlobalTick();
    //测试 可删去
    //helpGetTownReward(17);
};
exports.init=init;

function helpSetGlobalTick()
{
    global.log("helpSetGlobalTick");

    setInterval(function(){
        var now=new Date();

        if(now.getHours()==5&&now.getMinutes()==30&&now.getSeconds()==0)
        {
            var msg={
                "op":"town_tick",
                "town_reward":helpGetTownReward(now.getHours())
            };

            child_worker.send(msg);
        }
        else if(now.getHours()==11&&now.getMinutes()==30&&now.getSeconds()==0)
        {

            var msg={
                "op":"town_tick",
                "town_reward":helpGetTownReward(now.getHours())
            };
            child_worker.send(msg);
        }
        else if(now.getHours()==17&&now.getMinutes()==30&&now.getSeconds()==0)
        {

            var msg={
                "op":"town_tick",
                "town_reward":helpGetTownReward(now.getHours())
            };
            child_worker.send(msg);
        }
        else if(now.getHours()==23&&now.getMinutes()==30&&now.getSeconds()==0)
        {

            var msg={
                "op":"town_tick",
                "town_reward":helpGetTownReward(now.getHours())
            };
            child_worker.send(msg);
        }
        else if(now.getHours()==0&&now.getMinutes()==0&&now.getSeconds()==0)
        {
            var msg={
                "op":"tick",
                "param":now.getHours()
            };
            //child_worker.send(msg);
        }
        else if(now.getHours()==22&&now.getMinutes()==0&&now.getSeconds()==0)
        {
            var msg={
                "op":"tick",
                "param":now.getHours()
            };
            //child_worker.send(msg);
        }

    },1000);

    setInterval(function(){
        var msg={
            "op":"tick_user_offline"
        };
        child_worker.send(msg);
    },16*60*1000);

    setInterval(function(){
        var msg={
            "op":"save_system_data"
        };
        child_worker.send(msg);
    },10*60*1000);

    setInterval(function(){
        var msg={
            "op":"get_system_info"
        };
        child_worker.send(msg);
    },27*60*1000);

}


function helpGetTownReward(hour)
{
    global.log("helpGetTownReward");

    var _town_reward_data=town_reward_data.town_reward_data_list[1];
    if(_town_reward_data==undefined)
    {
        global.log("_town_reward_data==undefined");
        return;
    }




    var town_ids=["t01","t02","t03","t04","t05","t06","t07","t08","t09","t10","t11","t12"
        ,"t13","t14","t15","t16","t17","t18","t19","t20","t21","t22","t23","t24","t25","t26"
        ,"t27","t28","t29","t30","t31","t32","t33","t34","t35","t36","t37","t38"];

    var total_reward=0;
    switch (hour)
    {
        case 5:
            total_reward=_town_reward_data.total_reward*_town_reward_data.reward_two;
            break;
        case 11:
            total_reward=_town_reward_data.total_reward*_town_reward_data.reward_three;
            break;
        case 17:
            total_reward=_town_reward_data.total_reward*_town_reward_data.reward_four;
            break;
        case 23:
            total_reward=_town_reward_data.total_reward*_town_reward_data.reward_one;
            break;
    }
    var lucky_num=common_func.help_make_one_random(1,38);
    global.log("total_reward:"+total_reward);
    global.log("lucky_num:"+lucky_num);

    var lucky_reward_base=_town_reward_data.lucky_base+_town_reward_data.lucky_float*common_func.help_make_one_random(1,10)/10;
    var lucky_reward=Math.floor(total_reward*lucky_reward_base);
    global.log("lucky_reward:"+lucky_reward);

    var lucky_nums=common_func.help_make_random(37,1,100);
    global.log("lucky_nums:"+lucky_nums);

    lucky_nums=common_func.compare_sort_asc(lucky_nums);
    var total_base=0;
    for(var i=0;i<lucky_nums.length;i++)
    {
        total_base+=lucky_nums[i];
    }
    lucky_nums.splice(lucky_num,0,0);


    var left_reward=total_reward-lucky_reward;
    var reward_obj={};

    for(var i=38;i>=1;i--)
    {
        if(i==lucky_num)
        {
            reward_obj[town_ids[lucky_num-1]]=lucky_reward;
            continue;
        }

        var reward=Math.floor(left_reward*lucky_nums[i-1]/total_base);
        reward_obj[town_ids[i-1]]=reward;

    }

    global.log("reward_obj:"+JSON.stringify(reward_obj));

    return reward_obj;
}



