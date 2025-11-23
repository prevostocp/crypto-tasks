import Navbar from './Navbar';
import type { User } from '../types';

interface SignUpProps {
  user: User;
  onLogout: () => void;
  onSwitchMode: () => void;
}

const SignUp = ({user, onLogout, onSwitchMode}:SignUpProps) => {
  void onSwitchMode;
  return (
    <div className=' min-h-screen bg-gray-50'>
      <Navbar user={user} onLogout={onLogout} />

    </div>
  )
}

export default SignUp