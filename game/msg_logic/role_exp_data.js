var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var RoleExpData=function()
{
    this.level=0;
    this.exp_limit=0;
};

var role_exp_data_list={};
exports.role_exp_data_list=role_exp_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_role_exp_data();
}
exports.init=init;

function load_role_exp_data()
{
    global.log("load_role_exp_data");
    var file="role_exp.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["ROLE_EXP"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var role_exp_data=new RoleExpData();

        role_exp_data.level=data["ROLE_EXP"][i].Level;
        role_exp_data.exp_limit=Number(data["ROLE_EXP"][i].ExpLimit);

        role_exp_data_list[role_exp_data.level]=role_exp_data;
    }

    var log_content={"count":count,"role_exp_data_list":role_exp_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_role_exp_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
