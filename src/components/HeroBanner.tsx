interface HeroBannerProps {
  title: string;
  description: string;
  maxWidth?: string;
}

export function HeroBanner({ title, description, maxWidth = 'max-w-5xl' }: HeroBannerProps) {
  return (
    <div className="bg-[var(--ms-blue)] text-white p-6 sm:p-8 md:p-12">
      <div className={`${maxWidth} mx-auto`}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light mb-2">{title}</h1>
        <p className="text-sm md:text-base opacity-90 max-w-2xl">{description}</p>
      </div>
    </div>
  );
}
