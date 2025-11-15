import { useState } from 'react'

export default function MaterialInput({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false,
  error = '',
  maxLength,
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value && value.length > 0

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        className={`
          w-full h-14 px-4 bg-dark-bg border-2 rounded-lg text-dark-text text-base
          transition-all duration-200 outline-none
          ${error 
            ? 'border-red-500' 
            : isFocused 
              ? 'border-brand-focus' 
              : 'border-dark-border hover:border-brand-focus'
          }
          [&:-webkit-autofill]:!bg-dark-bg
          [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.dark.text)]
          [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_theme(colors.dark.bg)_inset]
        `}
        style={{
          lineHeight: '3.5rem'
        }}
        {...props}
      />
      <label 
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none bg-dark-bg px-1
          ${isFocused || hasValue 
            ? 'top-0 -translate-y-1/2 text-xs' 
            : 'top-1/2 -translate-y-1/2 text-base'
          }
          ${error 
            ? 'text-red-500' 
            : isFocused 
              ? 'text-brand-focus' 
              : 'text-dark-text-secondary'
          }
        `}
      >
        {label}
      </label>
      {error && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            !
          </div>
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  )
}

