import {
  useDailyReactions,
  useDailyServerScore,
  useDailyHappinessIndex,
  useDailyHappinessByShift,
} from "../../../hooks/dashboard/useDashboardSummary";
 
import {
  buildReactionsCard,
  buildServerScoreCard,
  buildHappinessCard,
  buildShiftCard,
} from "../../../utils/statGridUtils";
 
export function useStatGrid() {
  const reactions      = useDailyReactions();
  const serverScore    = useDailyServerScore();
  const happiness      = useDailyHappinessIndex();
  const happyByShift   = useDailyHappinessByShift();
 
  return {
    reactionsCard:   buildReactionsCard(reactions),
    serverScoreCard: buildServerScoreCard(serverScore),
    happinessCard:   buildHappinessCard(happiness),
    shiftCard:       buildShiftCard(happyByShift),
  };
}
 