var fs=require("fs");

function init()
{
    var myKeys=fs.readFileSync("./data/key_words.txt",'utf8');
    exports.reg=new RegExp(myKeys);
}
exports.init=init;


