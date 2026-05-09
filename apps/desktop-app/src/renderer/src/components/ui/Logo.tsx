import { BRANDING } from "../../config/brandingConfig";
import logoIcon from "../../../assets/branding/logo-icon.svg";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div 
      className={`logo-container ${className}`} 
      style={{ display: "flex", alignItems: "center", gap: "12px" }}
    >
      <img 
        src={logoIcon} 
        alt={`${BRANDING.name} Logo`} 
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {showText && (
        <span 
          style={{ 
            fontSize: "1.25rem", 
            fontWeight: "700", 
            letterSpacing: "-0.02em",
            color: "var(--text)" 
          }}
        >
          {BRANDING.name}
        </span>
      )}
    </div>
  );
}
