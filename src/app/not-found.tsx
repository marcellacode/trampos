import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">O endereço pode ter mudado ou não existir mais.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ir para o início</Link>
          <Link href="/login" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">Entrar</Link>
        </div>
      </div>
    </main>
  );
}
