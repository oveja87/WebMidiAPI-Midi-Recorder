var notes = new Array();
var millisec;

function add_note(note_number) {
	if (draw && !is_played(note_number)) {
		var note = new Note(note_number);
		notes.push(note);

		timer_worker.postMessage({
			'cmd' : 'request',
			'note' : notes.length - 1
		});
	}
}

function is_played(note_number) {

	for (var i = 0; i < notes.length; i++) {
		if (notes[i].note_number === note_number && notes[i].begin >= -1 && notes[i].end == -1) {
			return true;
		}
	}
	return false;
}

function remove_note(note_number) {
	if (draw) {
		var note_index = findNote(note_number);

		if (note_index > -1) {
			timer_worker.postMessage({
				'cmd' : 'request',
				'note' : note_index
			});
		}
	}
}

function findNote(note_number) {
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].note_number === note_number && notes[i].begin >= -1 && notes[i].end == -1) {
			return i;
		}
	}
	return -1;
}

// stage

init_stage(document.getElementById('canvas'), 800, 600, 2);

//record
var record = document.getElementById("record_btn");
var stop_record = document.getElementById("stop_btn");
var play_record = document.getElementById("play_btn");
var stop_play_record = document.getElementById("stop_play_btn");

var time = document.getElementById("time");
var timer_worker;

time.innerHTML = "00:00:00";

record.onclick = function() {
	// switch between Buttons
	if (record.value == "finish recording") {
		record.value = "start new record";
		finish_recording();

		//css
		stop_btn.classList.add("hidden");
		play_btn.classList.remove("hidden");
	} else {
		record.value = "finish recording";
		start_recording();

		//css
		stop_btn.classList.remove("hidden");
		play_btn.classList.add("hidden");
		stop_play_btn.classList.add("hidden");
	}
};

stop_record.onclick = function() {
	// switch between Buttons
	if (stop_record.value == "stop recording") {
		stop_record.value = "continue recording";
		stop_recording();
	} else {
		stop_record.value = "stop recording";
		continue_recording();
	}
};

play_record.onclick = function() {
	if (play_record.value = "play") {
		play_record.value = "replay";
	}
	start_playing();
	stop_play_btn.classList.remove("hidden");
};

stop_play_record.onclick = function() {
	// switch between Buttons
	if (stop_play_record.value == "stop playing") {
		stop_play_record.value = "continue playing";
		stop_playing();
	} else {
		stop_play_record.value = "stop playing";
		continue_playing();
	}
};

function start_recording() {

	notes = new Array();

	timer_worker = new Worker('js/timer_task.js');

	addtimerEventListener();

	timer_worker.postMessage({
		'cmd' : 'start'
	});

	start_drawing(notes);
}

function continue_recording() {
	addtimerEventListener()

	timer_worker.postMessage({
		'cmd' : 'continue'
	});

	start_drawing(notes);
}

function stop_recording() {
	timer_worker.removeEventListener();
	timer_worker.postMessage({
		'cmd' : 'stop'
	});

	stop_drawing();
}

function finish_recording() {
	// terminate Worker
	timer_worker.removeEventListener();
	timer_worker.postMessage({
		'cmd' : 'close'
	});

	stop_drawing();
}

function addtimerEventListener() {
	timer_worker.addEventListener('message', function(e) {
		if (e.data.note > -1) {
			millisec = e.data.time;
			var note_index = e.data.note;
			if (notes[note_index].begin > -1) {
				notes[note_index].end = millisec;
			} else {
				notes[note_index].begin = millisec;
			}

			console.log("note  " + notes[note_index].note_number + " from " + notes[note_index].begin + " ms to " + notes[note_index].end + " ms");
		} else {
			time.innerHTML = e.data.time;
		}
	}, false);
}
