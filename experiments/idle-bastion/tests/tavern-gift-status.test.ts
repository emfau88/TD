import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocial, activateSocial } from '../src/tavern-social';
import { tavernGiftStatus } from '../src/tavern-gift-status';
test('gift ownership and actionable recipients stay separate across both companions and the chapter cap', () => {
 const s=createSocial(), access={tavernBuilt:true,ilyraRecruited:true,boss15:true,boss25:true};
 activateSocial(s,access);s.gifts=1;
 assert.deepEqual(tavernGiftStatus(s,access),{owned:true,recipients:[]});
 s.points.mara=23;assert.deepEqual(tavernGiftStatus(s,access).recipients,['mara']);
 s.points.mara=58;s.points.ilyra=35;s.gifts=0;
 for(const who of ['mara','ilyra'] as const)s.personal[who].clears=30;
 assert.deepEqual(tavernGiftStatus(s,access),{owned:true,recipients:['mara']});
 s.points.ilyra=58;assert.deepEqual(tavernGiftStatus(s,access).recipients,['mara','ilyra']);
 s.points.mara=70;s.personal.mara.claimed=true;assert.deepEqual(tavernGiftStatus(s,access).recipients,['ilyra']);
 s.points.ilyra=70;s.personal.ilyra.claimed=true;s.gifts=20;
 assert.deepEqual(tavernGiftStatus(s,access),{owned:true,recipients:[]});
 assert.deepEqual(tavernGiftStatus(s,{...access,tavernBuilt:false}),{owned:false,recipients:[]});
});
