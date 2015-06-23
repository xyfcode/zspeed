var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var ShopData=function()
{
    this.id=0;
    this.type=0;
    this.vip=0;
    this.item_id=0;
    this.num=0;
    this.cost=0;
    this.times_limited=0;
};

var shop_data_list={};
exports.shop_data_list=shop_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_shop_data();
}
exports.init=init;

function load_shop_data()
{
    global.log("load_shop_data");
    var file="shop.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["SHOP"]);
    var count=ks.length;
    for(var i=1 ; i<=count ; i++)
    {
        var shop_data=new ShopData();

        shop_data.id=data["SHOP"][i].Id;
        shop_data.type=Number(data["SHOP"][i].Type);
        if(data["SHOP"][i].Vip)
        {
            shop_data.vip=Number(data["SHOP"][i].Vip);
        }
        shop_data.item_id=data["SHOP"][i].ItemId;
        shop_data.num=Number(data["SHOP"][i].Num);
        if(shop_data.id=="dumpling")
        {
            shop_data.cost=(data["SHOP"][i].Cost).split(',');
            shop_data.times_limited=(data["SHOP"][i].TimesLimited).split(',');
        }
        else
        {
            shop_data.cost=Number(data["SHOP"][i].Cost);
            shop_data.times_limited=Number(data["SHOP"][i].TimesLimited);
        }


        shop_data_list[shop_data.id]=shop_data;
    }

    var log_content={"count":count,"shop_data_list":shop_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_shop_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
