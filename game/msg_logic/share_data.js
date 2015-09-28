//facebook分享获取元宝表
var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var ShareData=function()
{
    this.id=0;
    this.rmb=0;
};

var share_data_list={};
exports.share_data_list=share_data_list;

function init()
{
    load_share_data();
}
exports.init=init;

function load_share_data()
{
    global.log("load_share_data");
    var file="share.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["SHARE"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var share_data=new ShareData();

        share_data.id=data["SHARE"][i].Id;
        share_data.rmb=Number(data["SHARE"][i].Rmb);

        share_data_list[share_data.id]=share_data;
    }

    var log_content={"count":count,"share_data_list":share_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_share_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
