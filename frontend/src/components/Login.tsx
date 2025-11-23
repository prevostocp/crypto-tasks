interface AuthFormData {
  email: string;
  name?: string;
}

interface LoginProps {
  onSubmit: (data: AuthFormData) => void;
  onSwitchMode: () => void;
}

const Login = ({ onSubmit, onSwitchMode }: LoginProps) => {
  void onSubmit;
  void onSwitchMode;
  return <div>Login</div>;
};

export default Login;
