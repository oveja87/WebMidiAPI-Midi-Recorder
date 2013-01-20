var starttime = 0;
var millisec = 0;
var sec = 0;
var secstamp = 0;
var min = 0;
var hour = 0;
var stop = true;
var stoptime = 0;
var time = '00:00:00';

function start_timer() {
	starttime = new Date().getTime();
	timer();
}

function continue_timer() {
	var timenow = new Date().getTime();

	stoptime = (timenow - starttime) - millisec;

	timer();
}

function timer() {
	if (!stop) {
		setTimeout("set_new_time()", 1);
	}
}

function set_new_time() {
	// calculate new time
	var timenow = new Date().getTime();
	millisec = timenow - starttime - stoptime;

	var totalsec = parseInt(millisec / 1000);

	if (totalsec > secstamp) {
		secstamp = totalsec;
		calculate_time();
		self.postMessage({
			'time' : time,
			'note' : -1
		});
	}

	timer();
}

function calculate_time() {

	sec = secstamp % 60;

	if (sec < 0) {
		sec += 60;
	}
	if (sec == 0) {
		min++;
	}
	if (min > 59) {
		min -= 60;
		hour++;
	}

	//create new timestring
	time = "";

	if (hour < 10) {
		time = time + "0";
	}
	time = time + hour + ":";
	if (min < 10) {
		time = time + "0";
	}
	time = time + min + ":";
	if (sec < 10) {
		time = time + "0";
	}
	time = time + sec;
}

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

