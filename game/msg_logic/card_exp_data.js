var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var CardExpData=function()
{
    this.level=0;
    this.exp_limit=0;
};

var card_exp_data_list={};
exports.card_exp_data_list=card_exp_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_card_exp_data();
}
exports.init=init;

function load_card_exp_data()
{
    global.log("load_card_exp_data");
    var file="card_exp.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["CARD_EXP"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var card_exp_data=new CardExpData();

        card_exp_data.level=data["CARD_EXP"][i].Level;
        card_exp_data.exp_limit=Number(data["CARD_EXP"][i].ExpLimit);

        card_exp_data_list[card_exp_data.level]=card_exp_data;
    }

    var log_content={"count":count,"card_exp_data_list":card_exp_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_card_exp_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
