import Calculator from "@/components/calculator";
import ThemeSwitch from "@/components/theme-switch";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="flex w-full max-w-81.75 flex-col gap-8 md:max-w-135">
        <header className="flex h-10.5 items-end justify-between">
          <h1 className="text-brand -mb-0.75 tracking-tight">calc</h1>
          <ThemeSwitch />
        </header>
        <Calculator />
      </div>
    </main>
  );
}
