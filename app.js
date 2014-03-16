var express = require('express')
  , http = require('http')
  , request = require('request')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(app.router);
// app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
	url = "https://jawbone.com/auth/oauth2/auth?response_type=code&client_id="+process.env.JAWBONE_ID+"&scope=basic_read move_read&redirect_uri=http://localhost:3000/home"
	res.redirect(url);
});

app.get('/home', function(req, res){
	var access_code = req.url.split("=")[1];
	request.post("https://jawbone.com/auth/oauth2/token?client_id="+process.env.JAWBONE_ID+"&client_secret="+process.env.JAWBONE_SECRET+"&grant_type=authorization_code&code="+access_code, function (e, r, body){
		req.session.token = JSON.parse(body).access_token;
		var options = {access_token: req.session.token};
		var up = require('jawbone-up')(options);
		up.moves.get({}, function(req, moves_data){
			res.send(moves_data);
			// var move_xid = JSON.parse(moves_data).meta.user_xid;
			// up.moves.snapshot({ xid : move_xid }, function(req, intensity_data){
			// 	res.send(intensity_data);
			// })
		})  
	})
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
