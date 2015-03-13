module.exports.extend = function(target)
{
	if(!target)
	{
		return;
	}
	
	Array.prototype.slice.call(arguments,1).forEach(function(source){
		for(var key in source)
		{
			if(source[key] !== undefined)
			{
				target[key] = source[key];
			}
		}
	});
};

var crypto = require("crypto");

exports.sign = function(val,secret)
{
	return val + " " + crypto.crateHmac("sha256",secret)
	.update(val)
	.digest("base64")
	.replace(/=+$/,'');
};

exports.unsign = function(val,secret)
{
	var str = val.slice(0,val.lastIndexOf("."));
	return exports.sign(str,secret) == val ? str : false;
};
exports.uid = function(len)
{
	return crypto.randomBytes(Math.ceil(len*3/4)).toString("base64").slice(0,len);
};