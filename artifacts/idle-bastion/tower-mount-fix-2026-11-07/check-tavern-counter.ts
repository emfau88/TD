import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createSocial, grantMilestoneGifts, recordSocialClear, interact, personalGiftReady } from '../../../experiments/idle-bastion/src/tavern-social';
import { encounterEligible } from '../../../experiments/idle-bastion/src/tavern-encounter-state';
const s=createSocial();
const access={tavernBuilt:false,ilyraRecruited:false,boss15:true,boss25:true};
let attempt=0;
for(let i=0;i<100;i++)recordSocialClear(s,++attempt,access);
assert.equal(s.personal.mara.clears,0);
access.tavernBuilt=true;grantMilestoneGifts(s,access);
for(let i=0;i<50;i++)recordSocialClear(s,++attempt,access);
const firstVisit={points:s.points.mara,personalWins:s.personal.mara.clears,stock:s.gifts,firstConversation:encounterEligible(s,'mara','first')};
assert.deepEqual(firstVisit,{points:0,personalWins:0,stock:8,firstConversation:false});
for(let i=0;i<3;i++)interact(s,access,'mara','talk');
interact(s,access,'mara','gift');assert.equal(s.points.mara,35);assert.equal(s.personal.mara.clears,0);
interact(s,access,'mara','gift');interact(s,access,'mara','gift');
assert.equal(s.points.mara,58);assert.equal(personalGiftReady(s,'mara'),false);
const milestones=[];
for(let i=1;i<=30;i++){
 recordSocialClear(s,++attempt,access);
 if([9,10,19,20,29,30].includes(i))milestones.push({newWins:i,first:encounterEligible(s,'mara','first'),second:encounterEligible(s,'mara','second'),personalGift:personalGiftReady(s,'mara')});
 assert.equal(encounterEligible(s,'mara','first'),i>=10);
 assert.equal(encounterEligible(s,'mara','second'),i>=20);
 assert.equal(personalGiftReady(s,'mara'),i>=30);
}
assert.equal(interact(s,access,'mara','gift',{gift:'personal'}).points,12);
assert.equal(s.points.mara,70);assert.equal(s.personal.ilyra.clears,0);
writeFileSync(new URL('tavern-counter-audit.json',import.meta.url),JSON.stringify({firstVisit,priorWins:150,milestones,heart3Points:s.points.mara,otherCompanionWins:s.personal.ilyra.clears,gameCodeChanged:false},null,2)+'\n');
console.log('150 prior normal wins do not prefill the heart-2 counter; 10/20/30 are new own wins.');
