const stats = [
  { value: "$4.2B+", label: "Volume traded" },
  { value: "180k+", label: "Active traders" },
  { value: "94%", label: "Signal accuracy" },
  { value: "24/7", label: "AI monitoring" },
];

export function Stats() {
  return (
    <section id="analytics" className="relative py-20">
      <div className="container mx-auto px-6">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary px-8 py-14 shadow-elegant sm:px-14">
          <div className="grid grid-cols-2 gap-10 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
