
import goodAnim from '../../assets/icons/haha.json';
import excellentAnim from '../../assets/icons/love.json';
import regularAnim from '../../assets/icons/meh.json';
import badAnim from '../../assets/icons/angry.json';

export const emotions = [
  { 
    id: 1,
    value: 1, 
    label: "Malo", 
    animation: badAnim,
  },
  { 
    id: 2,
    value: 2, 
    label: "Puede Mejorar", 
    animation: regularAnim,
  },
  { 
    id: 3,
    value: 3, 
    label: "Bueno", 
    animation: goodAnim,
  },
  { 
    id: 4,
    value: 4, 
    label: "Excelente", 
    animation: excellentAnim,
  },
];