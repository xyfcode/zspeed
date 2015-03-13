var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var WarData=function()
{
    this.war_id=0;
    this.boss=[];
    this.first_exp=[];
    this.first_coin=[];
    this.first_drop=[];
    this.common_exp=[];
    this.common_coin=[];
    this.common_drop=[];
};

var war_data_list={};
exports.war_data_list=war_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_war_data();
}
exports.init=init;

function load_war_data()
{
    global.log("load_war_data");
    var file="war.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["WAR"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var war_data=new WarData();

        war_data.war_id=data["WAR"][i].WarId;
        war_data.boss=(data["WAR"][i].Boss).split(',');
        if(data["WAR"][i].FirstExp)
        {
            war_data.first_exp=(data["WAR"][i].FirstExp).split(',');
        }
        if(data["WAR"][i].FirstCoin)
        {
            war_data.first_coin=(data["WAR"][i].FirstCoin).split(',');
        }
        if(data["WAR"][i].FirstDrop)
        {
            war_data.first_drop=(data["WAR"][i].FirstDrop).split(',');
        }
        if(data["WAR"][i].CommonExp)
        {
            war_data.common_exp=(data["WAR"][i].CommonExp).split(',');
        }
        if(data["WAR"][i].CommonCoin)
        {
            war_data.common_coin=(data["WAR"][i].CommonCoin).split(',');
        }
        if(data["WAR"][i].CommonDrop)
        {
            war_data.common_drop=(data["WAR"][i].CommonDrop).split(',');
        }
        war_data_list[war_data.war_id]=war_data;
    }

    var log_content={"count":count,"war_data_list":war_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_war_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
