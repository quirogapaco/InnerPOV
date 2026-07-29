import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  rightAction,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div class="space-y-1 text-left w-full">
      <div class="flex justify-between items-center px-1">
        {label && (
          <label class="font-sans text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {label}
          </label>
        )}
        {rightAction}
      </div>
      <div class="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          class="w-full bg-[#f7f3f2] border-none rounded-xl py-3 px-4 text-sm text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all duration-200"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}