var zip = require("zlib");

var g = {};

function mycrypto(type)
{
    this._crypto = g[type] ? g[type] : g["gzip"];
}

mycrypto.prototype.encode = function(buffer,cb)
{
    this._crypto.encode(buffer,cb);
};

mycrypto.prototype.decode = function(buffer,cb)
{
    this._crypto.decode(buffer,cb);
};

exports.crypto = function(type)
{
    var c = new mycrypto(type);

    return c;
};


g.gzip = {
    encode : function(buffer,cb)
    {
        zip.gzip(buffer,cb); //数据压缩
    },
    decode : function(buffer,cb)
    {
        zip.gunzip(buffer,cb);//解压缩
    }
};

g.deflate = {
    encode : function(buffer,cb)
    {
        zip.deflate(buffer,cb); //数据压缩
    },
    decode : function(buffer,cb)
    {
        zip.inflate(buffer,cb);//解压缩
    }
};


g.deflateRaw = {
    encode : function(buffer,cb)
    {
        zip.deflateRaw(buffer,cb); //数据压缩
    },
    decode : function(buffer,cb)
    {
        zip.inflateRaw(buffer,cb);//解压缩
    }
};

g.dummy = {
    encode : function(buffer,cb)
    {
        process.nextTick(function(){
            cb(void 0 ,buffer);
        });
    },
    decode : function (buffer,cb){
        process.nextTick(function(){
            cb(void 0 ,buffer);
        });
    }
};