
var bShowDebug = false;

app_create = function()
{
	var app = new Application("FuzzPop", "content", 'mlw7r9h3ult0529');
	window.app = app;
	
	var RP = Service.get("rp");
	//RP.loadImage("gfx/derpy.png");
	//RP.loadImage("css/images/comment.png");
	//RP.loadJson("data/fez1.json");
	//RP.loadSprite("gfx/derpy_walk.sprite");
	//RP.loadSprite("gfx/derpy_idle.sprite");
	
	var physics = Service.get("physics");
	app.ssWorld = new SideScrollModel(physics);
	app.ssWorld.LoadMap("data/fez1.json", function() {
		
		RP.getJson("gfx/derpy.anim", function(e){
			var derpyAnim = new Animation();
			derpyAnim.LoadFromJson(e.res);
			derpyAnim.QuickAttach("gfx/derpy_", ".sprite", function(){
				
				RP.setResource("derpyAnim", derpyAnim);
				
				app.resourcesComplete();
				
				/*
				var entity = new EntityModel();
				app.player1 = entity;
				var spawnPt = app.ssWorld.map.GetRandomSpawn();
				entity.x = spawnPt.x;
				entity.y = spawnPt.y;
				entity.AttachAnimation(derpyAnim);
				entity.AnimEvent(0, "idle");
				app.ssWorld.AddEntity(entity);
				
				var entityController = new EntityController(entity);
				app.p1c = entityController;
				
				var entity2 = new EntityModel();
				app.player2 = entity2;
				var spawnPt2 = app.ssWorld.map.GetSpawnFurthestFrom(spawnPt.x, spawnPt.y);
				entity2.x = spawnPt2.x;
				entity2.y = spawnPt2.y;
				entity2.AttachAnimation(derpyAnim);
				entity2.AnimEvent(0, "idle");
				app.ssWorld.AddEntity(entity2);
				
				var entityController2 = new EntityController(entity2);
				app.p2c = entityController2;
				*/
			});
		});
		
		
		/*
		RP.getSprite("gfx/derpy_walk.sprite", function(e){
			var sprDerpWalk = e.res;
			var entity = new EntityModel();
			app.player1 = entity;
			var spawnPt = app.ssWorld.map.GetSpawnPoint(0);
			entity.x = spawnPt.x;
			entity.y = spawnPt.y;
			entity.AttachSprite(sprDerpWalk);
			app.ssWorld.AddEntity(entity);
		});
		*/

	});
	
	app.resourcesComplete = function() {
		console.log("resource loading complete");
		
		var RP = Service.get("rp");
		//spawn player
				var entity = new EntityModel();
				app.player1 = entity;
				var spawnPt = app.ssWorld.map.GetRandomSpawn();
				entity.x = spawnPt.x;
				entity.y = spawnPt.y;
				entity.AttachAnimation(RP.getResource("derpyAnim"));
				entity.AnimEvent(0, "idle");
				app.ssWorld.AddEntity(entity);
				
				var entityController = new EntityController(entity);
				app.p1c = entityController;
				
		var mp = Service.get("mp");
		mp.StartPeerSession();
	}
	
	
	app.OnDraw = function( g, dtSeconds, ctSeconds ) {
		
		var RP = Service.get("rp");
		
		app.ssWorld.Draw(g, 0,0);
		
		//draw joystick state
		if(app.player1) {
			app.p1c.joystick.draw(g, 10,10);
			/*
			var velocity = app.player1.body.GetLinearVelocity();
			g.drawTextEx("player1: "+velocity.x +","+velocity.y, 10, 70, "12px Arial", "#FFFFFF");
			g.drawTextEx(" isGrounded: "+ app.player1.body.isGrounded(), 10, 85, "12px Arial", "#FFFFFF");
			*/
		}
		if(app.player2) {
			var pos = app.player2.body.GetPosition();
			var velocity = app.player2.body.GetLinearVelocity();
			g.drawTextEx("player2: "+pos.x+","+pos.y+":"+velocity.x +","+velocity.y, 10, 70, "12px Arial", "#FFFFFF");
			g.drawTextEx(" isGrounded: "+ app.player2.body.isGrounded(), 10, 85, "12px Arial", "#FFFFFF");
		}
		
		var px = Service.get("physics");
		if(bShowDebug) px.DrawDebug();
	};
	
	app.OnUpdateBegin = function( dt, ct ) {
		
		//apply joystick as impulse to player1
		if( app.p1c ) {
			app.p1c.update(ct);
		}
		if( app.p2c ) {
			//app.p2c.update(ct);
		}

		app.ssWorld.Update(dt, ct);
	}
	
	app.OnMouseDown = function(e, x, y) {
		//which button?
	}
	
	app.OnKeyDown = function(e) {
		if(!app.player1) return;
		switch(e.keyCode) {
			case KEY_RIGHT: 
				app.p1c.joystick.r = true; 
				break;
			case KEY_LEFT: 
				app.p1c.joystick.l = true; 
				break;
			case KEY_UP: 
				app.p1c.joystick.u = true; 
				break;
			case KEY_DOWN: 
				app.p1c.joystick.d = true; 
				break;
			case 'O'.charCodeAt(0):
				//bShowDebug = !bShowDebug;
				app.ssWorld.map.debugShowBoxes = !app.ssWorld.map.debugShowBoxes;
				break;
			case 'P'.charCodeAt(0):
				bShowDebug = !bShowDebug;
				break;
			case 'I'.charCodeAt(0):
				var t = new EntityModel();
				t.width = 10;
				t.height = 10;
				t.x = app.player1.x + 10;
				t.y = app.player1.y + 10;
				app.ssWorld.AddEntity(t);
				break;
			/*
			case 'S'.charCodeAt(0):
				app.p2c.joystick.l = true; 
				break;
			case 'D'.charCodeAt(0):
				app.p2c.joystick.d = true; 
				break;
			case 'F'.charCodeAt(0):
				app.p2c.joystick.r = true; 
				break;
			case 'E'.charCodeAt(0):
				app.p2c.joystick.u = true; 
				break;
				*/
		}
	};
	
	app.OnKeyUp = function(e) {
		if(!app.player1) return;
		switch(e.keyCode) {
			case KEY_RIGHT: 
				app.p1c.joystick.r = false; 
				break;
			case KEY_LEFT: 
				app.p1c.joystick.l = false; 
				break;
			case KEY_UP: 
				app.p1c.joystick.u = false; 
				break;
			case KEY_DOWN: 
				app.p1c.joystick.d = false; 
				break;
				
				/*
			case 'S'.charCodeAt(0):
				app.p2c.joystick.l = false; 
				break;
			case 'D'.charCodeAt(0):
				app.p2c.joystick.d = false; 
				break;
			case 'F'.charCodeAt(0):
				app.p2c.joystick.r = false; 
				break;
			case 'E'.charCodeAt(0):
				app.p2c.joystick.u = false; 
				break;
				*/
		}
	};
	
	EventBus.net.addListener("onPeerOpen", function(e) {
		var peerId = e.myPeerId;
		
		document.querySelector("input#myID").value = peerId;
		
		var peerRequestID = getURLParameter("peer");
		if(peerRequestID) {
			var mp = Service.get("mp");
			console.log("page loaded with peer request id " + peerRequestID);
			console.log("auto connecting...");
			mp.StartConnectionTo(peerRequestID);
		}
	});
	EventBus.net.addListener("onConnectionClose", function(e) {
		var mp = Service.get("mp");
		if(mp.getNumConnections() > 0) {
			//still connected to at least one peer
			document.querySelector('input#peerID').value = "peers connected "+ mp.getNumConnections();
		}else {
			document.querySelector('input#peerID').value = 'not connected';
			document.querySelector('input#peerID').disabled = false;
		}
	});
	EventBus.net.addListener("onConnectionOpened", function(e) {
		var mp = Service.get("mp");
		document.querySelector('input#peerID').value = "peers connected "+ mp.getNumConnections();
		document.querySelector('input#peerID').disabled = true;
		
		document.querySelector('input#btnConnect').value = 'Disconnect';

		//send world update to new client
		console.log("todo: start synching world updates");
		
		app.Play();
		
		var serializedWorldState = app.ssWorld.SerializeWorldState(app.GetTimeElapsed());
		mp.SendDataTo(e.peerId, {cmd:"worldUpdate", data:serializedWorldState});
	});
	EventBus.net.addListener("onConnectionReceiveData", function(e) {
		var mp = Service.get("mp");
		switch(e.data.cmd) {
			case "worldUpdate":{
				var serializedWorldState = e.data.data;
				app.ssWorld.UpdateFromSerializedWorldState(app.GetTimeElapsed(), serializedWorldState);
			} break;
		}
	});
	
	//app.Play(); //wait until peer is connected to start simulation
};

function onBtnConnect() {
	var mp = Service.get("mp");
	if(document.querySelector('input#btnConnect').value == "Connect") {
		var connectTo = document.querySelector("input#peerID").value;
		mp.StartConnectionTo(connectTo);
	}else {
		console.warn("send disconnect to all peers");
		mp.DisconnectAllPeers();
	}
}

function onBtnHelp() {
	var mp = Service.get("mp");
	var connectURL = window.location.href + "?peer="+ mp.getMyPeerId();
	window.open(connectURL);
}