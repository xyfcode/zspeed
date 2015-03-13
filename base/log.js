var fs=require("fs");
var path="./log";
var util = require("util");
var is_test=null;

var log_path,new_log_path;
var log_file_name,err_file_name,log2_file={},log_stream={};
var log_total= 0,err_total=0;
var log_lock= 0,err_lock=0;

exports.init=function(test){
    is_test= test;


    if(is_test==0)
    {
        if(!fs.existsSync(path))
        {
            fs.mkdirSync(path,0755);
        }

        var now = new Date();
        var str = util.format("/%d-%d",now.getFullYear(),now.getMonth()+1);
        log_path=path+str;
        if(!fs.existsSync(log_path))
        {
            fs.mkdirSync(log_path,0755);
        }
        log_file_name = util.format("/log%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
        err_file_name = util.format("/err%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
        create_stream(log_path+log_file_name);
        create_stream(log_path+err_file_name);
    }

};




function log2_struct()
{
    this.path='';
    this.len=0;
    this.type='';
    this.lock=0;
};

function check_log()
{
    if(log_total >= 100*1024*1024 && !log_lock)
    {
        log_lock=1;
        var now = new Date();
        var str = util.format("/%d-%d",now.getFullYear(),now.getMonth()+1);
        new_log_path=path+str;

        fs.exists(new_log_path,function(ok){
            if(ok)
            {
                log_lock=0;
                var del_type=log_path+log_file_name;
                if(log_stream[del_type])
                {
                    log_stream[del_type].end("this is the end");
                    log_stream[del_type].on('finish',function(){
                        delete log_stream[del_type];
                    });
                }
                log_file_name = util.format("/log%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                create_stream(log_path+log_file_name);
                log_total = 0;

            }
            else
            {
                fs.mkdir(new_log_path,0755,function(){
                    log_lock=0;

                    for(var key in log_stream)
                    {
                        if(log_stream[key])
                        {
                            log_stream[key].end("this is the end");
                            log_stream[key].on('finish',function(){

                                delete log_stream[key];
                            });
                        }
                    }

                    //创建完毕，指向新地址
                    log_path=new_log_path;
                    //log
                    log_file_name = util.format("/log%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+log_file_name);
                    log_total = 0;
                    //err
                    err_file_name = util.format("/err%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+err_file_name);
                    err_total = 0;
                    //log2
                    for(var key in log2_file)
                    {
                        if(log2_file[key])
                        {
                            log2_file[key] = new log2_struct();
                            log2_file[key].type=key;
                            log2_file[key].path=util.format("/%s%d-%d:%d",key,now.getDate(),now.getHours(),now.getMinutes());
                            create_stream(log_path+log2_file[key].path);
                        }
                    }
                });
            }
        });


    }
};

function check_err()
{
    if(err_total >= 100*1024*1024 && !err_lock)
    {
        err_lock=1;
        var now = new Date();
        var str = util.format("/%d-%d",now.getFullYear(),now.getMonth()+1);
        new_log_path=path+str;

        fs.exists(new_log_path,function(ok){
            if(ok)
            {
                err_lock=0;
                var del_type=log_path+err_file_name;
                if(log_stream[del_type])
                {
                    log_stream[del_type].end("this is the end");
                    log_stream[del_type].on('finish',function(){
                        delete log_stream[del_type];
                    });
                }
                err_file_name = util.format("/err%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                create_stream(new_log_path+err_file_name);
                err_total = 0;
            }
            else
            {
                fs.mkdir(new_log_path,0755,function(){
                    err_lock=0;

                    for(var key in log_stream)
                    {
                        if(log_stream[key])
                        {
                            log_stream[key].end("this is the end");
                            log_stream[key].on('finish',function(){
                                delete log_stream[key];
                            });
                        }
                    }

                    //创建完毕，指向新地址
                    log_path=new_log_path;
                    //log
                    log_file_name = util.format("/log%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+log_file_name);
                    log_total = 0;
                    //err
                    err_file_name = util.format("/err%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+err_file_name);
                    err_total = 0;
                    //log2
                    for(var key in log2_file)
                    {
                        if(log2_file[key])
                        {
                            log2_file[key] = new log2_struct();
                            log2_file[key].type=key;
                            log2_file[key].path=util.format("/%s%d-%d:%d",key,now.getDate(),now.getHours(),now.getMinutes());
                            create_stream(log_path+log2_file[key].path);
                        }
                    }
                });
            }
        });


    }
};

function check_log2(t_log)
{
    if(t_log.len >=100*1024*1024 && !t_log.lock)
    {
        t_log.lock=1;
        var now = new Date();
        var str = util.format("/%d-%d",now.getFullYear(),now.getMonth()+1);
        new_log_path=path+str;

        fs.exists(new_log_path,function(ok){
            if(ok)
            {
                t_log.lock=0;
                var del_type=log_path+t_log.path;
                if(log_stream[del_type])
                {
                    log_stream[del_type].end("this is the end");
                    log_stream[del_type].on('finish',function(){
                        delete log_stream[del_type];
                    });

                }

                t_log.path = util.format("/%s%d-%d:%d",t_log.type,now.getDate(),now.getHours(),now.getMinutes());
                create_stream(log_path+t_log.path);
                t_log.len = 0;
            }
            else
            {
                fs.mkdir(new_log_path,0755,function(){

                    t_log.lock=0;

                    for(var key in log_stream)
                    {
                        if(log_stream[key])
                        {
                            log_stream[key].end("this is the end");
                            log_stream[key].on('finish',function(){
                                delete log_stream[key];
                            });
                        }
                    }
                    log_path=new_log_path;
                    //log
                    log_file_name = util.format("/log%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+log_file_name);
                    log_total = 0;
                    //err
                    err_file_name = util.format("/err%d-%d:%d",now.getDate(),now.getHours(),now.getMinutes());
                    create_stream(log_path+err_file_name);
                    err_total = 0;
                    //log2
                    for(var key in log2_file)
                    {
                        if(log2_file[key])
                        {
                            log2_file[key] = new log2_struct();
                            log2_file[key].type=key;
                            log2_file[key].path=util.format("/%s%d-%d:%d",key,now.getDate(),now.getHours(),now.getMinutes());
                            create_stream(log_path+log2_file[key].path);
                        }
                    }
                });
            }
        });


    }
};

function write_log(type,logData)
{
    var now=new Date();

    var str="";
    for(var key in logData)
    {
        if(key=="content")
        {
            str+=("["+logData.date+"]"+" INFO:" +key+" :" +JSON.stringify(logData[key])+"\n");
            continue;
        }
        str+=("["+logData.date+"]"+" INFO:" +key+" :" +logData[key]+"\n");
    }

    if(is_test==0)
    {
        if(log2_file[type]==undefined)
        {
            log2_file[type] = new log2_struct();
            log2_file[type].type=type;
            log2_file[type].path=util.format("/%s%d-%d:%d",type,now.getDate(),now.getHours(),now.getMinutes());
            create_stream(log_path+log2_file[type].path);
        }
        log_stream[log_path+log2_file[type].path].write(str);
        log2_file[type].len+=str.length;
        check_log2(log2_file[type]);
    }
    else
    {
        console.log(str);
    }
};
global.log2=write_log;

var log_ok=true;
var log_buffer="";
function console_log(txt)
{
    var now=new Date();
    var year=now.getFullYear();
    var month=Number(now.getMonth())+1;
    var date=now.getDate();
    var hour=now.getHours();
    var minute=now.getMinutes();
    var second=now.getSeconds();
    var str = util.format("[%d-%d-%d %d:%d:%d] INFO:%s\n",year,month,date,hour,minute,second,txt);

    if(is_test==0)
    {
        log_buffer+=str;
        if(log_buffer.length>3*1024)
        {
            log_stream[log_path+log_file_name].write(log_buffer);
            log_total+=log_buffer.length;
            log_buffer="";
            check_log();
        }

    }
    else
    {

        console.log(str);
    }

};
global.log=console_log;

function err_log(err)
{
    var now=new Date();
    var year=now.getFullYear();
    var month=Number(now.getMonth())+1;
    var date=now.getDate();
    var hour=now.getHours();
    var minute=now.getMinutes();
    var second=now.getSeconds();
    var str = util.format("[%d-%d-%d %d:%d:%d] ERROR :",year,month,date,hour,minute,second);

    var error = new Error();
    error.name = "Trace";
    error.message = err?err:"";

    Error.captureStackTrace(error,arguments.callee);

    var err_str=str+error.stack+"\n";

    //var err_str=str+err+"\n";

    if(is_test==0)
    {
        //log_stream[log_path+err_file_name].write(err_str);
        //err_total+=err_str.length;
        //check_err();
        log_buffer+=err_str;
        log_total+=err_str.length;
    }
    else
    {
        console.error(err_str);
    }

};
global.err=err_log;


function create_stream(path)
{
    log_stream[path]=fs.createWriteStream(path ,{flags:'w'});
};


