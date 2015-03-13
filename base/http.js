var http = require("http");

var express = require("express");
var routes = require('../server/routes');
var path = require('path');

exports.initserver = function(h_conf)
{
    var app = express();
    app.listen(h_conf.port);

    app.use(express.bodyParser());
    app.set('views', '../views');
    app.set('view engine', 'ejs');
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static('../public'));
    //console.log("__dirname:"+__dirname);


    global.log("listen "+h_conf.port+" http ok");
    //谁在前先执行谁
    //app.get('/', msg_logic.index);
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By",' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        //res.setEncoding('utf8');
        global.log(req.ip);
        for(var key in req.query)
        {
            global.log("key:"+key);
            global.log("req[key]:"+req.query[key]);
        }
        next();

    });
    // Routes(要按顺序写)
    routes(app);
};



