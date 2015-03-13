var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


function ServerConfigData()
{
    /*配置表属性*/
    this.id = 0;    //配置表ID
    this.server_id = 0; //服务器ID
    this.name = "";      //服务器名字
    this.ip = "";     //服务器IP地址
    this.port = 0;     //服务器端口号
    this.is_open = 0;     //是否开放
    this.is_new = 0 ;   //是否是新服务器
    this.is_test = 0 ;   //是否是测试服务器
    this.max_online = 0; //最大在线人数
    this.max_register = 0; //最大注册人数
    this.pft = 0;   //平台号
    this.district_id = 0;//所在区域ID
    /*配置表属性*/


    /*程序自定义属性*/

    this.online_count=0; //当前在线人数
    this.socket = 0; //socket 连接
    this.online = 0; //是否在线 0:不在线，1：在线
    this.state = -1; //服务器状态（爆满，繁忙，空闲）

    /*程序自定义属性*/

}
exports.ServerConfigData = ServerConfigData;

var server_config_data_list = [];
exports.server_config_data_list = server_config_data_list;

var g_server = null;
exports.init = function(s)
{
    g_server = s;
    load_server_config_data();
};

function load_server_config_data()
{
    var file = "server_config.json";
    var data = json_config_file.json_config_file_list[file];
    var ks = Object.keys(data["SERVERCONFIG"]);
    var count = ks.length;

    global.log("-----------------------------");
    global.log("server count : " + count);

    for(var i = 1;i<=count;i++)
    {
        var config_data = new ServerConfigData();
        config_data.id = Number(data["SERVERCONFIG"][i].ID);
        config_data.name = data["SERVERCONFIG"][i].NAME;
        config_data.ip = data["SERVERCONFIG"][i].IP;
        config_data.port = Number(data["SERVERCONFIG"][i].PORT);
        config_data.is_open = Number(data["SERVERCONFIG"][i].IS_OPEN);
        config_data.is_new = Number(data["SERVERCONFIG"][i].IS_NEW);
        config_data.is_test = Number(data["SERVERCONFIG"][i].IS_TEST);
        config_data.max_online = Number(data["SERVERCONFIG"][i].MAX_ONLINE);
        config_data.max_register = Number(data["SERVERCONFIG"][i].MAX_REGISTER);
        config_data.pft = Number(data["SERVERCONFIG"][i].PFT);
        config_data.district_id = Number(data["SERVERCONFIG"][i].DISTRICT_ID);
        config_data.server_id = get_gs_unique_id(config_data.pft,config_data.district_id,config_data.id);

        server_config_data_list.push(config_data);
    }

    var log_content={"count":count,"server_config_data_list":server_config_data_list};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_server_config_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);
}
exports.load_server_config_data = load_server_config_data;

var get_gs_unique_id = function(pft,district,id)
{
    global.log("get_gs_unique_id");
    if(pft==undefined || district ==undefined || id==undefined)
    {
        global.log("pft==undefined || district ==undefined || id==undefined");
        return;
    }

    var t1 = pft,t2=district,t3=id;
    if(t2 <10 && t2 >0)
    {
        t2 ="0" + t2;
    }
    if(t3 < 100 && t3 >=10)
    {
        t3 = "0" + t3;
    }
    else if(t3<10 && t3>0)
    {
        t3 = "00" + t3;
    }
    return t1 + "" + t2 + "" + t3;
};