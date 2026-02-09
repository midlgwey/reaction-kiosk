import Lottie from 'lottie-react'
import Hands from '../../../assets/icons/hands.json'

const GratitudeMessage = () => {
  return (
    <div>
       <h2 className="text-3xl font-bold text-center max-w-3xl leading-relaxed">
        Sus comentarios son muy importantes para nosotros. ¡Gracias por su preferencia!
      </h2>

      <Lottie animationData={Hands} loop className="w-64 h-64 mx-auto "/>
    </div>
  )
}

export default GratitudeMessage
