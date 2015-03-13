/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-7-10
 * Time: 下午4:46
 * To change this template use File | Settings | File Templates.
 */
var json_config_file = require("./json_config_file");
var log_data = require("./log_data");
var log_data_logic = require("./help_log_data_logic");

function RecruitData()
{
    this.recruit_id = 0;
    this.cost_type = 0;
    this.cost_num = 0;
    this.free_times=0;//免费次数
    this.first_free_minute = 0;
    this.free_minute = 0;
    this.first_coll_arr=0;//首抽集合
    this.low_coll_arr = 0;//低级集合
    this.mid_coll_arr = 0;//中级集合
    this.mid_add = 0;//中级增长
    this.mid_add_limit = 0;//中级集合增长限制
    this.hig_coll_arr = 0;//高级集合
    this.hig_add = 0;//高级增长
    this.hig_add_limit = 0;//高级集合增长限制
}
exports.RecruitData = RecruitData;


var recruit_data_list = {};
exports.recruit_data_list = recruit_data_list;


var g_server=null;

function init(s)
{
    g_server=s;
    load_recruit_data();

}
exports.init=init;

function load_recruit_data()
{
    global.log("load_recruit_data");
    var file="recruit.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["RECRUIT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var recruit_data = new RecruitData();
        recruit_data.recruit_id = data["RECRUIT"][i].RecruitId;
        recruit_data.cost_type = Number(data["RECRUIT"][i].CostType);
        recruit_data.cost_num = Number(data["RECRUIT"][i].CostNum);
        recruit_data.free_times = Number(data["RECRUIT"][i].FreeTimes);
        recruit_data.first_free_minute = Number(data["RECRUIT"][i].FirstFreeMinute);
        recruit_data.free_minute = Number(data["RECRUIT"][i].FreeMinute);
        recruit_data.first_coll_arr = (data["RECRUIT"][i].FirstColl).split("|");
        recruit_data.low_coll_arr = (data["RECRUIT"][i].LowColl).split("|");
        recruit_data.mid_coll_arr = (data["RECRUIT"][i].MidColl).split("|");
        recruit_data.mid_add = Number(data["RECRUIT"][i].MidAdd);
        recruit_data.mid_add_limit = Number(data["RECRUIT"][i].MidAddLimit);
        recruit_data.hig_coll_arr = (data["RECRUIT"][i].HigColl).split("|");
        recruit_data.hig_add = Number(data["RECRUIT"][i].HigAdd);
        recruit_data.hig_add_limit = Number(data["RECRUIT"][i].HigAddLimit);
        recruit_data_list[recruit_data.recruit_id] = recruit_data;
    }

    var log_content={"count":count,"recruit_data_list":recruit_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_recruit_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);
}

