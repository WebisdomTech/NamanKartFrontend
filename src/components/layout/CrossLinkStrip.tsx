export function CrossLinkStrip() {
  return (
    <div className="bg-maroon text-maroon-foreground text-xs sm:text-sm">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center">
        <span className="opacity-90">Looking to book a Puja, Darshan or Yatra?</span>
        <a
          href="https://namandarshan.com"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-gold underline-offset-4 hover:text-gold transition"
        >
          Visit NamanDarshan.com →
        </a>
      </div>
    </div>
  );
}
