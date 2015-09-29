var child_worker;

exports.server = function(worker)
{
    child_worker = worker;
    setGlobalTick();
};

function setGlobalTick()
{

    setInterval(function(){
        var now=new Date();

        if((now.getHours()==5||now.getHours()==11||now.getHours()==17||now.getHours()==23)
            &&now.getMinutes()==30&&now.getSeconds()==0)
        {
            var msg={
                "op":"town_tick"
            };
            child_worker.send(msg);
        }
        else if(now.getHours()==0&&now.getMinutes()==0&&now.getSeconds()==0)
        {
            var msg={
                "op":"tick",
                "param":now.getHours()
            };
            //child_worker.send(msg);
        }
        else if(now.getHours()==22&&now.getMinutes()==0&&now.getSeconds()==0)
        {
            var msg={
                "op":"tick",
                "param":now.getHours()
            };
            //child_worker.send(msg);
        }

    },1000);

    setInterval(function(){
        var msg={
            "op":"tick_user_offline"
        };
        child_worker.send(msg);
    },16*60*1000);

    setInterval(function(){
        var msg={
            "op":"save_system_data"
        };
        child_worker.send(msg);
    },10*60*1000);


    setInterval(function(){
        var msg={
            "op":"get_system_info"
        };
        child_worker.send(msg);
    },27*60*1000);

}
