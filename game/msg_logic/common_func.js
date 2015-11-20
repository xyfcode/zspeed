/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-10
 * Time: 下午7:54
 * To change this template use File | Settings | File Templates.
 */
var crypto = require("crypto");
var xxtea = require('xxtea-node');


var isEmpty = function(str)
{
    return str === undefined || str === null || str === "";
};
exports.isEmpty = isEmpty;

function get_md5_str(str)
{
    if(str)
    {
        return crypto.createHash("md5").update(str).digest("hex");
    }
}
exports.get_md5_str = get_md5_str;

function help_contains(array,n)
{
    for(var i = 0 ;i < array.length; i ++)
    {
        if(array[i] == n) return true;
    }
    return false;
}

//生成n个大于等于 min 小于等于 max 不重复随机数
function help_make_random(n,min,max)
{
    var nums = [];
    if(n<0 || min>max)
    {
        return nums;
    }
    if(n>max-min+1)
    {
        for(var i=min;i<=max;i++)
        {
            nums.push(i);
        }
        return nums;
    }

    if(min <= max)
    {
        while(1==1)
        {
            if(nums.length >= n)
            {
                break;
            }
            var num = Math.floor(min + Math.random() * (max - min +1));
            if(!help_contains(nums,num))
            {
                nums.push(num);
            }
        }
    }
    return nums;
}
exports.help_make_random = help_make_random;

//生成1个大于等于min 小于等于 max 随机数
function help_make_one_random(min,max)
{
    var num;
    if(min <= max)
    {
        num = Math.floor(min + Math.random() * (max - min +1));
    }
    return num;
}
exports.help_make_one_random = help_make_one_random;


//数组排序方法，会改变原数组(备选参数根据对象的key排序，从小到大)
function compare_sort_asc(compare_arr,key)
{
    var compare;
    if(key==undefined)
    {
        var compare=function compare(value1,value2)
        {
            if(value1 < value2)
            {
                return -1;
            }
            else if(value1 > value2)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }

    }
    else
    {
        var compare=function(val_one,val_two)
        {
            if(val_one[key] < val_two[key])
            {
                return -1;
            }
            else if(val_one[key] > val_two[key])
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
    }

    compare_arr.sort(compare);
    return compare_arr;

}
exports.compare_sort_asc = compare_sort_asc;

//数组排序方法，会改变原数组(备选参数根据对象的key排序，从大到小)
function compare_sort_des(compare_arr,key)
{
    var compare;
    if(key==undefined)
    {
        var compare=function compare(value1,value2)
        {
            if(value1 < value2)
            {
                return 1;
            }
            else if(value1 > value2)
            {
                return -1;
            }
            else
            {
                return 0;
            }
        }

    }
    else
    {
        var compare=function(val_one,val_two)
        {
            if(val_one[key] < val_two[key])
            {
                return 1;
            }
            else if(val_one[key] > val_two[key])
            {
                return -1;
            }
            else
            {
                return 0;
            }
        }
    }

    compare_arr.sort(compare);
    return compare_arr;

}
exports.compare_sort_des = compare_sort_des;

//深度拷贝对象
function cloneObject(o){
    if(!o||'object'!= typeof o){
        return o;
    }
    var c=Object.prototype.toString.call(o) == '[object Array]'?[]:{};
    var p,v;
    for(p in o){
        if(o.hasOwnProperty(p)){
            v=o[p];
            if(v&&'object'==typeof v){
                c[p]=cloneObject(v);
            }else{
                c[p]=v;
            }
        }
    }
    return c;
}
exports.cloneObject =cloneObject;

//获取字符串的长度
function get_str_length(str)
{
    if(str==undefined)
    {
        global.log("str==undefined");
        return;
    }
    var len=0;
    var l=str.length;
    for(var i=0; i<l; i++) {
        if ((str.charCodeAt(i) & 0xff00) != 0) {
            len ++;
        }
        len ++;
    }
    return len;
}
exports.get_str_length = get_str_length;

//判断是否是今天,data毫秒值格式
function help_judge_today(date)
{
    var is_today=0;
    if(date==undefined)
    {
        global.log("date==undefined");
        return;
    }

    var comp_date=new Date(date);
    if(comp_date)
    {
        var now=new Date();
        if(comp_date.getFullYear()==now.getFullYear()&&comp_date.getMonth()==now.getMonth()&&comp_date.getDate()==now.getDate())
        {
            is_today=1;
        }
        return is_today;
    }
    return is_today;

}
exports.help_judge_today = help_judge_today;

//判断是否是昨天
function help_judge_yesterday(comp_date)
{
    var is_yesterday=0;
    if(comp_date==undefined)
    {
        global.log("date==undefined");
        return;
    }

    if(comp_date)
    {
        var now=new Date();
        var str_zero=(now.getFullYear())+"/"+(now.getMonth()+1)+"/"+(now.getDate());
        var today_date=(new Date(str_zero)).getTime();

        if((today_date-comp_date)>0 && (today_date-comp_date)<86400000)
        {
            is_yesterday=1;
        }
        return is_yesterday;
    }
    return is_yesterday;

}
exports.help_judge_yesterday = help_judge_yesterday;

function help_decode_xxtea_str(encrypt_data,key)
{
    if(encrypt_data&&key)
    {
        encrypt_data=new Buffer(encrypt_data,'base64');
        var decrypt_data  = xxtea.toString(xxtea.decrypt(encrypt_data, xxtea.toBytes(key)));
        return decrypt_data;
    }
}
exports.help_decode_xxtea_str = help_decode_xxtea_str;

function help_get_rand_str()
{
    var arr_str=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','2','3','9'];
    var arr_rand=help_make_random(6,0,arr_str.length-1);

    var rand_str="";
    for(var i=0;i<arr_rand.length;i++)
    {
        rand_str+=arr_str[arr_rand[i]];
    }
    return rand_str;
}
exports.help_get_rand_str = help_get_rand_str;



