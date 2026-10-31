import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, LogIn, Mail, ShieldCheck, User } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

/** Campo con un icono a la izquierda. */
const CON_ICONO = 'h-11 rounded-xl pl-10';
const ICONO =
    'pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground';

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Crear cuenta" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <div className="relative">
                                    <User className={ICONO} />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nombre completo"
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className={ICONO} />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="correo@empresa.com"
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Lock className={ICONO} />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Crea una contraseña"
                                        passwordrules={passwordRules}
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <div className="relative">
                                    <ShieldCheck className={ICONO} />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Repite la contraseña"
                                        passwordrules={passwordRules}
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="degradado-marca group mt-2 h-11 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-marca/25 transition-all hover:-translate-y-px hover:shadow-xl hover:brightness-110"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                                {!processing && (
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                )}
                            </Button>
                        </div>

                        <div className="relative text-center text-xs text-muted-foreground">
                            <span
                                aria-hidden
                                className="absolute inset-x-0 top-1/2 h-px bg-border"
                            />
                            <span className="relative bg-card px-3">
                                ¿Ya tienes cuenta?
                            </span>
                        </div>

                        <Link
                            href={login()}
                            data-test="login-link"
                            tabIndex={6}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all hover:border-marca/40 hover:bg-marca/5 hover:text-marca"
                        >
                            <LogIn className="size-4" />
                            Iniciar sesión
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crea tu cuenta',
    description: 'Únete a la comunidad de la Cámara en menos de un minuto.',
};
