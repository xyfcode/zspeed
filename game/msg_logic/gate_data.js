var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var GateData=function()
{
    this.gate_id=0;
    this.power_cost=0;
    this.lv_limit=0;
    this.exp=0;
    this.war=[];
};

var gate_data_list={};
exports.gate_data_list=gate_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_gate_data();
}
exports.init=init;

function load_gate_data()
{
    global.log("load_gate_data");
    var file="gate.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["GATE"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var gate_data=new GateData();

        gate_data.gate_id=data["GATE"][i].GateId;
        gate_data.power_cost=Number(data["GATE"][i].PowerCost);
        gate_data.lv_limit=Number(data["GATE"][i].LvLimited);
        gate_data.exp=Number(data["GATE"][i].WarriorExp);
        gate_data.war=(data["GATE"][i].War).split(",");

        gate_data_list[gate_data.gate_id]=gate_data;
    }

    var log_content={"count":count,"gate_data_list":gate_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_gate_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
