var fs=require("fs");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");

var file_path="./master_data/";
exports.file_path=file_path;

var json_config_file_list={};
exports.json_config_file_list=json_config_file_list;

function init()
{
    load_data_file();
}
exports.init=init;

function load_data_file()
{
    global.log("load_data_file");
    var path="./master_data/";

    var nodes=fs.readdirSync(path);
    global.log("nodes:"+nodes.toString()) ;
    if(nodes)
    {
        for(var i=0;i<nodes.length;i++)
        {
            var file=path+nodes[i];
            global.log("load file begin:"+file) ;
            if(nodes[i].lastIndexOf(".json")<=0)
            {
                global.log("is invalid file:"+file) ;
                continue;
            }

            if(!fs.existsSync(file))
            {
                global.log("is not exist file:"+file);
                continue;
            }
            else
            {
                var str=fs.readFileSync(file,'utf8');
                if(str)
                {
                    var sub_data=str.toString();
                    var data=JSON.parse(sub_data);
                    json_config_file_list[nodes[i]]=data;

                }
            }
            global.log("load file end:"+file) ;

        }

        var log_content={"nodes":nodes};
        var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_data_file",log_content,log_data.logType.LOG_CONFIG);
        log_data_logic.log(logData);


    }
}
