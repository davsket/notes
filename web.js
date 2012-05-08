var express = require('express'),
	app = express.createServer(express.logger()),
	email = require('mailer'),
	redis = require('redis-url').connect(process.env.REDISTOGO_URL);

app.use(express.static(__dirname+'/'));

app.get('/test', function(request, response) {
	var req = require('url').parse(request.url, true),
		shortNote = req.query.note.replace(/<\/?[^<>]+>/g,'').substring(0,15);
	

	redis.set('foo', 'bar');

	redis.get('foo', function(err, value) {
		console.log('foo is: ' + value);
	});

	shortNote = shortNote.length > 15 ? shortNote + '...' : shortNote;

	// email.send(
	// 	{
	// 		host : "smtp.gmail.com",            // smtp server hostname
	// 		port : "25",                     	// smtp server port
	// 		domain : "davset.me",            	// domain used by client to identify itself to server
	// 		to : req.query.email,
	// 		from : "no-reply@davsket.me",
	// 		subject : "Shared note: " + shortNote,
	// 		template : "email.html.txt",   // path to template name
	// 	    data : {
	// 	      "text": req.query.note
	// 	    },
	// 		authentication : "login",        	// auth login is supported; anything else is no auth
	// 	},
	// 	function(err, result){
	// 		if(err){ 
	// 			console.log(err); 
	// 		}
	// 	}
	// );

  	response.send(req.query.note);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});