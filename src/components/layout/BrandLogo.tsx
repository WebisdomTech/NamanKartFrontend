import logo from "@/assets/image.png";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  showText?: boolean;
};

export function BrandLogo({ className = "", compact = false, showText = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${className}`.trim()}>
      <img
        src={logo}
        alt="Brand logo"
        className={compact ? "h-16 w-auto sm:h-18" : "h-18 w-auto sm:h-22"}
      />
    </div>
  );
}
