//#include https://ajax.googleapis.com/ajax/libs/prototype/1.7.2.0/prototype.js
//#include https://code.jquery.com/ui/1.11.0/jquery-ui.min.js
//NOTE: $() is reserved for Prototype, jQuery must use jQuery() format
//#include js/model/EntityModel.js


/**
 * Class for controlling entities
 */
var EntityController = Class.create({
	initialize: function( targetEntity ) {
		this.pEntity = targetEntity;
		
		this.isGrounded = false;
		this.doubleJumped = false;
		
		this.joystick = { r:false, u:false, d:false, l:false,
				getX:function() {
					var v = 0;
					if(this.r) v += 1;
					if(this.l) v -= 1;
					return v;
				},
				getY:function() { 
					var v = 0;
					if(this.d) v += 1;
					if(this.u) v -= 1;
					return v;
				},
				
				draw: function(g, x,y) {
					if(this.u) g.drawRect(x + 10, y + 10,10,10);
					if(this.d) g.drawRect(x + 10, y + 30,10,10);
					if(this.l) g.drawRect(x +  0, y + 20,10,10);
					if(this.r) g.drawRect(x + 20, y + 20,10,10);
				}
	 };
		
	},
	
	resurrectionTime: 3.0, //3 seconds
	
	update: function(ct) {
		if(this.pEntity.isDead) {
			if(this.pEntity.deadTime + this.resurrectionTime < ct) {
				//time to resurrect
				var app = Service.get("app");
				var physics = Service.get("physics");
				
				var spawnPt = app.ssWorld.map.GetSpawnFurthestFrom(this.pEntity.x, this.pEntity.y);
				this.pEntity.Resurrect(ct, spawnPt.x, spawnPt.y, physics);
			}
			return;
		}
		
		var joystick = this.joystick;
		var body = this.pEntity.body;
		var bodyBounds = body.GetFixtureList().GetAABB(); 
		
		var wasGrounded = body.GetUserData().grounded;
		
		var joyX = joystick.getX() * 20;
		var joyY = joystick.getY() * 20;
		
		//force 'up' off (player cannot hold key down to jump multiple times)
		joystick.u = false;
		
		//test jumping/falling/grounded
		var isGrounded = false;
		var contactList = body.GetContactList();
		if( !contactList ) {
			//vconsole.log("free as a bird");
		}else {
			
			while(contactList) {
				var contact = contactList.contact;
				var other = contactList.other;
				if( contact.IsEnabled() && other.GetType() == b2Body.b2_staticBody ) {
					//only interested in player vs world here
					var groundBounds = other.GetFixtureList().GetAABB();
					
					if( bodyBounds.upperBound.y >= groundBounds.lowerBound.y ) {
						//player is above this contact
						//console.log(" player Y " + bodyBounds.upperBound.y + " vs other Y " + groundBounds.lowerBound.y );
						isGrounded = true;
						break;
					}
				}
				
				//move forward on contact list
				contactList = contactList.next;
			}
		}
		
		//update physics 'grounded' state
		body.GetUserData().grounded = isGrounded;

		//get current force, subtract goal force to get delta force
		var cv = body.GetLinearVelocity();
		
		//var wasMovingUp = cv.y < 0; //moving up
		
		//handle jump allowance
		if(joyY != 0) { //player wants to jump
			if(!isGrounded) { //if we're in air
				if(this.doubleJumped) { //no jumping if we already double jumped
					joyY = 0; 
				}
			}
			
			if(joyY != 0) { //okay we're jumping
				if(isGrounded) { //jumping off ground
					this.doubleJumped = false; //reset double jump allowance
				}
				else if(!this.doubleJumped) { //using our double jump allowance
					this.doubleJumped = true;
				}
				else { //shouldnt reach this
					joyY = 0; //but just in case
				}
			}
		}

		//apply joystick X to velocity (weight against current X velocity)
		cv.x = cv.x * 0.7 + joyX * 0.4;
		if(joyY != 0) cv.y = joyY; //only apply jump velocity on jump (otherwise keep full current Y velocity)
		body.SetAwake(true);
		body.SetLinearVelocity(cv);
		//body.ApplyImpulse({ x: joyX, y: joyY }, body.GetWorldCenter());
		//body.ApplyForce({ x: forceX, y: forceY }, body.GetWorldCenter());

		//determine facing to render sprite flipping later
		if(cv.x < -0.1) this.pEntity.facingRight = false;
		if(cv.x > 0.1) this.pEntity.facingRight = true;
		
		var leftGround = wasGrounded && !isGrounded;
		var hitGround = !wasGrounded && isGrounded;
		var stayedGround = wasGrounded && isGrounded;
		
		//handle animation control
		if(stayedGround) {
			if(cv.x == 0 && cv.y == 0) {
				this.pEntity.animInstance.event(ct, "idle");
			}else if(cv.x != 0 && this.pEntity.animInstance.currAnim == "idle") {
				this.pEntity.animInstance.event(ct, "walk");
			}
		}
		else if(leftGround) {
			if(cv.y >= 0) {  //moving down
				this.pEntity.animInstance.event(ct, "fall"); //start falling anim
			}else { //moving up
				this.pEntity.animInstance.event(ct, "jump"); //start jumping anim
			}
		}
		else if(hitGround) { //landed on ground
			this.pEntity.animInstance.event(ct, "idle"); //todo: create 'landed' anim
		}
		else { //in air
			//detect switch from 'jump' to 'fall'
			if(cv.y >= 0 && this.pEntity.animInstance.currAnim == "jump" ) {
				this.pEntity.animInstance.event(ct, "fall");
			}
		}
	}
	
});