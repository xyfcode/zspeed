var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var make_db=require("./make_db");
var fs=require("fs");

var PPCodeData=function()
{
    this.code=0;
    this.used=0;
    this.pft=0;
};
var g_server=null;

function init(s)
{
    g_server=s;
    insert_pp_code_data();
}
exports.init=init;

//pp兑换码
function insert_pp_code_data()
{
    global.log("insert_pp_code_data");
    var ret=g_server.db.find("t_code_list",{},{},function(arr){
          if(arr.length==0){
              var ppCodes=fs.readFileSync("./data/pp_code.txt",'utf8');
              var code_arr=ppCodes.split("|");

              for(var i=0;i<code_arr.length;i++)
              {
                  var code=code_arr[i];
                  var pp_code=new PPCodeData();
                  pp_code.code=code;
                  pp_code.used=0;
                  pp_code.pft=1;
                  make_db.insert_code_data(pp_code);
              }
          }
        else{
              global.log("pp code data is exist");
          }
    });
}








