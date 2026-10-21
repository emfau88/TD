import { MARA_MOMENTS, maraStage, maraMoment, maraLine, nextMaraMoment } from './tavern-mara-content';
import { ILYRA_MOMENTS, ilyraStage, ilyraMoment, ilyraLine, nextIlyraMoment } from './tavern-ilyra-content';
import { MARA_REACTIONS, ILYRA_REACTIONS } from './tavern-animation';
export const COMPANIONS = {
  mara: { name: 'Mara', role: 'Tüftlerin des Hains', moments: MARA_MOMENTS, stage: maraStage, moment: maraMoment, line: maraLine, next: nextMaraMoment, reactions: MARA_REACTIONS },
  ilyra: { name: 'Ilyra', role: 'Sternenwächterin', moments: ILYRA_MOMENTS, stage: ilyraStage, moment: ilyraMoment, line: ilyraLine, next: nextIlyraMoment, reactions: ILYRA_REACTIONS },
} as const;
