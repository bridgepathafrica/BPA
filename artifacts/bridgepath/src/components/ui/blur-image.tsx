import { useState, useRef, useEffect } from "react";

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function BlurImage({ className, style, wrapperClassName, onLoad, ...props }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={wrapperClassName ?? (className?.includes("absolute") ? "absolute inset-0" : "absolute inset-0")}
        style={{
          background: "linear-gradient(135deg, #0D1E38 0%, #1a2d4a 50%, #0d1f3a 100%)",
          backgroundSize: "200% 200%",
          animation: loaded ? "none" : "shimmer 1.6s ease-in-out infinite",
          transition: "opacity 0.4s ease",
          opacity: loaded ? 0 : 1,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        ref={imgRef}
        className={className}
        style={{
          ...style,
          transition: "opacity 0.55s ease",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...props}
      />
    </>
  );
}
