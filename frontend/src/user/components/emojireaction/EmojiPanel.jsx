import EmojiButtom from "./EmojiButtom";
//importing animations
import good from "../../../assets/icons/haha.json"
import excellent from "../../../assets/icons/love.json"
import regular from "../../../assets/icons/meh.json"
import bad from "../../../assets/icons/angry.json"


export default function EmojiPanel(onSelect) {
  const emojiData = [
    { emoji: bad, label: "Malo"},
    { emoji: regular, label: "Puede Mejorar" },
    { emoji: good, label: "Bueno" },
    { emoji: excellent, label: "Excelente" },
  ];

return (
     <div className="
        grid
        grid-cols-2
        md:grid-cols-5
        gap-6
        justify-items-center
      "
    >
      {emojiData.map((item, index) => (
        <EmojiButtom
          key={index}
          emoji={item.emoji}
          label={item.label}
           onClick={() => onSelect(item.label)}
        />
      ))}
    </div>
  );
};