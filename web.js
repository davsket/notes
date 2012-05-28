var express = require('express'),
	routes = require('./routes'),
	app = express.createServer(express.logger());

// console.log(redis.get('hola',function(e,v){console.log(v+'++++++++++++++');}))

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/save/access_token', routes.save_token);

app.all('/', routes.index);
app.all('/load', routes.load);
app.post('/test', routes.email);




// app.post('/load/', function(request, response) {
// 	console.log('----------------------');
// 	var shortNote = '';
// 	console.log(request.body.notes);
// 	response.redirect('/');
// });

// app.get('/load/', function(request, response) {
// 	console.log('----------------------g');
// 	var shortNote = '';
// 	console.log(request.body.notes);
// 	response.redirect('/');
// });

// app.use(express.static(__dirname+'/static'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});