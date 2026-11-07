import { nextEncounter } from './tavern-encounter-state';
import { COMPANION_IDS, socialAvailable, type SocialAccess, type SocialState } from './tavern-social';

/** Only actual available conversations; opening the tavern alone does not mark them seen. */
export function pendingTavernConversations(state: SocialState, access: SocialAccess) {
  return COMPANION_IDS.filter(who => socialAvailable(access, who)).flatMap(who => {
    const id = nextEncounter(state, who);
    return id ? [{ who, isNew: !state.encounters[who][id].seen }] : [];
  });
}
