import type { BattleSession } from './battle-session';
import type { Companion, Interaction, InteractionResult } from './tavern-social';
/** UI transactions serialize taps and acknowledge rewards only after durable save. */
export class TavernInteractions {
  pending = false;
  async run(session: BattleSession, action: Interaction, who: Companion = 'mara'): Promise<InteractionResult | null> {
    if (this.pending || session.busy || session.error || session.suspended || session.awaitingResume) return null;
    const offer = session.battle.companionOffer(who, action);
    if (!offer.accepted) return null;
    if (!offer.points) return offer;
    this.pending = true;
    try {
      let result = offer;
      const saved = await session.command(b => { result = b.interactCompanion(who, action); }, true);
      return saved && result.accepted ? result : null;
    } finally { this.pending = false; }
  }
}
