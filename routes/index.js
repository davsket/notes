/**
 * Notes Views
 */
var email = require('mailer'),
	redis = require('redis-url').connect(process.env.REDISTOGO_URL),
	myEmail = 'foo@foo.com',
	jade = require('jade'),
	myPassword = 'le_password'

//Getting the application's email and password 
redis.get('notesapp_email', function(err, value) {
	myEmail = value;
});
redis.get('notesapp_email_password', function(err, value) {
	myPassword = value;
});


exports.index = function(req, res){
	var notes = req.body.notes
	console.log(notes)
	res.render('index', {notes: notes, firstTime: 'yeah'})
};

exports.email = function(request, response) {
	var shortNote = '';
	console.log(request);
	if(request.body.note && request.body.email){
		shortNote = request.body.note.replace(/<\/?[^<>]+>/g,'').substring(0,15);
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

	  	response.send('{"status": true, "message": "ok, email sent"}');	
	}else{
		response.send('{"status": false, "message": "not enough params"}');
	}
};


function redisLog(err, value){
	if(err)
		console.error(err)
	else
		console.log(value)
}