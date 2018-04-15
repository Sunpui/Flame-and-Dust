module.exports = function FlameAndDust(dispatch) {	
	enabled = false;
	let debuff = -1;
	let skillDebuff;
	let cid, pid;
	
	dispatch.hook('S_ACTION_STAGE', 1, event => {
		if (!enabled || event.stage !== 0 || event.model !== 4000) {
			return;
		}
		if (event.skill === 1203110998 || event.skill === 1203111023) { //Dust right front
			skillDebuff = event;
			if (debuff !== -1) {
				dustFlame(event, true);
			}
		}
		if (event.skill === 1203111018 || event.skill === 1203111022) { //Flame right front
			skillDebuff = event;
			if (debuff !== -1) {
				dustFlame(event, false);
			}
		}
	});

	dispatch.hook('S_LOAD_TOPO', 2, event => {
		if (event.zone === 9950) {
			enabled = true;
		} else {
			enabled = false;
		}
	});
	
	dispatch.hook('S_LOGIN', 7, event => {	
		cid = event.guid;
		pid = event.playerId;
    });
	
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, event => {
		if (enabled && (950164 === event.id || 950165 === event.id)) {
			if(event.target - cid === 0) {
				debuff = event.id;
				if (skillDebuff.skill === 1203110998 || skillDebuff.skill === 1203111023) { //Dust right front
					dustFlame(skillDebuff, true);
					return;
				}
				if (skillDebuff.skill === 1203111018 || skillDebuff.skill === 1203111022) { //Flame right front
					dustFlame(skillDebuff, false);
					return;
				}
			}
		}
	});	
	
	function dustFlame(skill, dustRight) {
		if ((dustRight && debuff === 950164) || (!dustRight && debuff === 950165)) { //dust front right + player has dust; flame front right + player has flame;
			var angle = Math.PI * (-40.0 + skill.w / 8192.0 * 45) / 180;	//skill.w goes from 0 for north, to 8192 for north-east, 16384 for east, -32768 for south, -16384 for west, -8192 for north-west
			var beaconX = skill.x + Math.cos(angle) * 745.0; //spawn beacon left front
			var beaconY = skill.y + Math.sin(angle) * 745.0;
			spawnBeacon(beaconX, beaconY, skill.z, pid+201);
			angle = Math.PI * (132.3 + skill.w / 8192.0 * 45) / 180;
			beaconX = skill.x + Math.cos(angle) * 617.0; //spawn beacon right back
			beaconY = skill.y + Math.sin(angle) * 617.0;
			spawnBeacon(beaconX, beaconY, skill.z, pid+202);
		}
		if ((!dustRight && debuff === 950164) || (dustRight && debuff === 950165)) { //dust front left + player has dust; flame front left + player has flame;
			var angle = Math.PI * (30.0 + skill.w / 8192.0 * 45) / 180;
			var beaconX = skill.x + Math.cos(angle) * 804.0; //spawn beacon right front
			var beaconY = skill.y + Math.sin(angle) * 804.0;
			spawnBeacon(beaconX, beaconY, skill.z, pid+201);
			angle = Math.PI * (-150.3 + skill.w / 8192.0 * 45) / 180;
			beaconX = skill.x + Math.cos(angle) * 723.0; //spawn beacon left back
			beaconY = skill.y + Math.sin(angle) * 723.0;
			spawnBeacon(beaconX, beaconY, skill.z, pid+202);
		}
		debuff = -1;
		skillDebuff = {};
	}
	
	function spawnBeacon(beaconX, beaconY, beaconZ, id) {
		dispatch.toClient('S_SPAWN_DROPITEM', 5, {
			id: id,
			x: beaconX,
			y: beaconY,
			z: beaconZ,
			item: 98260,
			amount: 1,
			expiry: 1,
			owners: [{id: pid}]
		})
		setTimeout(() => { dispatch.toClient('S_DESPAWN_DROPITEM', 1, {id: id}) }, 7000)	
	}
}
