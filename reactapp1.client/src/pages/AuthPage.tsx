import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login, register as apiRegister } from '../api/auth';
import AuthField from '../components/AuthField';
import { Button } from '../components/Button';

interface AuthForm {
    email: string;
    password: string;
    password2?: string;
}

interface IProps {
    isLogin?: boolean;
}

export default function AuthPage({ isLogin = true }: IProps) {
    const {
        handleSubmit,
        register: formRegister,
        formState: { errors },
        setError,
    } = useForm<AuthForm>();
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: AuthForm) =>
            isLogin
                ? login(data.email, data.password)
                : apiRegister(data.email, data.password, data.password2 || ''),
        onSuccess: (result) => {
            if (result.status === 'success') {
                if (isLogin) {
                    if (result.token) {
                        navigate('/connect');
                    }
                } else {
                    navigate('/login', { state: { isLogin: true } });
                }
            } else {
                setError('root', {
                    type: 'manual',
                    message: result.error || 'Произошла ошибка'
                });
            }
        },
        onError: (error) => {
            setError('root', {
                type: 'manual',
                message: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    });

    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit((data) => {
                    if (!isLogin && data.password !== data.password2) {
                        setError('password2', {
                            type: 'manual',
                            message: 'Пароли не совпадают'
                        });
                        return;
                    }
                    mutate(data);
                })}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {isLogin ? 'Вход' : 'Регистрация'}
                </h2>

                {errors.root && (
                    <div className="text-red-500 text-sm mb-4">
                        {errors.root.message}
                    </div>
                )}

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
                    options={{
                        minLength: {
                            value: 6,
                            message: 'Пароль должен содержать минимум 6 символов'
                        }
                    }}
                />

                {!isLogin && (
                    <AuthField
                        name="password2"
                        label="Повторите пароль"
                        type="password"
                        register={formRegister}
                        required
                        error={errors.password2}
                    />
                )}

                <div className='text-center'>
                    <Button size='lg' disabled={isPending}>
                        {isPending ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
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