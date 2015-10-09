var json_config_file=require("./master_logic/json_config_file");


//数据
var town_reward_data=require("./master_logic/town_reward_data");

//逻辑
var tick_logic=require("./master_logic/help_tick_logic");


var child_worker;

exports.server = function(worker)
{
    //初始化
    child_worker = worker;
    json_config_file.init();

    //数据
    town_reward_data.init();


    //逻辑
    tick_logic.init(worker);

    //释放对象
    json_config_file.json_config_file_list=null;
};






