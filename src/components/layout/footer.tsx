"use client";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/80">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="text-2xl font-black tracking-tight">TrimLink</h3>
          <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
            A calmer way to discover staffshops, reserve a time, join a queue, and pay digitally
            across Ethiopia.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="text-base font-bold">Product</h4>
            <ul className="mt-3 space-y-3 text-base text-muted-foreground">
              <li>Customer booking</li>
              <li>Live queue</li>
              <li>Telebirr and Chapa</li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-bold">Contact</h4>
            <ul className="mt-3 space-y-3 text-base text-muted-foreground">
              <li>Addis Ababa, Ethiopia</li>
              <li>hello@trimlink.et</li>
              <li>+251 9 11 000 000</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
