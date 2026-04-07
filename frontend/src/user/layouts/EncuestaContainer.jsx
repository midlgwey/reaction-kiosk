import { useKiosk } from "../../user/hooks/useKiosk";
import WelcomeScreen from "../pages/WelcomeScreen";
import PinpadPage from "../pages/PinpadPage";
import QuestionScreen from "../pages/QuestionScreen";
import ThanksScreen from "../pages/ThanksScreen";
import CreateTable from "../pages/CreateTablePage";
import ConsentPage from "../pages/ConsentPage";
import AssignWaiterPage from "../pages/AssignWaiterPage"

export default function EncuestaContainer() {
  const { 
    step, 
    responses, 
    startKiosk, 
    unlockKiosk, 
    assignWaiter,  
    skipAssign,
    assignTable, 
    handleConsent,
    handleAnswer, 
    resetKiosk, 
    handleSuggestionChoice,
    waiterId,
    tableNumber
  } = useKiosk();

  return (

    <div className="min-h-screen overflow-hidden">
      {step === 'HOME' && <WelcomeScreen onStart={startKiosk} />}
      {step === 'PIN' && <PinpadPage onUnlock={unlockKiosk} />}
      {step === 'ASSIGN' && (                        
        <AssignWaiterPage
          onAssign={assignWaiter}
          onSkip={skipAssign}
        />
      )}
      {step === 'TABLE' && <CreateTable onNext={assignTable} />}
      {step === 'CONSENT' && (
        <ConsentPage
          onAccept={() => handleConsent(true)}
          onDecline={() => handleConsent(false)}
        />
      )}
      {step === 'SURVEY' && (
        <QuestionScreen
          onAnswer={handleAnswer}
          currentStep={responses.length}
        />
      )}
      {(step === 'SUGGESTION' || step === 'THANKS') && (
        <ThanksScreen
          onReset={resetKiosk}
          onSubmitSuggestion={handleSuggestionChoice}
          waiterId={waiterId}       
          tableNumber={tableNumber} 
        />
      )}
    </div>
  );
}