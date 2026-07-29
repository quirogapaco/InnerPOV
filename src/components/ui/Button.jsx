import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  icon,
  className = '',
  ...props
}) {
  const baseStyles =
    'w-full py-3.5 rounded-full font-sans text-sm font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2';

  const variants = {
    primary: 'bg-[#1A1A1A] text-white hover:opacity-90 shadow-sm',
    secondary:
      'bg-white border border-neutral-200 text-[#1A1A1A] hover:bg-[#f7f3f2]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      class={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span class="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}