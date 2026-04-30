import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button, Input } from "@/components/ui";
import { BrandLogo } from "@/components/nav";
import { registerAction } from "@/lib/actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(13,122,82,0.10),transparent_70%),radial-gradient(50%_50%_at_85%_100%,rgba(212,164,55,0.10),transparent_70%)]"
      />
      <form action={registerAction} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_24px_48px_-28px_rgba(11,18,32,0.18)]">
        <BrandLogo size="sm" />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-slate-900">
          Crear mi álbum
        </h1>
        <p className="mt-1 text-sm text-slate-500">Tu link público se genera automáticamente y lo podés cambiar después.</p>
        {params.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {params.error}
          </p>
        ) : null}
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nombre público</span>
            <div className="mt-1.5">
              <Input name="name" placeholder="Tu nombre" required />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <div className="mt-1.5">
              <Input name="email" type="email" placeholder="tu@email.com" required />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Contraseña</span>
            <div className="mt-1.5">
              <PasswordInput
                name="password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
          </label>
        </div>
        <Button type="submit" variant="primary" size="lg" full className="mt-6">
          Crear cuenta
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/login">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
