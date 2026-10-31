import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, UserPlus } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

/** Campo con un icono a la izquierda. */
const CON_ICONO = 'h-11 rounded-xl pl-10';

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="correo@empresa.com"
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-marca decoration-marca/30"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Tu contraseña"
                                        className={CON_ICONO}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="font-normal text-muted-foreground"
                                >
                                    Mantener la sesión iniciada
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="degradado-marca group mt-2 h-11 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-marca/25 transition-all hover:-translate-y-px hover:shadow-xl hover:brightness-110"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Iniciar sesión
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
                                ¿Aún no tienes cuenta?
                            </span>
                        </div>

                        <Link
                            href={register()}
                            data-test="register-link"
                            tabIndex={5}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all hover:border-marca/40 hover:bg-marca/5 hover:text-marca"
                        >
                            <UserPlus className="size-4" />
                            Crear una cuenta
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Bienvenido de nuevo',
    description: 'Entra con tu correo y contraseña para continuar.',
};
