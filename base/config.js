var fs = require("fs");

var file_path="./config.ini";

exports.init = function()
{
	if(!fs.existsSync(file_path))
	{
		console.log("need config.ini file");
		return;
	}
	
	var str = fs.readFileSync(file_path,"utf8");
	
	if(str)
	{
		var newstr = str.replace(/\s+/g,"").replace(/((\{|,)(\w+)(:))/g,"$2\"$3\"$4");
		
		var conf = JSON.parse(newstr);
		
		exports.conf = conf;
	}
	else
	{
		console.log("read failed : " + file_path);
	}
};

exports.initasync = function(file,cb)
{
	fs.readFile(file,"utf8",function(err,str){
		if(err)
		{
			cb(err);
		}
		else if(str)
		{
			try
			{
                var conf = JSON.parse(str);
                cb(void 0,conf);
			
			}
			catch(e)
			{
				cb(e);
			}

		}
        else
        {
            cb("str is empty:"+file);
        }
	});
};

