var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var GiftData=function()
{
    this.id=0;
    this.pft=0;
    this.des=0;
    this.drop=0;
};

var gift_data_list={};
exports.gift_data_list=gift_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_gift_data();
}
exports.init=init;

function load_gift_data()
{
    global.log("load_gift_data");
    var file="gift.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["GIFT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var gift_data=new GiftData();

        gift_data.id=data["GIFT"][i].Id;
        gift_data.des=data["GIFT"][i].Des;
        gift_data.pft=Number(data["GIFT"][i].Pft);
        gift_data.drop=Number(data["GIFT"][i].Drop);


        gift_data_list[gift_data.id]=gift_data;
    }

    var log_content={"count":count,"gift_data_list":gift_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_gift_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
