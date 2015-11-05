var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var card_pool_data_list={}; //key star value [card_id]
exports.card_pool_data_list=card_pool_data_list;

var beauty_pool_data_list={}; //key star value [card_id]
exports.beauty_pool_data_list=beauty_pool_data_list;


function init()
{
    load_card_pool_data();
    load_beauty_pool_data();
}
exports.init=init;

function load_card_pool_data()
{
    global.log("load_card_pool_data");
    var file="card_pool.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["CARD_POOL"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var star=data["CARD_POOL"][i].Star;
        if(!card_pool_data_list[star])
        {
            card_pool_data_list[star]=[];
        }

        card_pool_data_list[star].push(data["CARD_POOL"][i].CardId);
    }

    var log_content={"count":count,"card_pool_data_list":card_pool_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_card_pool_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

function load_beauty_pool_data()
{
    global.log("load_beauty_pool_data");
    var file="beauty_pool.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["BEAUTY_POOL"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var star=data["BEAUTY_POOL"][i].Star;
        if(!beauty_pool_data_list[star])
        {
            beauty_pool_data_list[star]=[];
        }

        beauty_pool_data_list[star].push(data["BEAUTY_POOL"][i].BeautyId);
    }

    var log_content={"count":count,"beauty_pool_data_list":beauty_pool_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_beauty_pool_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
