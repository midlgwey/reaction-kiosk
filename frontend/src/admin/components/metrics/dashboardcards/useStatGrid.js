import {
  useDailyReactions,
  useDailyServerScore,
  useLowInteractionWaiters,
  useDailySurveyCount,
  useLowestRatedWaiter,
  useWorstRatedQuestion
} from "../../../hooks/dashboard/useDashboardSummary";
 
import {
  buildReactionsCard,
  buildServerScoreCard,
  buildLowInteractionCard,
  buildSurveyCountCard,
  buildLowestRatedWaiterCard,
  buildWorstRatedQuestionCard
} from "../../../utils/statGridUtils";
 
export function useStatGrid() {
  const reactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const lowInteractionWaiters = useLowInteractionWaiters();
  const surveyCount = useDailySurveyCount();
  const lowestRatedWaiter = useLowestRatedWaiter();
  const worstRatedQuestion = useWorstRatedQuestion();
 
  return {
    reactionsCard: buildReactionsCard(reactions),
    serverScoreCard: buildServerScoreCard(serverScore),
    lowInteractionCard: buildLowInteractionCard(lowInteractionWaiters),
    surveyCountCard: buildSurveyCountCard(surveyCount),
    lowestRatedWaiterCard: buildLowestRatedWaiterCard(lowestRatedWaiter),
    worstRatedQuestionCard: buildWorstRatedQuestionCard(worstRatedQuestion),
  };
}