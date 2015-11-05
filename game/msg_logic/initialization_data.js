var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var InitData=function()
{
    this.level = 0;
    this.gold = 0;
    this.rmb = 0;
    this.score = 0;   //人气
    this.init_card=[];
    this.init_beauty=0;
};
var initialization_data = new InitData();
exports.initialization_data = initialization_data;


function init()
{
    load_initialization_data();
}
exports.init=init;

function load_initialization_data()
{
    global.log("load_initialization_data");
    var file="initialization.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["INITIALIZATION"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        initialization_data.level = Number(data["INITIALIZATION"][i].Level);
        initialization_data.gold = Number(data["INITIALIZATION"][i].Gold);
        initialization_data.rmb = Number(data["INITIALIZATION"][i].Rmb);
        initialization_data.score = Number(data["INITIALIZATION"][i].Score);
        if(data["INITIALIZATION"][i].Card1)
        {
            initialization_data.init_card.push(data["INITIALIZATION"][i].Card1);
        }
        if(data["INITIALIZATION"][i].Card2)
        {
            initialization_data.init_card.push(data["INITIALIZATION"][i].Card2);
        }
        if(data["INITIALIZATION"][i].Card3)
        {
            initialization_data.init_card.push(data["INITIALIZATION"][i].Card3);
        }

        if(data["INITIALIZATION"][i].Beauty)
        {
            initialization_data.init_beauty=data["INITIALIZATION"][i].Beauty;
        }

    }

    var log_content={"count":count,"initialization_data":initialization_data};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_initialization_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

