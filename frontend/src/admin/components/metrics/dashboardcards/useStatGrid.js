import {
  useDailyReactions,
  useDailyServerScore,
  useDailyHappinessIndex,
  useDailySurveyCount
} from "../../../hooks/dashboard/useDashboardSummary";
 
import {
  buildReactionsCard,
  buildServerScoreCard,
  buildHappinessCard,
  buildSurveyCountCard
} from "../../../utils/statGridUtils";
 
export function useStatGrid() {
  const reactions      = useDailyReactions();
  const serverScore    = useDailyServerScore();
  const happiness      = useDailyHappinessIndex();
  const surveyCount  = useDailySurveyCount();
 
  return {
    reactionsCard:   buildReactionsCard(reactions),
    serverScoreCard: buildServerScoreCard(serverScore),
    happinessCard:   buildHappinessCard(happiness),
     surveyCountCard: buildSurveyCountCard(surveyCount),
  };
}
 