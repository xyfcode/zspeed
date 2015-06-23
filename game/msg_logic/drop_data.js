var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var DropData=function()
{
    this.drop_id=0;
    this.probability=0;
    this.is_all=0;
    this.drop_ls=[]; //value Drop_Ls_Data
};

var Drop_Ls_Data=function()
{
    this.type=0; //掉落类别
    this.drop=0;  //掉落ID
    this.num=0;   //掉落数量
    this.probability=0; //掉落概率(权重)
};

var drop_data_list={};
exports.drop_data_list=drop_data_list;

var g_server=null;

function init(s)
{
    g_server=s;
    load_drop_data();
}
exports.init=init;

function load_drop_data()
{
    global.log("load_drop_data");
    var file="drop.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["DROP"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var drop_data=new DropData();

        drop_data.drop_id=data["DROP"][i].DropId;
        drop_data.probability=Number(data["DROP"][i].Probability)*100;
        drop_data.is_all=Number(data["DROP"][i].IsAll);

        var assemble=data["DROP"][i].Assemble;
        var units=assemble.split("|");

        var weight=0;

        for(var j=0;j<units.length;j++)
        {
            var unit=units[j];
            var attributes=unit.split(",");

            var drop_ls_data= new Drop_Ls_Data();
            drop_ls_data.type=Number(attributes[0]);
            drop_ls_data.drop=attributes[1];
            drop_ls_data.num=Number(attributes[2]);
            weight+=Number(attributes[3]);
            drop_ls_data.probability=weight;
            drop_data.drop_ls.push(drop_ls_data);

        }

        if(weight!=10000)
        {
            global.err("drop weight!=10000,i:"+i);
            return;
        }

        drop_data_list[drop_data.drop_id]=drop_data;
    }

    var log_content={"count":count,"drop_data_list":drop_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_drop_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
