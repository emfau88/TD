import type { BattleSession } from './battle-session';
import type { Companion, Interaction, InteractionResult, InteractionChoice } from './tavern-social';
/** UI transactions serialize taps and acknowledge rewards only after durable save. */
export class TavernInteractions {
  pending = false;
  async run(session: BattleSession, action: Interaction, who: Companion = 'mara', choice: InteractionChoice = {}): Promise<InteractionResult | null> {
    if (this.pending || session.inputBusy || session.error || session.suspended || session.awaitingResume) return null;
    const offer = session.battle.companionOffer(who, action, choice);
    if (!offer.accepted) return null;
    if (!offer.points) return offer;
    const selection: InteractionChoice = { ...choice, ...(offer.gift ? { gift: offer.gift } : {}) };
    this.pending = true;
    try {
      let result = offer;
      const saved = await session.command(b => { result = b.interactCompanion(who, action, selection); }, true);
      return saved && result.accepted ? result : null;
    } finally { this.pending = false; }
  }
}
