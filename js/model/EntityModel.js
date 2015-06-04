//#include https://ajax.googleapis.com/ajax/libs/prototype/1.7.2.0/prototype.js
//#include https://code.jquery.com/ui/1.11.0/jquery-ui.min.js
//NOTE: $() is reserved for Prototype, jQuery must use jQuery() format
//#include js/framework/Graphics.js

function WorldToPhysCoords( x, y ) {
	return new b2Vec2( x / b2Scale, y / b2Scale );
};

var EntityModel = Class.create({
	initialize: function( _uuid ) {
		this.uuid = _uuid || uuid.v4();
		this.sprite = null;
		this.animInstance = null;
		this.body = null;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.isDead = false;
		this.deadTime = 0;
		
		this.facingRight = true;
	},
	
	SerializeState: function() {
		var cv = this.body.GetLinearVelocity();
		var stateJson = {
			uuid:this.uuid,
			x:this.x,
			y:this.y,
			velX:cv.x,
			velY:cv.y,
			dead:this.isDead,
			deadTime:this.deadTime,
			facing:this.facingRight,
		};
		
		return stateJson;
	},
	UpdateFromSeralizedState: function(fromTime, currentTime, stateJson) {
		//TODO: extrapolate xy(ct) from xy(ft) + velXY(ct-ft)
		 /// but what if the motion would have resulted in a collision??? 
		 
		 //center 
		 var cx = this.x + this.width/2;
		 var cy = this.y + this.height/2;
		 var physPos = WorldToPhysCoords(cx, cy);
		
		this.body.SetPosition(physPos);
		this.body.SetLinearVelocity(new b2Vec2(stateJson.velX, stateJson.velY));
		
		//apply to self and body
		
		this.dead = stateJson.dead;
		this.deadTime = stateJson.deadTime;
		this.facing = stateJson.facing;
	},
	
	AttachAnimation: function( animation, updateSize ) {
		updateSize = updateSize || true;
		this.animInstance = animation.CreateInstance();
		
		if(updateSize) {
			this.width = this.animInstance.getCurrentSprite().getWidth();
			this.height = this.animInstance.getCurrentSprite().getHeight();
		}
	},
	
	AttachSprite: function( sprite, updateSize ) {
		updateSize = updateSize || true;
		this.sprite = sprite;
		
		if(updateSize) {
			this.width = sprite.getWidth();
			this.height = sprite.getHeight();
		}
	},
	
	AttachPhysics: function (physics) {
		this.body = physics.createDynamic(this.x, this.y, this.width, this.height, false, this);
	},
	DetatchPhysics: function (physics) {
		physics.destroyBody(this.body);
		this.body = null;
	},
	
	
	Die: function(ct, physics) {
		if(this.isDead) {
			console.warn("already died");
			return;
		}
		this.isDead = true;
		this.deadTime = ct;
		this.DetatchPhysics(physics);
		if(this.animInstance) this.animInstance.event(ct, "dead");
	},
	Resurrect: function(ct, x,y, physics) {
		if(!this.isDead) {
			console.warn("already alive");
			return;
		}
		this.isDead = false;
		this.x = x;
		this.y = y;
		this.AttachPhysics(physics);
		this.animInstance.startAnim(ct, "idle");
	},
	
	AnimEvent: function( ct, animState ) {
		if(this.animInstance) {
			return this.animInstance.event(ct, animState);
		}
		return false;
	},
	
	Draw: function( gfx, offsetX, offsetY ) {
		if(this.animInstance) {
			this.animInstance.draw(gfx, offsetX + this.x, offsetY + this.y, !this.facingRight );
		}
		else if(this.sprite) {
			this.sprite.drawFrame(gfx, offsetX + this.x, offsetY + this.y, 9); //xxx: hardcoded frame index
		}
		else {
			gfx.drawCircle(offsetX + this.x, offsetY + this.y, this.width/2);
		}
	},
	Update: function( dt, ct ) {
		if(this.body) {
			this.x = (this.body.GetPosition().x * b2Scale) - this.width/2;
			this.y = (this.body.GetPosition().y * b2Scale) - this.height/2;
		}
		
		if(this.animInstance) {
			this.animInstance.update(ct);
		}
	}
});