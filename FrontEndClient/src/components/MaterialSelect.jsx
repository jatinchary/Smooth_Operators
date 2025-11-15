import { useState } from 'react'

export default function MaterialSelect({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  required = false,
  error = '',
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value && value.length > 0

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full h-14 px-4 pr-10 bg-dark-bg border-2 rounded-lg text-dark-text text-base
          transition-all duration-200 outline-none appearance-none cursor-pointer
          ${error 
            ? 'border-red-500' 
            : isFocused 
              ? 'border-brand-focus' 
              : 'border-dark-border hover:border-brand-focus'
          }
        `}
        style={{
          lineHeight: '3.5rem'
        }}
        {...props}
      >
        <option value=""></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Dropdown arrow icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-dark-text-secondary">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
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

