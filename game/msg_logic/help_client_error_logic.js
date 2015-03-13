var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");


//错误记录
function on_client_error(data,send,s)
{
    global.log("on_client_error");

    var error=data.error;
    if(error == undefined)
    {
        global.log("error == undefined");
        return;
    }

    var log_content={"error":error};
    var logData=log_data_logic.help_create_log_data(0,0,0,0,0,"on_client_error",log_content,log_data.logType.LOG_CLIENT_ERROR);
    log_data_logic.log(logData);

}
exports.on_client_error = on_client_error;
