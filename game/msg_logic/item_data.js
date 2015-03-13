    var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

//道具--装备
var ItemData=function()
{
    this.item_id=0;
    this.type=0;
    this.star=0;
    this.drop_id=0;
    this.box_id=0;
    this.key_id=0;
    this.power_num=0;
    this.equip_id=0; //碎片合成目标装备ID
    this.num=0; //装备碎片合成需求数量
    this.unit=[];
    this.unit_num=[];
    this.s_price=0;
    this.price=0;
};

var item_data_list={};
exports.item_data_list=item_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_item_data();
}
exports.init=init;



function load_item_data()
{
    global.log("load_item_data");
    var file="item.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["ITEM"]);
    var count=ks.length;
    //实现完全拷贝
    for(var i=1 ; i<=count ; i++)
    {
        var item_data=new ItemData();

        item_data.item_id= data["ITEM"][i].Id;
        item_data.type= Number(data["ITEM"][i].Type);
        item_data.star=Number(data["ITEM"][i].Star);
        item_data.drop_id=data["ITEM"][i].DropId;
        item_data.box_id=data["ITEM"][i].BoxId;
        item_data.key_id=data["ITEM"][i].KeyId;
        item_data.power_num=Number(data["ITEM"][i].PowerNum);
        item_data.equip_id=data["ITEM"][i].EquipId;
        item_data.num=data["ITEM"][i].Num;
        if(data["ITEM"][i].Unit)
        {
            item_data.unit=(data["ITEM"][i].Unit).split(',');
            item_data.unit_num=(data["ITEM"][i].UnitNum).split(',');
        }
        item_data.s_price=Number(data["ITEM"][i].SPrice);
        item_data.price=Number(data["ITEM"][i].Price);
        item_data_list[item_data.item_id]=item_data;
    }

    var log_content={"count":count,"item_data_list":item_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_item_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}




