var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var RobotData=function()
{
    this.id=0;
    this.level=0;
    this.name=0;
    this.card_one=0;
    this.card_two=0;
    this.card_three=0;

};

var robot_data_list={};
exports.robot_data_list=robot_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_robot_data();
}
exports.init=init;

function load_robot_data()
{
    global.log("load_robot_data");
    var file="robot.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["ROBOT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var robot_data=new RobotData();

        robot_data.id=data["ROBOT"][i].Id;
        robot_data.name=data["ROBOT"][i].Name;
        robot_data.level=Number(data["ROBOT"][i].Level);
        robot_data.card_one=data["ROBOT"][i].CardOne;
        robot_data.card_two=data["ROBOT"][i].CardTwo;
        robot_data.card_three=data["ROBOT"][i].CardThree;

        robot_data_list[robot_data.id]=robot_data;
    }

    var log_content={"count":count,"robot_data_list":robot_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_robot_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
