type Props = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/** Photo hero : remplit tout le cadre (cover), responsive, sans bandes. */
export function PhotoFill({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      className={`hero-cover ${className}`.trim()}
      draggable={false}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "low"}
    />
  );
}
