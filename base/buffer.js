var util = require(process.binding('natives').util ? 'util': 'sys');

/*
* 构造方法
* @param bufferLength 缓存区长度，默认512 byte
*/
var ExBuffer = function (bufferLength) {
	var self = this;
    process.EventEmitter.call(this);//继承事件类
    var _headLen = 2; //包头的长度2或者4
    var _endian = 'B';
    var _buffer = new Buffer(bufferLength || 512);//Buffer大于8kb 会使用slowBuffer，效率低
    var _readOffset = 0;   //读取缓存区时的起始位置
    var _putOffset = 0;  //存放数据起始位置
    var _dlen = 0; //报头中整形表示的字符串长度

    /*
    * 指定包长是uint32型(默认是ushort型)
    */
    this.uint32Head = function(){
        _headLen = 4;
        return this;
    };

    /*
    * 指定包长是ushort型(默认是ushort型)
    */
    this.ushortHead = function(){
        _headLen = 2;
        return this;
    };

    /*
    * 指定字节序 为Little Endian (默认：Big Endian)
    */
    this.littleEndian = function(){
       _endian = 'L';
        return this;
    };

    /*
    * 指定字节序 为Big Endian (默认：Big Endian)
    */
    this.bigEndian = function(){
       _endian = 'B';
        return this;
    };

     /*
    * 送入一端Buffer
    */
    this.put = function(buffer,offset,len){
        if(offset == undefined)offset = 0;
        if(len == undefined)len = buffer.length - offset;
        //buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])

        //当前缓冲区已经不能满足本次数数据了
        if(len + getLen() > _buffer.length){
            var ex = Math.ceil((len + getLen())/(1024));//每次扩展1kb的倍数
            var tmp = new Buffer(ex * 1024);
            var exlen = tmp.length - _buffer.length;
            _buffer.copy(tmp);
            //fix bug : superzheng
            if (_putOffset < _readOffset) {
                if (_putOffset <= exlen) {
                    tmp.copy(tmp, _buffer.length, 0, _putOffset);
                    _putOffset += _buffer.length;
                } else {
                    //fix bug : superzheng
                    tmp.copy(tmp, _buffer.length, 0, exlen);
                    tmp.copy(tmp, 0, exlen, _putOffset);
                    _putOffset -= exlen;
                }
            }
            _buffer = tmp;
        }
        if(getLen() == 0){
            //数据读完，从新copy新数据到buffer，清空原先的buffer数据、
            _putOffset = _readOffset = 0;
        }
        //判断是否会冲破_buffer尾部
        if((_putOffset + len) > _buffer.length){
            //分两次存 一部分存在数据后面 一部分存在数据前面
            var len1 = _buffer.length - _putOffset;
            if (len1 > 0) {
                buffer.copy(_buffer,_putOffset,offset,offset + len1);
                offset += len1;
            }
            
            var len2 = len - len1;
            buffer.copy(_buffer,0,offset,offset + len2);
            _putOffset = len2;
        }else{
            buffer.copy(_buffer,_putOffset,offset,offset + len);
            _putOffset += len;
        }
        proc();
    };

    function proc() {
        var count = 0;
        while(true){
            //console.log(_buffer);
            count++;
            if(count>1000)break;//1000次还没读完?
            if(_dlen == 0){
                if(getLen() < _headLen){
                    break;//连包头都读不了
                }
                if(_buffer.length - _readOffset >= _headLen){
                    //读取包头，即传过来的字符串的长度
                    _dlen = _buffer['readUInt' + (8*_headLen) + ''+ _endian +'E'](_readOffset);
                    _readOffset += _headLen;
                }else {//
                    var hbuf = new Buffer(_headLen);
                    var rlen = 0;
                    for(var i = 0;i<(_buffer.length - _readOffset);i++){
                        hbuf[i] = _buffer[_readOffset++];
                        rlen++;
                    }
                    _readOffset = 0;
                    for(var i = 0;i<(_headLen - rlen);i++){
                        hbuf[rlen+i] = _buffer[_readOffset++];
                    }
                    _dlen = hbuf['readUInt' + (8*_headLen) + ''+ _endian +'E'](0);
                }
            }
            //实际数据的长度>=包头标示的长度，表示数据全部接收完毕
            if(getLen() >= _dlen){
                var dbuff = new Buffer(_dlen);
                if(_readOffset + _dlen > _buffer.length){
                    var len1 = _buffer.length - _readOffset;
                    if (len1 > 0) {
                        _buffer.copy(dbuff,0,_readOffset,_readOffset + len1);
                    }

                    _readOffset = 0;
                    var len2 = _dlen - len1;
                    _buffer.copy(dbuff,len1,_readOffset,_readOffset += len2);
                }else {
                    _buffer.copy(dbuff,0,_readOffset,_readOffset += _dlen);
                }
                try {
                    _dlen = 0;
                    self.emit("data", dbuff);
                    if (_readOffset === _putOffset) {
                        break;
                    }
                } catch(e) {
                    self.emit("error", e);
                }
            }
            else {
                break;
            }
        }
    }
    
    //获取现在的数据长度
    function getLen() {
        if(_putOffset>= _readOffset){ // ------******-------
            return _putOffset -  _readOffset;
        }
        return _buffer.length - _readOffset + _putOffset; //***-------*********
    }
};

util.inherits(ExBuffer, process.EventEmitter);//继承事件类

module.exports = exports = ExBuffer;



