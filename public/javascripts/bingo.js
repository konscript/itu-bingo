// Variables
var sortedList=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];

var shuffledList,
	round,
	clientName;

/*
 * Document ready
 *************************/
$(document).ready(function() {
	// ask for client name
	clientName=prompt("Please enter your (bus) name","Bus ");

	// if game is already started fetch values
	gameAlreadyStarted();

	// new number button
	$('#get-number').click(function(event) {
		getNumber();
	});	
	
	// restart button
	$('#restart-game').click(function(event) {
		restartGame();
	});		
	
	// banko alert button
	$('#alert-banko').click(function(event) {
		alertBanko();
	});		
	
	// start game button	
	$('#start-game').click(function(event) {
		// shuffle list and send to server
		shuffledList = shuffle(sortedList);
	    socket.emit('post-list', { shuffledList: shuffledList });		
		round = 0;
				
		updateControls();
	});
});

/*
 * update controls
 ******/
function updateControls(){
	$('p.button.pre-game').hide('slow');
	$("p.button.in-game").fadeIn();
}

// send banko alert to server
function alertBanko(){
    socket.emit('post-banko', { clientName: clientName });		
}

function restartGame(){
	delete round;
    socket.emit('post-restart', { restart: true });	
    $("#all-numbers").empty();
    $('#start-game').trigger('click');
}

/*
 * Game already started
 **********/
 function gameAlreadyStarted(){
 	if($("#round").val() != ""){ 	
	
		// get current round
		round = $("#round").val();
		
		// update control buttons
		updateControls();		
		
		// add pastNumbers
		var pastNumbers = $("#pastNumbers").val().split(",");
		$.each(pastNumbers, function(i,item) {
			var elm = $("<span></span>").addClass("number").text(item);
			$('#all-numbers').prepend(elm);	
		});
	}else{
		//alert("Game has not yet started - please wait for master!");
	}
 }

/**
 *  get new number
 *********************************/
function getNumber(){

	// has game ended?
	if(round>sortedList.length){
		alert("Spillet er slut!");
		return false;
	}	
	
	// increment round
	round++;   	
	
	// post the current number to server
    socket.emit('post-round', { round: round });	
}

/**
 * all clients (incl. master) receiving number
 *******************************************/

var server = window.location.hostname;
var socket = io.connect(server + ":3000");

// get current number
socket.on('get-number', function (data) {
	// insert current number	
	var elm = $("<span></span>").addClass("number").text(data.number);
	$('#all-numbers').prepend(elm);			
});

// get banko alert
socket.on('get-banko', function (data) {
	$('#banko-msg').text("Der er banko hos: "+ data.clientName).fadeIn("fast").delay(10000).fadeOut("slow");
});

/**
 *  shuffles list in-place
 ****************************************/
function shuffle(list) {
  var i, j, t;
  for (i = 1; i < list.length; i++) {
    j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
    if (j != i) {
      t = list[i];                        // swap list[i] and list[j]
      list[i] = list[j];
      list[j] = t;
    }
  }
  return list;
}