var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var SkillData=function()
{
    this.skill_id=0;
    this.resource=0;
    this.percent=0;
}

var skill_data_list={};
exports.skill_data_list=skill_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_skill_data();
}
exports.init=init;

function load_skill_data()
{
    global.log("load_skill_data");
    var file="skill.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["SKILL"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var skill_data=new SkillData();
        if(data["SKILL"][i].Resource)
        {
            skill_data.skill_id=data["SKILL"][i].SkillId;
            skill_data.resource=data["SKILL"][i].Resource;
            skill_data.percent=Number(data["SKILL"][i].Percent);
            skill_data_list[skill_data.skill_id]=skill_data;
        }

    }

    var log_content={"count":count,"skill_data_list":skill_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_skill_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
