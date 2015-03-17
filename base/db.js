var Mongodb = require('mongodb');
var MongoClient = Mongodb.MongoClient;
var ObjectID = Mongodb.ObjectID;

DBProvider = function(conf,s,call_back) {
    if(conf.dbname==undefined || conf.dbip==undefined|| conf.dbport==undefined || call_back==undefined)
    {
        global.log("s.db_name==undefined || s.db_ip==undefined || s.db_port==undefined || call_back==undefined");
        return ;
    }

    var url="";
    if(conf.dbuser&&conf.dbpwd)
    {
        url="mongodb://"+conf.dbuser+":"+conf.dbpwd+"@"+conf.dbip+":"+conf.dbport+"/"+conf.dbname;
    }
    else
    {
        url="mongodb://"+conf.dbip+":"+conf.dbport+"/"+conf.dbname;
    }


    global.log("url :"+url);

    var _this=this;
    MongoClient.connect(url, function(err, db) {
        if(!err)
        {
            global.log("connect mongodb success!");
            _this.db=db;
            s.db=_this;
            call_back(s);
        }
        else{
            global.log("connect mongodb failed!");
            global.err(err);
        }
    });
};
 /*
  var col1 = db.collection('collectionName'); //非严格模式。callback是防止出错，等待确认成功之后才返回
 */
DBProvider.prototype.getCollection= function(collectionName, callback) {
    this.db.collection(collectionName, function(error, collection) {
        if( error ) global.err(error);
        else callback(null, collection);
    });
};
/**
 *   collectionName: 表名称
 *   condition: 查询条件
 *   option:查询指定列
 *   callback:回调函数
 *   doc:插入文档
 **/
DBProvider.prototype.find = function(collectionName, condition, option, callback) {

    if(collectionName==undefined)
    {
        global.log("db find collectionName==undefined");
        return;
    }
    if(condition==undefined)
    {
        condition={};
    }

    var length=arguments.length;
    if(length==2)
    {
        var option={};
    }
    else if(length==3)
    {
        var callback=arguments[2];
        var option={};
    }

    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            global.err(error);
        }
        else {
            var collectionFound = collection.find(condition,option);
            if(collectionFound != undefined){
                collectionFound.toArray(function(error, results) {
                    if(error){
                        global.err(error);
                    }
                    else{
                        if(callback!=undefined && typeof(callback)=="function")
                        {
                            if(results==null){
                                results=[];
                            }
                            callback(results);
                        }
                    }
                });
            }
            else{
                global.err('collection could not to find');
            }
        }
    });
};

DBProvider.prototype.insert = function(collectionName, doc, callback) {

    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            if(callback==undefined)
            {
                global.err("callback==undefined");
            }
            else
            {
                global.err(error);
            }

        }
        else {
            //如果不指定{safe:true}，则不会执行回调函数
            collection.insert(doc,{safe:true},function(error,objects){
                if(error){
                    global.err(error);
                }
                else{
                    if(callback!=undefined && typeof(callback)=="function")
                    {
                        callback(true);
                    }
                }
            })
        }
    });
};

DBProvider.prototype.update = function(collectionName, options,obj_new,  callback) {

    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            global.err(error);
        }
        else {
            collection.update(options,obj_new,{safe:true},function(error){
                if(error){
                    global.err(error);
                }
                else{
                    if(callback!=undefined && typeof(callback)=="function")
                    {
                        callback(true);
                    }
                }
            })
        }
    });
};

DBProvider.prototype.getOne= function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            callback(error);
        }
        else {
            collection.findOne({
                _id: ObjectID.createFromHexString(id)
            }, function(error, collectionFound) {
                if( error ) {
                    callback(error);
                }
                else {
                    callback(null, collectionFound);
                }
            });
        }
    });
};

DBProvider.prototype.save = function(collectionName, itemToSave,  callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) callback(error);
        else {
            if(itemToSave._id != undefined && itemToSave._id.length == 24){ //update
                var _id = typeof(itemToSave._id) == 'object' ? itemToSave._id:ObjectID.createFromHexString(itemToSave._id);
                delete itemToSave._id;//important step
                collection.update({
                    '_id':_id
                }, {
                    '$set': itemToSave
                },{},function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        itemToSave._id = _id;//如果_id跟着一起更新，那么会失败，故先删除_id，完了以后再加入
                        callback(true);
                    }
                });
            }else{ //insert
                collection.save(itemToSave,{
                    safe:true
                },function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        callback(true);
                    }
                });
            }

        }
    });
};

DBProvider.prototype.push = function(collectionName, id, itemToSave,  callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) callback(error);
        else {
            if(id != undefined && id.length == 24){
                var _id = ObjectID.createFromHexString(id);
                collection.update({
                    '_id':_id
                }, {
                    '$push': itemToSave
                },{},function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        callback(true);
                    }
                });
            }else{
                callback(false);
            }

        }
    });
};

DBProvider.prototype.removeById= function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            callback(error);
        }
        else {
            collection.remove({
                _id: ObjectID.createFromHexString(id)
            }, function(error, collectionFound) {
                if( error ) {
                    callback(error);
                }
                else {
                    callback();
                }
            });
        }
    });
};

DBProvider.prototype.remove= function(collectionName, oper, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            if(callback)
            {
                callback(error);
            }

        }
        else {
            collection.remove(oper, function(error, collectionFound) {
                if( error ) {
                    if(callback)
                    {
                        callback(error);
                    }
                }
                else {
                    if(callback)
                    {
                        callback();
                    }
                }
            });
        }
    });
};

exports.DBProvider = DBProvider;












































