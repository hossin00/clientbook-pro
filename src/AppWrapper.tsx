import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'clientbook-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Client profiles and notes", "Project pipeline", "Invoice link tracker", "Follow-up reminders"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#84cc16" color2="#65a30d" emoji="👥" name="ClientBook Pro" tagline="Offline CRM for freelancers"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#84cc16" emoji="👥" name="ClientBook Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}