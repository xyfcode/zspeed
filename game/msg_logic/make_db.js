var wy_db=null;
var t_user="t_user";
var t_role = "t_role";
var t_global_id="t_global_id";
var t_rand_name_list="t_rand_name_list";//只保存随机名
var t_mail_list="t_mail_list";
var t_formation_list="t_formation_list";
var t_friend_list="t_friend_list";
var t_town_list="t_town_list";
var t_code_list="t_code_list";
var t_arena_list="t_arena_list";


exports.t_user = t_user;
exports.t_role = t_role;
exports.t_rand_name_list = t_rand_name_list;
exports.t_friend_list = t_friend_list;

var DataGid=function()
{
    this.country_id=0;
    this.district_id=0;
    this.server_id=0;
    this.global_id=0;

};
var data_gid=new DataGid();
var g_server=null;

exports.server=function(s){
    g_server=s;
    wy_db= s.db;
    find_fid();
};

function find_fid()
{
    global.log("find_fid");

    data_gid.district_id=g_server.config.other.district_id;
    data_gid.server_id=g_server.config.other.server_id;
    data_gid.country_id=g_server.config.other.country_id;

    var strCon={country_id:data_gid.country_id ,district_id:data_gid.district_id , server_id:data_gid.server_id };

    var ret=wy_db.find(t_global_id,strCon,function(arr){
        if(arr.length==0)
        {
            data_gid.global_id=100000000;
            wy_db.insert(t_global_id,data_gid);
        }
        else
        {
            data_gid.country_id=arr[0].country_id;
            data_gid.district_id=arr[0].district_id;
            data_gid.server_id=arr[0].server_id;
            data_gid.global_id=arr[0].global_id;
        }

    });
}
exports.find_fid=find_fid;


function get_global_unique_id()
{
    global.log("get_global_unique_id");
    data_gid.global_id++;
    var strCon={country_id:data_gid.country_id ,district_id:data_gid.district_id , server_id:data_gid.server_id };

    wy_db.update(t_global_id,strCon,{$set:{global_id:data_gid.global_id}});

    return  data_gid.global_id;

}
exports.get_global_unique_id=get_global_unique_id;


exports.insert_mail_data=function(doc){
    global.log("insert_mail_data");
    if(doc==undefined)
    {
        global.log("doc==undefined");
        return;
    }
    wy_db.insert(t_mail_list,doc);
};

exports.update_mail_data=function(mail_data){
    global.log("update_mail_data");

    if(mail_data==undefined)
    {
        global.log("mail_data==undefined");
        return;
    }
    var options={"gid":mail_data.gid,"grid":mail_data.grid};

    var obj_new={"$set":{mail_arr:mail_data.mail_arr}};

    wy_db.update(t_mail_list,options,obj_new);
};

exports.insert_formation_data=function(formation_data){
    global.log("insert_formation_data");
    if(formation_data==undefined)
    {
        global.log("formation_data==undefined");
        return;
    }
    wy_db.insert(t_formation_list,formation_data);
};

exports.update_formation_data=function(formation_data){
    global.log("update_formation_data");

    if(formation_data==undefined)
    {
        global.log("formation_data==undefined");
        return;
    }
    var options={"gid":formation_data.gid,"grid":formation_data.grid};
    var obj_new=formation_data;
    wy_db.update(t_formation_list,options,obj_new);
};

exports.delete_formation_data = function(grid)
{
    global.log("delete_formation_data");
    if(grid==undefined)
    {
        global.log("grid==undefined");
        return;
    }
    var options={"grid":grid};
    wy_db.remove(t_formation_list,options);
};

exports.insert_play_rand_name=function(doc){

    //global.log("insert_play_rand_name");

    if(doc==undefined)
    {
        return;
    }

    wy_db.insert(t_rand_name_list,doc)
};

exports.update_user_data = function(user)
{
    if(user == undefined)
    {
        return;
    }
    if(user.account_data != undefined)
    {
        var con = {
            gid:user.account_data.gid,
            account:user.account_data.account
        };
        wy_db.update(t_user,con,user.account_data);
    }
};

exports.insert_user_data = function(user)
{
    if(user == undefined)
    {
        return;
    }
    if(user.account_data != undefined)
    {
        wy_db.insert(t_user,user.account_data);
    }
};

exports.insert_role_data = function(role_data)
{
    if(role_data == undefined)
    {
        return;
    }
    wy_db.insert(t_role,role_data);
};

exports.update_role_data = function(role_data)
{
    if(role_data == undefined)
    {
        return;
    }

    var con ={gid:role_data.gid,grid:role_data.grid};
    var opera = {"$set":{data:role_data}};
    wy_db.update(t_role,con,opera);
};


exports.insert_friend_data=function(friend_data){
    global.log("insert_friend_data");
    if(friend_data==undefined)
    {
        global.log("friend_data==undefined");
        return;
    }
    wy_db.insert(t_friend_list,friend_data);
};

exports.update_friend_data=function(friend_data){
    global.log("update_friend_data");

    if(friend_data==undefined)
    {
        global.log("friend_data==undefined");
        return;
    }
    var options={"grid":friend_data.grid};
    var obj_new=friend_data;
    wy_db.update(t_friend_list,options,obj_new);
};

exports.insert_town_data=function(town_data){
    global.log("insert_town_data");
    if(town_data==undefined)
    {
        global.log("town_data==undefined");
        return;
    }
    wy_db.insert(t_town_list,town_data);
};

exports.update_town_data=function(town_data){
    global.log("update_town_data");

    if(town_data==undefined)
    {
        global.log("town_data==undefined");
        return;
    }
    var options={"tid":town_data.tid};
    var obj_new=town_data;
    wy_db.update(t_town_list,options,obj_new);
};

exports.insert_arena_data=function(arena_data){
    global.log("insert_arena_data");
    if(arena_data==undefined)
    {
        global.log("arena_data==undefined");
        return;
    }
    wy_db.insert(t_arena_list,arena_data);
};

exports.update_arena_data=function(arena_data){
    global.log("update_arena_data");

    if(arena_data==undefined)
    {
        global.log("arena_data==undefined");
        return;
    }
    var options={"grid":arena_data.grid};
    var obj_new=arena_data;
    wy_db.update(t_arena_list,options,obj_new);
};
