var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var CardFragData=function()
{
    this.card_id=0;
    this.num=0;
    this.price=0;
};

var card_frag_data_list={};
exports.card_frag_data_list=card_frag_data_list;


function init()
{
    load_card_frag_data();
}
exports.init=init;

function load_card_frag_data()
{
    global.log("load_card_frag_data");
    var file="card_fragment.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["CARD_FRAGMENT"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var card_frag_data=new CardFragData();

        card_frag_data.card_id=data["CARD_FRAGMENT"][i].CardId;
        card_frag_data.num=Number(data["CARD_FRAGMENT"][i].Num);
        card_frag_data.price=Number(data["CARD_FRAGMENT"][i].Price);

        card_frag_data_list[card_frag_data.card_id]=card_frag_data;
    }

    var log_content={"count":count,"card_frag_data_list":card_frag_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_card_frag_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
