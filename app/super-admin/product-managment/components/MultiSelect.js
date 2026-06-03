'use client';

import { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ options, value, onChange, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeTag = (val) => {
    onChange(value.filter(v => v !== val));
  };

  return (
    <div className="position-relative" ref={wrapperRef}>
      <div
        className="form-select d-flex flex-wrap gap-1 align-items-center"
        style={{ cursor: 'pointer', minHeight: '38px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 && <span className="text-muted">{placeholder}</span>}
        {value.map(val => (
          <span key={val} className="badge bg-success d-inline-flex align-items-center gap-1">
            {options.find(opt => opt.value === val)?.label || val}
            <i className="bi bi-x-circle" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); removeTag(val); }}></i>
          </span>
        ))}
      </div>
      {isOpen && (
        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`dropdown-item ${value.includes(opt.value) ? 'active' : ''}`}
              onClick={() => toggleOption(opt.value)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi bi-${value.includes(opt.value) ? 'check-square' : 'square'} me-2`}></i>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}