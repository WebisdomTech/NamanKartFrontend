import logo from "@/assets/image.png";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  showText?: boolean;
};

export function BrandLogo({ className = "", compact = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${className}`.trim()}>
      <img
        src={logo}
        alt="NamanKart Logo"
        className={`${
          compact ? "h-[49px] w-auto sm:h-[57px] md:h-[57px]" : "h-[57px] w-auto sm:h-[65px] md:h-[73px]"
        } object-contain shrink-0`}
      />
    </div>
  );
}
