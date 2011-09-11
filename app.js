/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// set variables
var round, shuffledList;

/**
 * sockets - two way communication
 ***************************************/
io.sockets.on('connection', function (socket) {

	//receive current round from master
	socket.on('post-round', function (data) {
		round = parseInt(data.round);
		
		// send current number to all clients
		io.sockets.emit('get-number', { number: shuffledList[(round - 1)] });	
	});
	
	// receive shuffledList
	socket.on('post-list', function (data) {
		shuffledList = data.shuffledList;	
	});	
	
	// receive shuffledList
	socket.on('post-banko', function (data) {
		console.log(data.clientName);	
	
		// send banko alert to all clients	
		io.sockets.emit('get-banko', { clientName: data.clientName });
	});		
	
	// receive restart
	socket.on('post-restart', function (data) {
		round = null;
		shuffledList = null;
		
		// send restart msg to all clients	
		io.sockets.emit('get-restart', { restart: true });
	});		
});		

/*
 *  master controller
 ********/
app.get('/master', function(req, res){
  res.render('master', {
    title: 'MASTER',
    round: round,
    pastNumbers: getPastNumbers()
  });
});

/* 
 * spectator
 ****/ 
app.get('/spectator', function(req, res){
	res.render('spectator', {
		title: 'SPECTATOR',
	    round: round,		
		pastNumbers: getPastNumbers()
	});
});

/* 
 * responsible
 ****/ 
app.get('/responsible', function(req, res){
	res.render('responsible', {
		title: 'RESPONSIBLE',
	    round: round,		
		pastNumbers: getPastNumbers()
	});
});


/**
 * numbers from the current game
 *****/
function getPastNumbers(){
	var pastNumbers;
	if(round != null){	
		pastNumbers = shuffledList.slice(0, round);
	}
	
	return pastNumbers;
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
