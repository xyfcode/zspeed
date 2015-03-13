var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


var ExploreData=function()
{
    this.explore_id=0;
    this.min_level=0;
    this.max_level=0;
    this.probability=0;
    this.assemble=[];
    this.default_event=0;

};

var explore_data_list={};
exports.explore_data_list=explore_data_list;

var Assemble_Data=function()
{
    this.event_id=0; //事件ID
    this.probability=0; //概率(权重)
};


var g_server=null;

function init(s)
{
    g_server=s;
    load_explore_data();
}
exports.init=init;

function load_explore_data()
{
    global.log("load_explore_data");
    var file="explore.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["EXPLORE"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var explore_data=new ExploreData();

        explore_data.explore_id=data["EXPLORE"][i].ExploreId;
        explore_data.min_level=Number(data["EXPLORE"][i].MinLevel);
        explore_data.max_level=Number(data["EXPLORE"][i].MaxLevel);
        explore_data.probability=Number(data["EXPLORE"][i].Probability);
        explore_data.default_event=Number(data["EXPLORE"][i].DefaultEvent);

        var assemble=data["EXPLORE"][i].Assemble;
        var units=assemble.split("|");
        var weight=0;

        for(var j=0;j<units.length;j++)
        {
            var unit=units[j];
            var attributes=unit.split(",");

            var assemble_data= new Assemble_Data();
            assemble_data.event_id=Number(attributes[0]);
            weight+=Number(attributes[1]);
            assemble_data.probability=weight;
            explore_data.assemble.push(assemble_data);

        }
        if(weight!=10000)
        {
            global.err("explore weight!=10000,i:"+i);
            return;
        }
        explore_data_list[explore_data.explore_id]=explore_data;
    }

    var log_content={"count":count,"explore_data_list":explore_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_explore_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}
