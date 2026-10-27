import { COMPANION_IDS, interactionOffer, personalGiftReady, socialAvailable, type SocialState, type SocialAccess } from './tavern-social';
/** Read-only, shared by settlement, tavern and companion cards. */
export function tavernGiftStatus(state: SocialState, access: SocialAccess) {
  const accessible = COMPANION_IDS.filter(who => socialAvailable(access, who));
  return {
    owned: accessible.length > 0 && (state.gifts > 0 || accessible.some(who => personalGiftReady(state, who))),
    recipients: accessible.filter(who => interactionOffer(state, access, who, 'gift').points > 0),
  };
}
