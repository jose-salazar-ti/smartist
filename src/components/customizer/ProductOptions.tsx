"use client";

import React from "react";

interface ProductOptionsProps {
  optionKeys: string[];
  selectedOptions: { [key: string]: string };
  getOptionValues: (key: string) => string[];
  handleOptionChange: (key: string, value: string) => void;
}

export default function ProductOptions({
  optionKeys,
  selectedOptions,
  getOptionValues,
  handleOptionChange,
}: ProductOptionsProps) {
  if (optionKeys.length === 0) return null;

  return (
    <div className="order-5 lg:order-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Opciones del Producto
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {optionKeys.map((key) => {
          const values = getOptionValues(key);
          const currentValue = selectedOptions[key];
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ textTransform: 'capitalize', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{key}</label>
              <select 
                value={currentValue} 
                onChange={(e) => handleOptionChange(key, e.target.value)}
                style={{ 
                  background: 'var(--bg-dark-3)', color: 'var(--text-primary)', border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px', appearance: 'none', outline: 'none' 
                }}
              >
                {values.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
