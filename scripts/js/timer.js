/* 
    Document   : timer.js
    Created on : 06/06/2017, 10:01:00
    Author     : Alan Dennis Eaton <alan.dennis.eaton@gmail.com>
*/

'use strict';

//============================================================
//	Timer :: Module
//
//	minimum 1/100 second resolution
//
//============================================================


util.Timer = (function (){


//------------------------------------------------------------
// imports

var global       = util.global;
var nothing      = util.nothing;
var ifNumber     = util.ifNumber;
var ifFunction   = util.ifFunction;
var ifObject     = util.ifObject;
var ifDefined    = util.ifDefined;
var isDefined    = util.isDefined;

var setTimeout   = global.setTimeout;
var clearTimeout = global.clearTimeout;


//------------------------------------------------------------
//	Timer :: Class

function tick(timer, delta) {
	timer.timeoutId = setTimeout (
		function() {
			timer.waiting = false;
			triggerAction(timer);
		},
		delta
	);

	timer.waiting = true;
}

function startTicking(timer) {
	var now      = Date.now();
	var from     = timer.from;
	var period   = timer.period;
	var nextTick = Math.floor((now-from)/period) + 1;

	if (nextTick < 0) {
		// now < from
		// wait until from
		nextTick = 0;
	}

	timer.nextTick = nextTick;
	
	tick(timer, from + nextTick*period - now);

	timer.started = true;
}

function resumeTicking(timer) {
	var now      = Date.now();
	var from     = timer.from;
	var period   = timer.period;
	var nextTick = Math.floor((now-from)/period) + 1;

	if (nextTick <= timer.lastTick) {
		// might happen!
		// depends on the accuracy of browser timeouts
		// and whether modified by code
		nextTick = timer.lastTick + 1;
	}

	timer.nextTick = nextTick;
	
	tick(timer, from + nextTick*period - now);
}

function stopTicking(timer) {
	if (timer.waiting) {
		clearTimeout(timer.timeoutId);
		timer.timeoutId = null;

		timer.waiting = false;
	}
}

function triggerAction(timer) {
	timer.currentTick = timer.nextTick;
	timer.nextTick = null;
	
	timer.action.call(timer.context, timer);

	timer.lastTick = timer.currentTick;
	timer.currentTick = null;

	if (timer.repeats) {
		if (timer.active) { resumeTicking(timer); }
	}
	else {
		timer.active = false;
	}
}


class Timer {
	constructor(action, context) {	
		this.initialise();

		this.action  = ifFunction(action, nothing);
		this.context = ifObject(context, {});
	}

	initialise(period) {
		this.repeats = false;
		this.active = false;

		this.lastTick = null;
		this.currentTick = null;
		this.nextTick = null;

		this.started = false;
		this.waiting = false;
		
		this.from = 0;
		this.period = Timer.MINUTE;
	}

	setFrom(from) {
		if (!this.started) {
			let d = new Date(from).getTime();
		
			this.from = (d || d === 0)? d: Date.now();
		}
		
		return this;
	}

	getFrom() {
		return this.from;
	}
	
	setPeriod(period) {
		if (!this.started) {
			this.period = Math.max(ifNumber(period, 0), Timer.RESOLUTION);
		}

		return this;
	}
	
	getPeriod() {
		return this.period;
	}
	
	start() {
		if (!this.started) {
			startTicking(this);

			this.active = true;
		}
		
		return this;
	}
	
	pause() {
		if (this.started) {
			if (this.active) {
				stopTicking(this);
				this.active = false;
			}
		}

		return this;
	}
	
	resume() {
		if (this.started) {
			if (!this.active) {
				resumeTicking(this);
				this.active = true;
			}
		}

		return this;
	}

	stop() {
		if (this.started) {
			this.pause();
			this.initialise();
		}

		return this;
	}

	repeat() {
		if (!this.started) {
			this.repeats = true;
		}
		
		return this;
	}
	
	isRepeating() {
		return this.repeats;
	}
	
	getContext() {
		return this.context;
	}
	
	getCurrentTick() {
		return this.currentTick || this.lastTick || 0;
	}
	
	getCurrentTime() {
		return this.getFrom() + this.getCurrentTick()*this.getPeriod();
	}
	
	getDate() {
		return new Date(this.getTime());
	}
	
}


//------------------------------------------------------------
Timer.SECOND   = 1000; // *Timer.MILLISECOND
Timer.MINUTE   = 60*Timer.SECOND;
Timer.HOUR     = 60*Timer.MINUTE;
Timer.DAY      = 24*Timer.HOUR;
Timer.WEEK     = 7*Timer.DAY;
Timer.MONTH28  = 28*Timer.DAY;
Timer.MONTH29  = 29*Timer.DAY;
Timer.MONTH30  = 30*Timer.DAY;
Timer.MONTH31  = 31*Timer.DAY;
Timer.YEAR     = 365*Timer.DAY;
Timer.LEAPYEAR = Timer.YEAR + Timer.DAY;

Timer.RESOLUTION = Timer.SECOND/100;


//------------------------------------------------------------
return Timer;


//------------------------------------------------------------
}());
