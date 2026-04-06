import {
  useDailyReactions,
  useDailyServerScore,
  useLowInteractionWaiters,
  useDailySurveyCount
} from "../../../hooks/dashboard/useDashboardSummary";
 
import {
  buildReactionsCard,
  buildServerScoreCard,
  buildLowInteractionCard,
  buildSurveyCountCard
} from "../../../utils/statGridUtils";
 
export function useStatGrid() {
  const reactions      = useDailyReactions();
  const serverScore    = useDailyServerScore();
  const lowInteractionWaiters = useLowInteractionWaiters ();
  const surveyCount  = useDailySurveyCount();
 
  return {
    reactionsCard:   buildReactionsCard(reactions),
    serverScoreCard: buildServerScoreCard(serverScore),
    lowInteractionCard:   buildLowInteractionCard(lowInteractionWaiters),
    surveyCountCard: buildSurveyCountCard(surveyCount),
  };
}
 