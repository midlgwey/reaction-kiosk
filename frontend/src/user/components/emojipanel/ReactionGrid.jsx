import ReactionButton from "./ReactionButton"
import { emotions } from "../../data/emotions";

export default function ReactionGrid({ onSelect }) {

return (
     <div className="
        grid grid-cols-2 md:grid-cols-4 gap-6 
        w-full max-w-5xl mx-auto p-4
    ">
    {emotions.map((item) => (
        <ReactionButton
          key={item.id}      
          emoji={item.icon}
          label={item.label}
        
          onClick={() => onSelect(item.value)} 
        />
      ))}
    </div>
  );
};