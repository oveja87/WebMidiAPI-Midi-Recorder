# Equalizer
------------------------------------------

This is a demo how to record and visualize midi input with a midi-keyboard in google chrome. 

## Features

* Connect your midi-keyboard or -piano to play it in the browser (Synth Template)
* if you don't have any midi-device you can also use the keyboard of your laptop or the mouse pointer to play 
	(Synth Template) [Keyboard Shortcuts](https://dl-web.dropbox.com/get/Public/keyboard.svg?w=AADDsjY9DRTSjxA8fQ5ZXHR5ZFq44bU6GDa8JXSgr0yDVQ)
* the interface shows two octaves of a keyboard which highlightes the actual played notes (Synth Template)
* there is a record funtion which displays each played note on a canvas 
* the recorder includes a function to stop and continue recording
* if recording is finished you can play the recorded notes
* playing includes functions to stop, continue and replay.
* a timer shows the time of the actual recording


## Technologies

* Javascript
* [Web MIDI API](https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html)
* [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
* HTML5 Canvas Animations
* HTML5 Web Worker
* HTML/CSS


##[Web MIDI API](https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html)

This specification defines an API supporting the MIDI protocol, enabling web applications to enumerate and select MIDI input and output devices on the client system and send and receive MIDI messages. It is intended to enable non-music MIDI applications as well as music ones, by providing low-level access to the MIDI devices available on the users' systems. At the same time, the Web MIDI API is not intended to become a semantic controller platform; it is designed to expose the mechanics of MIDI input and output interfaces, and the practical aspects of sending and receiving MIDI messages, without identifying what those actions might mean semantically. 


## [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)

This specification describes a high-level JavaScript API for processing and synthesizing audio in web applications. The primary paradigm is of an audio routing graph, where a number of AudioNode objects are connected together to define the overall audio rendering. The actual processing will primarily take place in the underlying implementation (typically optimized Assembly / C / C++ code), but direct JavaScript processing and synthesis is also supported. 


## HTML5 Canvas

The Canvas provides an area to draw bitmap graphics by using javascript. I used it to animate the played notes on the screen.


## HTML5 Web Worker

The Web Worker allows to execute javascript parallel. I used it for the timer. So it can always run in the background.

The Webworker is created as an object with a javascript-file-path as argument and started with the postMessage()-method. To communicate between the main script and the worker eventlistener has to be added.

### Example from [www.HTML5rocks.com](http://www.html5rocks.com/de/tutorials/workers/basics/)
Main script:
		var worker = new Worker('doWork.js');

		worker.addEventListener('message', function(e) {
		  console.log('Worker said: ', e.data);
		}, false);

		worker.postMessage('Hello World'); // Send data to our worker.

doWork.js:
		self.addEventListener('message', function(e) {
		  self.postMessage(e.data);
		}, false);

To use the Worker, the site has to be running on a server.


## [SynthTemplate](https://github.com/cwilso/SynthTemplate)

The Equalizer uses the [SynthTemplate](https://github.com/cwilso/SynthTemplate) by cwilso as it's basic code.

This is a template for building synthesizers built on the [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html).  It is intended to build polyphonic synthesizers (although it can be easily adapted - monophonic is actually a bit easier).

This uses [Web MIDI Polyfill](https://github.com/cwilso/WebMIDIAPIShim) to add MIDI support via the [Web MIDI API](https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html) - in fact, I partly wrote this as a test case for the polyfill and the MIDI API itself, so if you have a MIDI keyboard attached, check it out.  The polyfill uses Java to access the MIDI device, so if you're wondering why Java is loading, that's why.  It may take a few seconds for MIDI to become active - the library takes a while to load - but when the ring turns gray (instead of blue), it's ready.  If you have a native implementation of the Web MIDI API in your browser, the polyfill shouldn't load - but at the time of this writing, there are no such implementations.

This incorporates the [PointerEvents polyfill](https://github.com/toolkitchen/PointerEvents) for pointer events, rather than using mouse events directly, in order to work well on touch screens.


## Recorder

### Init Canvas
To use the player, the init_stage function has to be called first. It inits the canvas and creates a new stage object. It also produces the lines which you can see on the canvas after loading the site. The lines help the user to better see the animation. As parameters there is the canvas-element, the speed of the animation and the number of lines shown on the canvas. The lines are saved as objects in the array 'lines'.

		function init_stage(canvas, speed, no_lines) {

		var canvas = canvas;

		canvas.width = WIDTH;
		canvas.height = HEIGHT;		
		
		stage = new Stage();
		
		context = canvas.getContext("2d");
		
		this.speed = speed;
		this.no_lines = no_lines;

		// create set of lines
		for (var i = 0; i < no_lines; i++) {
			lines.push(new Line(i));
		}

		stage.render();		
	}
	
	init_stage(document.getElementById('canvas'), 2, 10);

### Canvas Animations
The init_stage method and all the other methods which are needed to draw something on the canvas are in the stage.js. There ar functions to stop and start recording and playing and also function to play and stop playing the sounds.
Like the lines, also the notes are saved as objects in an array called 'notes'.	The lines and notes have all the properties which are needen to save and animate the played notes. They also have the functions 'calc' and 'draw' each. Through those methods the render function of the stage object can do the animations within the stage.	
The following code uses the requestAnimationFrame polyfill by Erik Möller to render the frames: 

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
		
### Receive played notes and time
It is possible to receive notes from
* midi-device (with the help of webMIDIAPI.js)
* keyboard (with the help of an array of [keyboard shortcuts](https://dl-web.dropbox.com/get/Public/keyboard.svg?w=AADDsjY9DRTSjxA8fQ5ZXHR5ZFq44bU6GDa8JXSgr0yDVQ)
* mouse pointer (with the help of pointerevents.js)

By clicking/pressing a key the method add_note() and by releasing the pointer/key the method remove_note() is called. This methods adds the played note to the note array and sets timestamps for the begin and the end of playing this note. The timestamps are realized through the timer worker. The Worker also provides the current played time which is displayed on the interface. 

Post message an den timer worker:

		timer_worker.postMessage({
			'cmd' : 'request',
			'note' : note_index
		});
		
Eventlistener with different cases of the timer worker in timer_task.js:

		self.addEventListener('message', function(e) {
			var data = e.data;

			switch (data.cmd) {
				case 'start':
					stop = false;
					start_timer(data);
					break;
				case 'continue':
					stop = false;
					continue_timer(data);
					break;
				case 'request':
					self.postMessage({
						'time' : millisec,
						'note' : data.note
					});
					break;
				case 'stop':
					stop = true;
					break;
				case 'close':
					self.close();
					// Terminates the worker.
					break;
				default:
					self.postMessage('Unknown command: ' + data.msg);
			};

		}, false);

Eventlistener of the timer worker in recorder.js:

		timer_worker.addEventListener('message', function(e) {
			if (e.data.note > -1) {
				millisec = e.data.time;
				var note_index = e.data.note;
				if (notes[note_index].begin > -1) {
					notes[note_index].end = millisec;
				} else {
					notes[note_index].begin = millisec;
				}
			} else {
				time.innerHTML = e.data.time;  //message with e.data.time is received every second
			}
		}, false);

		
### Control recorder and player

To control the recorder and player functions there are buttons on the interface. They help to create the worker and add the eventlistener. They also handel which function is needed to draw on the canvas.

There are different states the player can have:
* do nothing
* recording
* recording stopped
* playing
* playing stopped

Some of the buttons are hidden or change their values in the different states of the player. So controlling the player should be quiet easy for the user.


## Extensions
There are a lot of possibilities how the equalizer could be extended. 

Some examples for possible extensions are to 
* including a synthesizer 
* choice of different kinds of instruments like guitars or drumsets
* possibility to edit a record
* save the recorded files
* ...


## Sources

* [SynthTemplate](https://github.com/cwilso/SynthTemplate)
* [Béla Varga - Workshop Javascript - Canvas Animations](https://github.com/netzzwerg/workshop-javascript/wiki/Canvas-Animations)
* [HTML5 Rocks - Web Worker Grundlagen](http://www.html5rocks.com/de/tutorials/workers/basics/)
* [Web MIDI API](https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html)
* [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)