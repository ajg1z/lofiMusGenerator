import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import './StyledSelect.css';

export type SelectOption<V> = {
  value: V;
  label: string;
  disabled?: boolean;
};

export interface StyledSelectProps<V> {
  value: SelectOption<V> | null;
  options: SelectOption<V>[];
  placeholder?: string;
  noOptionsMessage?: string;
  disabled?: boolean;
  isClearable?: boolean;
  searchable?: boolean;
  name?: string;
  onChange?: (next: SelectOption<V> | null) => void;
}

const noop = () => undefined;

/**
 * Пример:
 * const [city, setCity] = useState<SelectOption<string> | null>(null);
 * <StyledSelect value={city} options={cities} isClearable searchable onChange={setCity} />
 */
export function StyledSelect<V>({
  value,
  options,
  placeholder = 'Выберите значение',
  noOptionsMessage = 'Нет результатов',
  disabled = false,
  isClearable = false,
  searchable = true,
  name,
  onChange = noop,
}: StyledSelectProps<V>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const needle = searchQuery.toLowerCase().trim();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, searchQuery, searchable]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setFocusedIndex(-1);
      return;
    }

    if (!filteredOptions.length) {
      setFocusedIndex(-1);
      return;
    }

    const selectedIndex = value
      ? filteredOptions.findIndex((option) => option.value === value.value)
      : -1;

    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, filteredOptions, value]);

  useEffect(() => {
    if (!isOpen || !searchable) return;
    inputRef.current?.focus();
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeItem = listRef.current.children[focusedIndex] as HTMLLIElement | undefined;
    if (!activeItem) return;

    const { offsetTop, offsetHeight } = activeItem;
    const { scrollTop, clientHeight } = listRef.current;

    if (offsetTop < scrollTop) {
      listRef.current.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
      listRef.current.scrollTop = offsetTop + offsetHeight - clientHeight;
    }
  }, [focusedIndex, isOpen]);

  const openMenu = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleOptionSelect = (option: SelectOption<V>) => {
    if (option.disabled) return;
    onChange(option);
    closeMenu();
  };

  const handleClear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isOpen) {
      openMenu();
    }
    setSearchQuery(event.target.value);
  };

  const moveFocus = (direction: 1 | -1) => {
    if (!filteredOptions.length) return;

    setFocusedIndex((prev) => {
      const nextIndex = prev + direction;
      if (nextIndex < 0) return filteredOptions.length - 1;
      if (nextIndex >= filteredOptions.length) return 0;
      return nextIndex;
    });
  };

  const focusEdge = (edge: 'start' | 'end') => {
    if (!filteredOptions.length) return;
    setFocusedIndex(edge === 'start' ? 0 : filteredOptions.length - 1);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const keyMap: Record<string, () => void> = {
      ArrowDown: () => {
        openMenu();
        moveFocus(1);
      },
      ArrowUp: () => {
        openMenu();
        moveFocus(-1);
      },
      Home: () => {
        openMenu();
        focusEdge('start');
      },
      End: () => {
        openMenu();
        focusEdge('end');
      },
    };

    if (keyMap[event.key]) {
      event.preventDefault();
      keyMap[event.key]!();
      return;
    }

    if (event.key === 'Enter' && isOpen && focusedIndex >= 0) {
      event.preventDefault();
      const option = filteredOptions[focusedIndex];
      if (option) handleOptionSelect(option);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      openMenu();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (searchable && /^[\w\s]$/.test(event.key)) {
      openMenu();
      setSearchQuery((prev) => `${prev}${event.key}`);
    }
  };

  const selectedLabel = value?.label ?? '';
  const placeholderText = placeholder ?? 'Выберите значение';
  const inputValue = isOpen && searchable ? searchQuery : selectedLabel;
  const showPlaceholder = !value && !inputValue;
  const listboxActiveDescendant = focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined;

  const rootClass = [
    'styled-select',
    disabled ? 'styled-select--disabled' : '',
    isOpen ? 'styled-select--open' : '',
    value ? 'styled-select--has-value' : '',
    searchable ? 'styled-select--searchable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClass}
      tabIndex={0}
      role="combobox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-disabled={disabled}
      aria-activedescendant={listboxActiveDescendant}
      onKeyDown={handleKeyDown}
      onClick={toggleMenu}
    >
      <div className="styled-select__control">
        {searchable ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={showPlaceholder ? placeholderText : undefined}
            onChange={handleSearchChange}
            onFocus={openMenu}
            className="styled-select__input"
            readOnly={!isOpen}
          />
        ) : (
          <span className="styled-select__single-value">
            {selectedLabel || placeholderText}
          </span>
        )}

        {isClearable && value ? (
          <button
            type="button"
            className="styled-select__clear"
            aria-label="Очистить"
            onClick={handleClear}
          >
            ×
          </button>
        ) : null}

        <span className="styled-select__indicator" aria-hidden>
          ▾
        </span>
      </div>

      {name && (
        <input type="hidden" name={name} value={value ? JSON.stringify(value) : ''} />
      )}

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="styled-select__menu"
        >
          {filteredOptions.length === 0 && (
            <li className="styled-select__no-options" role="presentation">
              {noOptionsMessage}
            </li>
          )}

          {filteredOptions.map((option, index) => {
            const isSelected = value ? option.value === value.value : false;
            const isActive = index === focusedIndex;
            const optionClass = [
              'styled-select__option',
              isSelected ? 'styled-select__option--selected' : '',
              isActive ? 'styled-select__option--active' : '',
              option.disabled ? 'styled-select__option--disabled' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li
                key={`${option.label}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={optionClass}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
