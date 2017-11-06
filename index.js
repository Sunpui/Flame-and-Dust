module.exports = function FlameAndDust(dispatch) {	
	enabled = false;
	let debuff = -1;
	let cid, pid;
	
	dispatch.hook('S_ACTION_STAGE', 1, event => {
		if (!enabled || event.stage != 0 || event.model !== 4000) {
			return;
		}
		if (event.skill === 1203110998 || event.skill === 1203111013) { //Dust right front
			if (debuff !== -1) {
				console.log("no debuff or debuff appears after animation start");
				return;
			}
			dustFlame(event, debuff, true);
		}
		if (event.skill === 1203111018 || event.skill === 1203111012) { //Flame right front
			if (debuff !== -1) {
				console.log("no debuff or debuff appears after animation start");
				return;
			}
			dustFlame(event, debuff, false);
		}
	});

	dispatch.hook('S_LOAD_TOPO', 2, event => {
		if (event.zone === 9950) {
			enabled = true;
		} else {
			enabled = false;
		}
	});
	
	dispatch.hook('S_LOGIN', 4, event => {	
		cid = event.cid;
		pid = event.playerId;
    });
	
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, event => {
		if (950164 === event.id) {
			debuff = 950164;
		}
		if (950165 === event.id) {
			debuff = 950165;
		}
	});	
	
	function dustFlame(skill, debuffID, dustRight) {
		if ((dustRight && debuff === 950164) || (!dustRight && debuff === 950165)) { //dust front right + player has dust; flame front right + player has flame;
			var angle = Math.PI * (-40.0 + skill.w / 8192.0 * 45) / 180;	//skill.w goes from 0 for north, to 8192 for north-east, 16384 for east, -32768 for south, -16384 for west, -8192 for north-west
			var beaconX = skill.x + Math.cos(angle) * 425.205841; //spawn beacon left front
			var beaconY = skill.y + Math.sin(angle) * 425.205841;
			spawnBeacon(beaconX, beaconY, skill.z, pid);
			angle = Math.PI * (132.3 + skill.w / 8192.0 * 45) / 180;
			beaconX = skill.x + Math.cos(angle) * 297.32135; //spawn beacon right back
			beaconY = skill.y + Math.sin(angle) * 297.32135;
			spawnBeacon(beaconX, beaconY, skill.z, pid+1);
			debuff = -1;
		}
		if ((!dustRight && debuff === 950164) || (dustRight && debuff === 950165)) { //dust front left + player has dust; flame front left + player has flame;
			var angle = Math.PI * (30.0 + skill.w / 8192.0 * 45) / 180;
			var beaconX = skill.x + Math.cos(angle) * 484.148743; //spawn beacon right front
			var beaconY = skill.y + Math.sin(angle) * 484.148743;
			spawnBeacon(beaconX, beaconY, skill.z, pid);
			angle = Math.PI * (-150.3 + skill.w / 8192.0 * 45) / 180;
			beaconX = skill.x + Math.cos(angle) * 403.112885; //spawn beacon left back
			beaconY = skill.y + Math.sin(angle) * 403.112885;
			spawnBeacon(beaconX, beaconY, skill.z, pid+1);
			debuff = -1;
		}
	}
	
	function spawnBeacon(beaconX, beaconY, beaconZ, id) {
		dispatch.toClient('S_DESPAWN_DROPITEM', 1, {id: id})
		setTimeout(() => { dispatch.toClient('S_SPAWN_DROPITEM', 2, {
			id: id,
			x: beaconX,
			y: beaconY,
			z: beaconZ,
			item: 98260,
			amount: 1,
			expiry: 1,
			owners: [{id: pid}]
		})	}, 50)
		setTimeout(() => { dispatch.toClient('S_DESPAWN_DROPITEM', 1, {id: id}) }, 5000)	
	}
}
