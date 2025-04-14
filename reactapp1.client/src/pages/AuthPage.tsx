import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login, register as apiRegister } from '../api/auth';
import AuthField from '../components/AuthField';
import { Button } from '../components/Button';

interface AuthForm {
  email: string;
  password: string;
}

interface IProps {
  isLogin?: boolean;
}

export default function AuthPage({ isLogin = true }: IProps) {
  const { handleSubmit, register: formRegister, formState: { errors } } = useForm<AuthForm>();
  const navigate = useNavigate();
  
  const { mutate } = useMutation({
    mutationFn: (data: AuthForm) => 
      isLogin ? login(data.email, data.password) : apiRegister(data.email, data.password),
    onSuccess: (token) => {
      localStorage.setItem('token', token);
      navigate('/connect');
    }
  });

  return (
    <div className="flex items-center justify-center">
      <form 
        onSubmit={handleSubmit((data) => mutate(data))}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        
        <AuthField
          name="email"
          label="Email"
          type="email"
          register={formRegister}
          required
          error={errors.email}
        />

        <AuthField
          name="password"
          label="Пароль"
          type="password"
          register={formRegister}
          required
          error={errors.password}
        />

        {!isLogin ?  <AuthField
          name="password2"
          label="Повторите пароль"
          type="password"
          register={formRegister}
          required
          error={errors.password}
        /> : ''}
        <div className='text-center'>
        <Button size='lg' >
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>
        </div>
        
        <div className="mt-4 text-center">
          {isLogin ? (
            <Link to="/register" className="text-blue-500 hover:underline">
              Создать аккаунт
            </Link>
          ) : (
            <Link to="/login" className="text-blue-500 hover:underline">
              Уже есть аккаунт?
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}