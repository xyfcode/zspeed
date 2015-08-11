var json_config_file=require("./json_config_file");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var common_func=require("./common_func");
var key_words = require("./key_words_data");
var make_db=require("./make_db");


var PlayNameData=function()
{
    this.name=0;
    this.used=0;
};
exports.PlayNameData=PlayNameData;

var play_first_name=[];
exports.play_first_name=play_first_name;

var play_last_name=[];
exports.play_last_name=play_last_name;


var play_name_arr=[]; //可用名字库数组，value：PlayNameData
exports.play_name_arr=play_name_arr;

var play_last_name_data=function()
{
    this.last_name=0;
};
exports.play_last_name_data=play_last_name_data;

var g_server=null;

function init(s)
{
    g_server=s;
    load_play_first_name_data();
    load_play_last_name_data();
    make_random_play_name();
}
exports.init=init;

function load_play_first_name_data()
{
    global.log("load_play_first_name_data");
    var file="play_first_name.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["PLAY_FIRST_NAME"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        play_first_name.push(data["PLAY_FIRST_NAME"][i].FirstName);
    }

    var log_content={"count":count,"play_first_name":play_first_name};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_play_first_name_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

function load_play_last_name_data()
{
    global.log("load_play_last_name_data");
    var file="play_last_name.json";
    var data=json_config_file.json_config_file_list[file];

    var ks=Object.keys(data["PLAY_LAST_NAME"]);
    var count=ks.length;

    for(var i=1 ; i<=count ; i++)
    {
        var last_name_data=new play_last_name_data();
        last_name_data.last_name=data["PLAY_LAST_NAME"][i].LastName;
        play_last_name.push(last_name_data);
    }

    var log_content={"count":count,"play_last_name":play_last_name};
    var logData=log_data_logic.help_create_log_data("sys","sys","sys","sys","sys","load_play_last_name_data",log_content,log_data.logType.LOG_CONFIG);
    log_data_logic.log(logData);

}

function make_random_play_name()
{
    global.log("make_random_play_name");

    g_server.db.getCount("t_rand_name_list",{},function(count){
        global.log("rand name total count is :"+count);
        if(count==0)
        {
            global.log("make_random_play_name start");
            for(var i in play_first_name)
            {
                for(var j in play_last_name)
                {
                    var insert_name=function(x,y)
                    {
                        var play_name=new PlayNameData();
                        play_name.name=play_first_name[x]+play_last_name[y].last_name;
                        play_name.used=0;
                        play_name_arr.push(play_name.name);
                        make_db.insert_play_rand_name(play_name);
                    };
                    insert_name(i,j);
                }
            }
        }
        else
        {
            g_server.db.find("t_rand_name_list",{"used":0},{},function(arr){
                if(arr.length==0){
                    global.log("used rand name is over!");
                }
                else
                {

                    if(arr.length>3000)
                    {
                        var nums=common_func.help_make_random(3000,0,arr.length);

                        for(var i=0;i<nums.length;i++)
                        {
                            play_name_arr.push(arr[nums[i]].name);
                        }
                    }
                    else
                    {
                        for(var i=0;i<arr.length;i++)
                        {
                            play_name_arr.push(arr[i].name);
                        }
                    }

                }
            });
        }
    });

    g_server.db.getCount("t_rand_name_list",{"used":0},function(count){
        global.log("unused rand name count is :"+count);
    });
}


function getUnUsedName()
{
    if(play_name_arr.length<100)
    {
        global.log("load unused random name!");
        g_server.db.find("t_rand_name_list",{"used":0},{},function(arr){
            if(arr.length==0){
                global.log("used rand name is over!");
            }
            else
            {
                if(arr.length>3000)
                {
                    var nums=common_func.help_make_random(3000,0,arr.length-1);

                    for(var i=0;i<nums.length;i++)
                    {
                        play_name_arr.push(arr[nums[i]].name);
                    }
                }
                else
                {
                    for(var i=0;i<arr.length;i++)
                    {
                        play_name_arr.push(arr[i].name);
                    }
                }

            }
        });
    }

    var rand_name;
    while(play_name_arr.length)
    {
        var r=common_func.help_make_one_random(0,play_name_arr.length-1);
        rand_name = play_name_arr[r];
        play_name_arr.splice(r,1);
        if(key_words.reg.test(rand_name))
        {
            global.log("error name:"+rand_name);
            continue;
        }
        return rand_name;
    }
}
exports.getUnUsedName=getUnUsedName;












