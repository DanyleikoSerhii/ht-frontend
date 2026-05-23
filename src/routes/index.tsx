import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Hello</h1>
      <p className="text-sm text-muted-foreground">Habit Tracker — M0 bootstrap is up.</p>
    </section>
  );
}
