//#include https://ajax.googleapis.com/ajax/libs/prototype/1.7.2.0/prototype.js
//#include https://code.jquery.com/ui/1.11.0/jquery-ui.min.js
//NOTE: $() is reserved for Prototype, jQuery must use jQuery() format

/**
 * Animation class represents a RESOURCE which describes an animation state graph
 * 
 * AnimationInstance class represents an INSTANCE of the Animation class with state
 *  variables specific to that instance.
 * 
 * Sending an appropriate EVENT to an Animation instance will cause it to move from
 *  the current animation state to the next.
 * When an animation state completes, the "end" event is sent, which it can use to 
 *  automatically transition to a new state, or continue looping.
 */

var Animation = Class.create({
	initialize: function() {
		this.events = ["end"];
		this.graph = {
			"idle":{ fps:5, transitions:{"end":"idle"} }
		};
		this.defaultAnim = "";
		this.sprites = {};
		
	},
	
	verbose: false,
	
	LoadFromJson: function( dataJson ) {
		this.events = dataJson.events;
		this.graph = dataJson.graph;
		this.defaultAnim = dataJson.defaultState;
	},
	
	//For each state $s try to AttachSprite( $s, baseName + $s + extName )
	QuickAttach: function( baseName, extName, fnOnComplete ) {
		var RP = Service.get("rp");
		var self = this;
		var imgsDownloading = 0;
		for( var state in this.graph ) {
			imgsDownloading++;
			if(this.verbose) console.log("get sprite "+ state);
			
			(function(stateName){
				RP.getSprite( baseName + state + extName, function(e){
					if(this.verbose) console.log("got sprite for state " + stateName);
					var sprite = e.res;
					if(sprite) {
						self.AttachSprite(stateName, sprite);
						imgsDownloading--;
						
						if(fnOnComplete && imgsDownloading == 0) {
							fnOnComplete();
						}
					}
				});
			}(state));

		}
	},
	AttachSprite: function( animState, sprite ) {
		if(this.verbose) console.log("attach sprite for " + animState)
		this.sprites[animState] = sprite;
	},
	
	CreateInstance: function() {
		return new AnimationInstance(this);
	}
});

var AnimationInstance = Class.create({
	initialize: function( animation ) {
		this.pAnimation = animation;
		this.startTime = 0;
		this.currAnim = "null";
		
		//frame index of sprite to draw, refreshed in update()
		this.drawFrame = 0;
		this.drawSprite = null;
		this.startAnim(0, this.pAnimation.defaultAnim);
	},
	
	event: function ( ct, event ) {
		var state = this.pAnimation.graph[ this.currAnim ];
		var next = state[event];
		if(next) {
			//console.log("anIn move from " + this.currAnim + " to " + next);
			this.startAnim(ct, next);
			return true;
		}else {
			if(event != this.currAnim) console.warn("failed to handle event "+ event)
		}
		return false;
	},
	startAnim: function( ct, animState ) {
		animState = animState || this.pAnimation.defaultAnim;
		this.currAnim = animState;
		this.startTime = ct;
		
		this.drawFrame = 0;
		this.drawSprite = this.pAnimation.sprites[ this.currAnim ];
		
		if(!this.drawSprite) {
			console.warn("no sprite for startAnim("+animState+")");
		}
	},
	
	update: function( ct ) {
		//var state = this.graph[ this.currAnim ];
		var sprite = this.drawSprite;
		var numFrames =  sprite.getNumFrames();
		var animLengthS = numFrames / sprite.getFPS();
		var dt = ct - this.startTime;
		
		if(dt > animLengthS) {
			//handle end of animation
			var endTime = this.startTime + animLengthS;
			//console.log("anim " + this.currAnim + " ended")
			this.event(endTime, "end");
			return;
		}
		else {
			this.drawFrame = Math.floor((dt / animLengthS) * numFrames);
		}
	},
	
	draw: function(gfx, x, y, hFlip) {
		this.drawSprite.drawFrame(gfx, x,y, this.drawFrame, hFlip);
	},
	
	getCurrentSprite: function() {
		return this.drawSprite;
	}
	
	
});