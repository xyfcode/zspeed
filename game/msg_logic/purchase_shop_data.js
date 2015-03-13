var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var g_server=null;

//充值商城数据结构
var PurchaseShopData=function()
{
    this.goods_id=0; //商品id
    this.pft_type=0;  //平台类型
    this.goods_price=0; //商品现价
    this.goods_rmb=0; //商品人民币获得
    this.first_reward=0; //首冲返利
    this.common_reward=0; //充值返利
    this.is_cd=0; //是否是月卡
    this.cd_reward=0; //月卡返利

};
exports.PurchaseShopData=PurchaseShopData;

function init(s)
{
    g_server=s;
    load_purchase_shop_data();

}
exports.init=init;

//全局变量存放充值商店的数据
var purchase_shop_data_list={}; //key:grid,value: PurchaseShopData
exports.purchase_shop_data_list=purchase_shop_data_list;

function load_purchase_shop_data()
{
    global.log("load_purchase_shop_data");
    var file="purchase_shop.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["PURCHASE_SHOP"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var purchase_shop_data=new PurchaseShopData();

        purchase_shop_data.goods_id=data["PURCHASE_SHOP"][i].GoodsId;
        purchase_shop_data.pft_type=Number(data["PURCHASE_SHOP"][i].PftType);
        purchase_shop_data.goods_price=Number(data["PURCHASE_SHOP"][i].Price);
        purchase_shop_data.goods_rmb=Number(data["PURCHASE_SHOP"][i].GoodsRmb);
        purchase_shop_data.first_reward=Number(data["PURCHASE_SHOP"][i].FirstReward);
        purchase_shop_data.common_reward=Number(data["PURCHASE_SHOP"][i].CommonReward);
        purchase_shop_data.is_cd=Number(data["PURCHASE_SHOP"][i].IsCD);
        purchase_shop_data.cd_reward=Number(data["PURCHASE_SHOP"][i].CDReward);

        purchase_shop_data_list[purchase_shop_data.goods_id]=purchase_shop_data;
    }

    var log_content={"count":count,"purchase_shop_data_list":purchase_shop_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_purchase_shop_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}


