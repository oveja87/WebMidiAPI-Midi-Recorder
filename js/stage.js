/*global  window,document,setInterval */

	var FPS = 30;
	var lines = [];
	var context = null;
	var stage = {};
	var NO_LINES = 10;
	var speed;
	var draw = false;
	var play = false;
	var played_notes = [];
	var time = 0;

	// STAGE Object
	function Stage(width, height) {
	    this.l = 0; // left
	    this.r = width; // right
	    this.t = 0; // top
	    this.b = height; // bottom
	}

	Stage.prototype = {

		render: function() {
			
			this.clear();
			 
			// draw each line
			for (var i = 0; i < lines.length; i++) {
				lines[i].calc();
				lines[i].draw();
			}
			 
			// draw each white note
			for (var i = 0; i <notes.length; i++) {
				if(notes[i].color == "#cccccc"){
					notes[i].calc();
					notes[i].draw();					
				}
			}
			
			// draw each black note
			for (var i = 0; i <notes.length; i++) {
				if(notes[i].color == "#666666"){
					notes[i].calc();
					notes[i].draw();					
				}
			}
			
			if(play && notes[notes.length-1].y+notes[notes.length-1].h < stage.b-10){
				stop_playing();
			}
		},

		clear: function() {
			context.fillStyle = '#ffffff';
			context.fillRect(0, 0, stage.r, stage.b);
		}

	};

	// LINE Object
	function Line(i) {
	    this.y = parseInt(i*stage.b/NO_LINES);
	}

	Line.prototype = {

		calc: function() {
				this.y -= parseInt(speed);
		    
			    if(this.y < 0){
			    	this.y = stage.b;
			    }
		},

		draw: function() {
			context.strokeStyle = '#cccccc';
			context.beginPath();
			context.moveTo(stage.l, this.y);
			context.lineTo(stage.r, this.y);
			
			context.stroke();
		}
	};

	// NOTE Object
	function Note(note_number) {
		this.note_number = note_number;
		this.begin = -1;
		this.end = -1;
		this.y = stage.b;
		this.w = 0;
		this.h = 0;
		
		this.x = 0;		
		
		// calculate this.x	
		var color = "";
		
		if( note_number == 60 ) {
			color = "white";
			this.x = 21;
		} else if( note_number == 61 ) {
			color = "black";
			this.x = 56;
		} else if( note_number == 62 ) {
			color = "white";
			this.x = 75;
		} else if( note_number == 63 ) {
			color = "black";
			this.x = 110;
		} else if( note_number == 64 ) {
			color = "white";
			this.x = 129;
		} else if( note_number == 65 ) {
			color = "white";
			this.x = 183;
		} else if( note_number == 66 ) {
			color = "black";
			this.x = 219;
		} else if( note_number == 67 ) {
			color = "white";
			this.x = 237;
		} else if( note_number == 68 ) {
			color = "black";
			this.x = 274;
		} else if( note_number == 69 ) {
			color = "white";
			this.x = 291;
		} else if( note_number == 70 ) {
			color = "black";
			this.x = 328;
		} else if( note_number == 71 ) {
			color = "white";
			this.x = 345;
		} else if( note_number == 72 ) {
			color = "white";		
			this.x = 399;	
		} else if( note_number == 73 ) {
			color = "black";	
			this.x = 437;		
		} else if( note_number == 74 ) {
			color = "white";	
			this.x = 453;		
		} else if( note_number == 75 ) {
			color = "black";
			this.x = 491;			
		} else if( note_number == 76 ) {
			color = "white";	
			this.x = 507;	
		} else if( note_number == 77 ) {
			color = "white";	
			this.x = 561;		
		} else if( note_number == 78 ) {
			color = "black";
			this.x = 601;		
		} else if( note_number == 79 ) {
			color = "white";		
			this.x = 615;		
		} else if( note_number == 80 ) {
			color = "black";
			this.x = 655;		
		} else if( note_number == 81 ) {
			color = "white";	
			this.x = 669;		
		} else if( note_number == 82 ) {
			color = "black";
			this.x = 709;		
		} else if( note_number == 83 ) {
			color = "white";	
			this.x = 723;		
		}
		
		if(color == "white"){
			this.w = 52;
			this.color = '#cccccc';
		} else {
			this.w = 32;
			this.color = '#666666';
		}
	}

	Note.prototype = {

		calc: function() {
			
			if(this.end === -1) {
			  	this.h += speed;
			   	this.y -= speed;
			} else {
			   	this.y -= speed;
			}		
						
		},

		draw: function() {
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.w, this.h);
		}
	};

	function init_stage(canvas, width, height, speed) {

		var canvas = canvas;
		stage = new Stage(width, height);

		canvas.width = width;
		canvas.height = height;
		context = canvas.getContext("2d");
		
		this.speed = speed;

		// create set of lines
		for (var i = 0; i < NO_LINES; i++) {
			lines.push(new Line(i));
		}

		stage.render();		
	}
	
	function start_drawing(){
		stop_playing();
		draw = true;
		
		// request animation frame
		var onFrame = window.requestAnimationFrame;

		function tick(timestamp) {
			stage.render();
			if(draw == true){
				onFrame(tick);
			}
		}

		if(draw == true){
			onFrame(tick);
		}
	}
	
	function stop_drawing() {
		draw = false;
	}
	
	function start_playing() {
		if(notes.length >0 ){
			draw = false;
			play = true;
			
			//set positions of notes to the beginn of the record				
			var totalheight = stage.b - notes[0].y;	 // find nullpoint by the first note in notes-array
			
			for (var i = 0; i <notes.length; i++) {
				notes[i].y += totalheight;
			}
			
			// request animation frame
			var onFrame = window.requestAnimationFrame;
	
			function tick(timestamp) {
				stage.render();
				play_notes();
				if(play == true){
					onFrame(tick);
				}
			}
	
			if(play == true){
				onFrame(tick);
			}			
		}			
	}
	
	function continue_playing() {
		draw = false;
		play = true;
		
		// request animation frame
		var onFrame = window.requestAnimationFrame;

		function tick(timestamp) {
			stage.render();			
			play_notes();
			if(play == true){
				onFrame(tick);	
			}
		}

		if(play == true){
			onFrame(tick);
		}
	}
	
	function stop_playing() {
		play = false;
		
		//stop playing notes
		for(i = 60; i <= 83; i++) {
			noteOff( i + 12*(3-currentOctave) );	
		}
	}
	
	function play_notes() {
		
		for(i = 60; i <= 83; i++) {
			var to_play = false;
			
			for(j = 0; j < notes.length; j++){
				if(notes[j].note_number == i && (notes[j].y + notes[j].h) > stage.b && notes[j].y < stage.b){
					to_play = true;
				}
			}
			
			if(to_play){
				noteOn( i + 12*(3-currentOctave), 0.75 );
			} else {
				noteOff( i + 12*(3-currentOctave) );
			}	
		}		
	}
