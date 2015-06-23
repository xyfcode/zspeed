var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var GateData=function()
{
    this.gate_id=0;
    this.power_cost=0;
    this.lv_limit=0;
    this.sweep_max=0;
    this.reset_max=0;
    this.first_exp=0;
    this.first_coin=0;
    this.first_drop=[];
    this.common_exp=0;
    this.common_coin=0;
    this.common_drop=[];
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
        gate_data.sweep_max=Number(data["GATE"][i].DaySweepTimes);
        gate_data.reset_max=Number(data["GATE"][i].MaxResetSweep);
        gate_data.first_exp=Number(data["GATE"][i].FirstExp);
        gate_data.first_coin=Number(data["GATE"][i].FirstCoin);
        gate_data.common_exp=Number(data["GATE"][i].CommonExp);
        gate_data.common_coin=Number(data["GATE"][i].CommonCoin);


        if(data["GATE"][i].FirstDrop)
        {
            gate_data.first_drop=(data["GATE"][i].FirstDrop).split(',');
        }

        if(data["GATE"][i].CommonDrop)
        {
            gate_data.common_drop=(data["GATE"][i].CommonDrop).split(',');
        }

        gate_data_list[gate_data.gate_id]=gate_data;
    }

    var log_content={"count":count,"gate_data_list":gate_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_gate_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
