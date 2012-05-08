var express = require('express'),
	app = express.createServer(express.logger()),
	email = require('mailer'),
	redis = require('redis-url').connect(process.env.REDISTOGO_URL),
	myEmail = 'foo@foo.com',
	myPassword = 'le_password';

app.use(express.static(__dirname+'/'));
app.use(express.bodyParser());

//Getting the application's email and password 
redis.get('notesapp_email', function(err, value) {
	myEmail = value;
});
redis.get('notesapp_email_password', function(err, value) {
	myPassword = value;
});

app.post('/test', function(request, response) {
	var shortNote = request.body.note.replace(/<\/?[^<>]+>/g,'').substring(0,15);

	shortNote = shortNote.length > 15 ? shortNote + '...' : shortNote;

	email.send(
		{
			host : "smtp.gmail.com",            // smtp server hostname
			port : "25",                     	// smtp server port
			domain : "davset.me",            	// domain used by client to identify itself to server
			to : request.body.email,
			from : "no-reply@davsket.me",
			subject : "Shared note: " + shortNote,
			template : "email.html.txt",   		// path to template name
			username: myEmail,
			password: myPassword,
		    data : {
		      "text": request.body.note
		    },
			authentication : "login",        	// auth login is supported; anything else is no auth
		},
		function(err, result){
			if(err){ 
				console.log(err); 
			}
		}
	);

  	response.send(req.query.note);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});