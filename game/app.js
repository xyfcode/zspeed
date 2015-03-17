var server = require("../base/index_multi");

var billing_client = require("./billing_client");
var game_server = require("./game_server");

var obj = {
	"billing_client" : {
		"is_server" : 0,
		"handler"  : billing_client.handler,
        "retry"   : 1
	},
	"game_server" :{
		"is_server" : 1,
		"handler" : game_server.handler,
        "zip":1,
		"retry"   : 1
	}
};

var app = server.start_server(obj,function(s){
    billing_client.server(s);
	game_server.server(s);
});
