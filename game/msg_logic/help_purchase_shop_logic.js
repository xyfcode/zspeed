var ds = require("./data_struct");
var define_code=require("./define_code");
var make_db = require("./make_db");
var common_func=require("./common_func");
var purchase_shop = require("./purchase_shop_data");
var log_data=require("./log_data");
var log_data_logic=require("./help_log_data_logic");
var money_logic=require("./help_money_logic");
var mail_data=require("./mail_data");
var mail_logic=require("./help_mail_logic");
var billing_client=require("../billing_client");

var msg_id=define_code.msg_id;
var msg_code=define_code.msg_code;
var const_value=define_code.const_value;

var g_server=null;

function init(s)
{
    g_server = s;
}
exports.init=init;


//查看用户商城充值信息
function on_user_purchase_data(data,send,s)
{
    global.log("on_user_purchase_data");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var pft=data.pft;
    if(pft==undefined)
    {
        global.log("pft == undefined");
        return;
    }

    var first_charge=0;//是否是首冲

    //首冲
    if(Object.keys(role.purchase_record).length==0)
    {
        first_charge=1
    }


    var purchase_data_list=purchase_shop.purchase_shop_data_list;

    var iap_items=[];

    for(var good_id in purchase_data_list)
    {
        var goods_data= purchase_data_list[good_id];
        var client_data={};
        if(goods_data && goods_data.pft_type==pft)
        {
            client_data.id=goods_data.goods_id;
            client_data.first_charge=1;

            if(goods_data.is_cd)
            {
                client_data.first_charge=0;  //月卡没有首冲
                if(role.is_cd_exist)
                {
                    //用户购买了月卡
                    var now=(new Date()).getTime();
                    var use_time=now-role.purchase_record[goods_data.goods_id].date;
                    //用户有月卡,倒计时时间,精确到秒
                    client_data.cooldown=Math.floor((const_value.CD_REWARD_TIME*24*60*60*1000-use_time)/1000);
                }

            }
            var role_record_data=role.purchase_record[good_id];
            if(role_record_data)
            {
                client_data.first_charge=0;
            }
            iap_items.push(client_data);
        }
    }

    var msg = {
        "op" : msg_id.NM_USER_PURC_DATA,
        "first_charge" : first_charge,
        "iap_items" : iap_items,
        "ret" : msg_code.SUCC
    };
    send(msg);

    var log_content={"msg":msg};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_user_purchase_data",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_user_purchase_data = on_user_purchase_data;

//验证用户是否可以购买月卡
function on_user_purchase_cd(data,send,s)
{
    global.log("on_user_purchase_cd");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var is_buy=1; //是否可以购买

   if(role.is_cd_exist)
   {
       is_buy=0;//月卡已经存在，不可购买
       var msg = {
           "op" : msg_id.NM_USER_PURC_CD,
           "date" : role.cd_reward[0].date,
           "is_buy" : is_buy,
           "ret" : msg_code.SUCC
       };
       send(msg);
   }
   else
   {
       var msg = {
           "op" : msg_id.NM_USER_PURC_CD,
           "is_buy" : is_buy,
           "ret" : msg_code.SUCC
       };
       send(msg);
   }


    var log_content={"is_buy":is_buy};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_user_purchase_cd",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_user_purchase_cd = on_user_purchase_cd;

//正式苹果用户支付(客户端发送的苹果支付请求)
function on_apple_user_purchase(data,send,s)
{
    global.log("on_apple_user_purchase");

    var gid = s.gid;
    if(gid == undefined)
    {
        global.log("gid == undefined");
        return;
    }

    var user = ds.user_list[gid];
    if(user == undefined)
    {
        global.log("user == undefined");
        return;
    }

    var role = ds.get_cur_role(user);
    if(role == undefined)
    {
        global.log("role == undefined");
        return;
    }

    var app_data=data.data;
    var goods_id=data.goods_id;

    global.log("app_data:"+app_data);
    global.log("goods_id:"+goods_id);

    if(app_data==undefined || goods_id==undefined)
    {
        global.log("app_data==undefined || goods_id==undefined");
        return;
    }

    var billing_socket=billing_client.get_billing_socket();
    if(billing_socket)
    {
        var msg = {
            "op" : msg_id.NM_APPLE_USER_PURCHASE,
            "account": role.account, //用户账号
            "app_data": app_data,
            "goods_id": goods_id
        };
        billing_socket.send(msg);
    }
    else
    {
        global.log("on_apple_user_purchase error");
        var msg = {
            "op" : msg_id.NM_APPLE_USER_PURCHASE,
            "ret" : msg_code.SERVER_ERROR
        };
        send(msg);
    }


    var log_content={"app_data":app_data ,"goods_id":goods_id};
    var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"on_apple_user_purchase",log_content,log_data.logType.LOG_BEHAVIOR);
    log_data_logic.log(logData);

}
exports.on_apple_user_purchase = on_apple_user_purchase;

//用户支付(billing返回的验证结果)
function on_billing_purchase_verify_result(data,send,s)
{
    global.log("on_billing_apple_purchase_verify_result");

    var goodsId = data.goods_id; //商品ID
    var account = data.account; //用户账号
    var status = data.status; //充值状态 0:正常，其他：有问题
    var type = data.type;

    if(goodsId == undefined  || account==undefined || status==undefined || type==undefined)
    {
        global.log("goodsId == undefined  || account==undefined || status==undefined || type==undefined");
        return;
    }

    if(status==0)
    {
        help_user_gain_purchase_goods(goodsId,account,type);
    }
    else
    {
        global.log("purchase is error,status :" + status);

        var _msg_id;
        switch (type)
        {
            case define_code.pfType.PT_PP_IOS:
                //PP助手
                _msg_id=msg_id.NM_USER_PURCHASE;
                break;
            case define_code.pfType.PT_APP_STORE:
                //苹果app_store
                _msg_id=msg_id.NM_APPLE_USER_PURCHASE;
                break;
        }

        var user=ds.user_account_list[account];
        if(user && user.online)
        {
            global.log("user is online");
            var msg = {
                "op" : _msg_id,
                "ret" : msg_code.PURCHASE_ERROR
            };
            user.send(msg);
        }
    }
}
exports.on_billing_purchase_verify_result = on_billing_purchase_verify_result;

function help_user_gain_purchase_goods(goodsId,account,pf_type)
{
    if(goodsId==undefined || account==undefined ||pf_type==undefined)
    {
        global.log("goodsId==undefined || account==undefined");
        return;
    }

    var _msg_id;

    switch (pf_type)
    {
        case define_code.pfType.PT_PP_IOS:
            //PP助手
            _msg_id=msg_id.NM_USER_PURCHASE;
            break;
        case define_code.pfType.PT_APP_STORE:
            //苹果app_store
            _msg_id=msg_id.NM_APPLE_USER_PURCHASE;
            break;
    }

    var goods=purchase_shop.purchase_shop_data_list[goodsId];

    if(goods==undefined)
    {
        global.log("goods==undefined,goodsId:"+goodsId);
        return;
    }

    var gain_rmb=Number(goods.goods_rmb);
    global.log("gain_rmb:"+gain_rmb);
    var goods_price=Number(goods.goods_price);
    global.log("goods_price:"+goods_price);

    var user=ds.user_account_list[account];
    if(user && user.online)
    {
        global.log("user is online");

        var role = ds.get_cur_role(user);
        if(role)
        {
            //首冲物品奖励
            if(Object.keys(role.purchase_record).length==0)
            {
                mail_logic.help_send_first_purchase_mail(role.gid,role.grid,account);
            }

            var role_purchase_record=role.purchase_record[goods.goods_id];
            if(role_purchase_record)
            {
                //普通返利
                var common_reward=Number(goods.common_reward);
                global.log("common_reward:"+common_reward);
                gain_rmb+=common_reward;

                //更新用户数据
                role_purchase_record.count++;
                role_purchase_record.date=(new Date()).getTime();
                if(goods.is_cd)
                {
                    //当时就发送月卡奖励邮件
                    mail_logic.help_send_role_cd_reward_mail(role.gid,role.grid,goods.cd_reward);
                    //月卡剩余次数
                    role_purchase_record.cd_left=const_value.CD_REWARD_TIME-1;
                    role.is_cd_exist=1;
                    role.purchase_rmb+=goods.cd_reward;
                }
            }
            else
            {
                //首次购买该商品
                var first_reward=Number(goods.first_reward);
                global.log("first_reward:"+first_reward);
                gain_rmb+=first_reward;

                //添加充值记录
                var role_purchase_record=new ds.Purchase_Record_Data();
                role_purchase_record.id=goods.goods_id;
                role_purchase_record.count=1;
                role_purchase_record.date=(new Date()).getTime();
                if(goods.is_cd)
                {
                    //当时就发送月卡奖励邮件
                    mail_logic.help_send_role_cd_reward_mail(role.gid,role.grid,goods.cd_reward);
                    //月卡剩余次数
                    role_purchase_record.cd_left=const_value.CD_REWARD_TIME-1;
                    role.is_cd_exist=1;
                    role.purchase_rmb+=goods.cd_reward;
                }

                role.purchase_record[goods.goods_id]=role_purchase_record;
            }

            //得到人民币
            money_logic.help_gain_rmb(role,gain_rmb);
            role.purchase_rmb+=gain_rmb;
            //计算VIP等级
            if(const_value.VIP[role.vip+1]&&role.purchase_rmb>=const_value.VIP[role.vip+1])
            {
                role.vip++;
            }

            user.nNeedSave=1;
            var msg = {
                "op" : _msg_id,
                "rmb" : gain_rmb,
                "ret" : msg_code.SUCC
            };
            user.send(msg);

            //推送客户端全局修改信息
            var g_msg = {
                "op" : msg_id.NM_USER_DATA,
                "rmb":role.rmb,
                "vip":role.vip,
                "vip_rmb":role.purchase_rmb,
                "ret" :msg_code.SUCC
            };
            user.send(g_msg);
            global.log(JSON.stringify(g_msg));


            var log_content={"goodsId":goods.goods_id};
            var logData=log_data_logic.help_create_log_data(role.gid,role.account,role.grid,role.level,role.name,"help_user_gain_purchase_goods",log_content,log_data.logType.LOG_BEHAVIOR);

            log_data_logic.log(logData);
        }
        else
        {
            global.log("role==undefined,account:"+account);
            return;
        }
    }
    else
    {
        global.log("user is not online");

        //用户不在线的情况 //目前一个账号对应一个用户
        var select_val={"gid":1,"grid":1,"data.name":1,"data.level":1,"data.purchase_rmb":1,"data.vip":1,"data.purchase_record":1};
        g_server.db.find(make_db.t_role,{"data.account":account},select_val,function(arr){
            if(arr.length)
            {

                var purchase_record=arr[0].data.purchase_record;
                var achievement=arr[0].data.achievement;
                var gid=arr[0].gid;
                var grid=arr[0].grid;
                var name=arr[0].data.name;
                var level=arr[0].data.level;
                var vip=arr[0].data.vip;
                var purchase_rmb=arr[0].data.purchase_rmb;

                //首冲物品奖励
                if(Object.keys(purchase_record).length==0)
                {
                    mail_logic.help_send_first_purchase_mail(gid,grid,account);
                }


                var is_cd=0;
                var role_purchase_record=purchase_record[goods.goods_id];
                if(role_purchase_record)
                {
                    global.log("role_purchase_record is exist");
                    //普通返利
                    var common_reward=Number(goods.common_reward);
                    gain_rmb+=common_reward;

                    //更新用户数据
                    role_purchase_record.count++;
                    role_purchase_record.date=(new Date()).getTime();
                    if(goods.is_cd)
                    {
                        //当时就发送月卡奖励邮件
                        mail_logic.help_send_role_cd_reward_mail(gid,grid,goods.cd_reward);
                        //月卡剩余次数
                        role_purchase_record.cd_left=const_value.CD_REWARD_TIME-1;
                        is_cd=1;
                        purchase_rmb+=goods.cd_reward;
                    }
                }
                else
                {
                    //首次购买该商品
                    global.log("first buy this goods!");
                    var first_reward=Number(goods.first_reward);
                    gain_rmb+=first_reward;

                    //添加充值记录
                    role_purchase_record=new ds.Purchase_Record_Data();
                    role_purchase_record.id=goods.goods_id;
                    role_purchase_record.date=(new Date()).getTime();
                    role_purchase_record.count=1;
                    if(goods.is_cd)
                    {
                        //当时就发送月卡奖励邮件
                        mail_logic.help_send_role_cd_reward_mail(gid,grid,goods.cd_reward);
                        //月卡剩余次数
                        role_purchase_record.cd_left=const_value.CD_REWARD_TIME-1;
                        is_cd=1;
                        purchase_rmb+=goods.cd_reward;
                    }

                    purchase_record[goods.goods_id]=role_purchase_record;
                }

                purchase_rmb+=gain_rmb;
                //计算VIP等级
                if(const_value.VIP[vip+1]&&purchase_rmb>=const_value.VIP[vip+1])
                {
                    vip++;
                }

                if(is_cd)
                {
                    g_server.db.update(
                        make_db.t_role,{"data.account":account},
                        {
                            "$inc":{"data.rmb":gain_rmb},
                            "$set":{"data.purchase_record":purchase_record,"data.purchase_rmb":purchase_rmb,
                                "data.is_cd_exist":1,"data.vip":vip}
                        }
                    );
                }
                else
                {
                    g_server.db.update(make_db.t_role,{"data.account":account},
                        {
                            "$inc":{"data.rmb":gain_rmb},
                            "$set":{"data.purchase_record":purchase_record,"data.purchase_rmb":purchase_rmb,"data.vip":vip}
                        }
                    );
                }

                var log_content={"goodsId":goods.goods_id};
                var logData=log_data_logic.help_create_log_data(gid,account,grid,level,name,"help_user_gain_purchase_goods",log_content,log_data.logType.LOG_BEHAVIOR);

                log_data_logic.log(logData);

            }
            else
            {
                global.log("user is not exist:"+account);
            }
            

        });

    }


}
exports.help_user_gain_purchase_goods=help_user_gain_purchase_goods;

//月卡返利每日24点邮件发放
var auto_dispatch_cd_reward=function()
{
    global.log("auto_dispatch_cd_reward");

    var cd_id= 0,cd_json_data;
    for(var key in purchase_shop.purchase_shop_data_list)
    {
        var _purchase_data=purchase_shop.purchase_shop_data_list[key];
        //todo::判断条件不严谨，总是第一个
        if(_purchase_data.is_cd)
        {
            cd_json_data=_purchase_data;
            cd_id=_purchase_data.goods_id;
            break;
        }
    }
    if(cd_id==0)
    {
        global.log("cd_id==0");
        return;
    }

    //月卡暂定只有一张
    g_server.db.find(make_db.t_role,{"data.is_cd_exist":1},{"gid":1,"grid":1,"data.purchase_record":1},function(arr){
        if(arr.length>0)
        {
            for(var i=0;i<arr.length;i++)
            {
                global.log("arr[i]:"+JSON.stringify(arr[i]));
                var _purchase_record=arr[i].data.purchase_record;
                var gid=arr[i].gid;
                var grid=arr[i].grid;
                var _cd_record_data=_purchase_record[cd_id];
                //存在月卡
                if(_cd_record_data && _cd_record_data.cd_left>0)
                {
                    //只有最后一张有效,用户同时只能存在一张有效的月卡

                    mail_logic.help_send_role_cd_reward_mail(gid,grid,cd_json_data.cd_reward);

                    var is_online=0; //用户是否在线

                    global.log("role_gid:"+gid);
                    var user=ds.user_list[gid];
                    if(user  && user.online)
                    {
                        var role = ds.get_cur_role(user);
                        if(role)
                        {
                            //用户在线
                            global.log("user is online");
                            is_online=1;

                            role.purchase_record[cd_id].cd_left--;
                            if(role.purchase_record[cd_id].cd_left<=0)
                            {
                                //月卡使用完
                                role.is_cd_exist=0;
                            }
                            user.nNeedSave=1;

                            //推送客户端全局修改信息
                            var g_msg = {
                                "op" : msg_id.NM_USER_DATA,
                                "rmb":role.rmb ,
                                "ret" :msg_code.SUCC
                            };
                            user.send(g_msg);
                            global.log(JSON.stringify(g_msg));
                        }
                    }
                    if(!is_online)
                    {
                        //用户不在线
                        global.log("user is not online");

                        //剩余次数
                        _cd_record_data.cd_left--;
                        if(_cd_record_data.cd_left<=0)
                        {
                            //月卡使用完
                            global.log("cd is out of date!");
                            g_server.db.update(make_db.t_role,{"gid":gid,"grid":grid},{"$set":{"data.purchase_record":_purchase_record,"data.is_cd_exist":0}});
                        }
                        else
                        {
                            global.log("cd can use !");
                            g_server.db.update(make_db.t_role,{"gid":gid,"grid":grid},{"$set":{"data.purchase_record":_purchase_record}});
                        }
                    }

                }
            }
         }

    });

};
exports.auto_dispatch_cd_reward=auto_dispatch_cd_reward;