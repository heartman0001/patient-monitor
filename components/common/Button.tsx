'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium leading-none select-none';

  const variants: Record<string, string> = {
    primary: 'bg-[#0A0A0A] text-[#FAFAFA] hover:bg-[#333333]',
    secondary: 'bg-transparent text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#F4F4F5]',
    ghost: 'bg-transparent text-[#0A0A0A] hover:bg-[#F4F4F5]',
    destructive: 'bg-[#DC2626] text-[#FAFAFA] hover:bg-[#B91C1C]',
  };

  const sizes: Record<string, string> = {
    sm: 'h-8 px-4 text-[12px] gap-1.5',
    md: 'h-10 px-6 text-[14px] gap-2',
    lg: 'h-12 px-8 text-[16px] gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
