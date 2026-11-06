"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "../../hooks/use-media-query";
import { cn } from "../../lib/cn";
import { Icon } from "./icons";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
  action?: boolean;
};

type SelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Select({
  label,
  value,
  onValueChange,
  options,
  name,
  placeholder = "Choose an option",
  searchable = false,
  required = false,
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mobile = useMediaQuery("(max-width: 767px)");
  const id = useId();
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter(
    (option) =>
      option.action ||
      `${option.label} ${option.description || ""} ${option.searchText || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const place = () => {
      const rect = trigger?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const width = Math.min(Math.max(rect.width, 300), window.innerWidth - 32);
      const height = viewport?.height || window.innerHeight;
      const top = Math.max(16, Math.min(rect.bottom + 8, height - 340));
      setPosition(
        mobile
          ? {
              bottom: `${Math.max(0, window.innerHeight - height - (viewport?.offsetTop || 0)) + 12}px`,
              maxHeight: `min(${height - 32}px, calc(100dvh - 32px))`,
            }
          : {
              width,
              left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
              top,
              maxHeight: Math.min(440, height - top - 16),
            },
      );
    };
    place();
    dialog?.showModal();
    if (searchable) searchRef.current?.focus({ preventScroll: true });
    else listRef.current?.focus({ preventScroll: true });
    window.addEventListener("resize", place);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [open, mobile, searchable]);

  function close() {
    setOpen(false);
  }
  function choose(option: SelectOption) {
    onValueChange(option.value);
    close();
  }
  function openPicker() {
    setQuery("");
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setOpen(true);
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      event.preventDefault();
      close();
      return;
    }
    if (event.target !== searchRef.current && event.target !== listRef.current) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = filtered.length
        ? (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) %
          filtered.length
        : 0;
      setActiveIndex(next);
      document
        .getElementById(`${id}-option-${next}`)
        ?.scrollIntoView({ block: "nearest" });
    }
    if (
      (event.key === "Home" || event.key === "End") &&
      event.target !== searchRef.current
    ) {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : Math.max(0, filtered.length - 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) choose(filtered[activeIndex]);
    }
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-dialog` : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          "flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-[#dbe3e8] bg-white px-3 py-2.5 text-left text-[13px] text-ink",
          "focus-visible:border-[#8698a4] focus-visible:ring-3 focus-visible:ring-[#e4ebf1] focus-visible:outline-none max-md:text-base",
          className,
        )}
      >
        <span
          className={cn(
            "line-clamp-2 min-w-0 flex-1 text-sm leading-5 wrap-anywhere md:block md:truncate",
            !selected && "text-muted",
          )}
        >
          {selected?.label || placeholder}
        </span>
        <Icon name="chevron" size={16} className="shrink-0 rotate-90 text-muted" />
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            id={`${id}-dialog`}
            aria-labelledby={`${id}-title`}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onKeyDown={handleKeyDown}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                  event.clientX < rect.left ||
                  event.clientX > rect.right ||
                  event.clientY < rect.top ||
                  event.clientY > rect.bottom
                )
                  close();
              }
            }}
            style={position}
            className={cn(
              "fixed m-0 max-h-[min(75dvh,32rem)] max-w-none overflow-hidden rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/30 open:flex open:flex-col",
              "max-md:inset-x-3 max-md:top-auto max-md:bottom-3 max-md:w-auto max-md:pb-[env(safe-area-inset-bottom)]",
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2">
              <h2
                id={`${id}-title`}
                className="min-w-0 text-sm font-semibold wrap-anywhere"
              >
                {label}
              </h2>
              <button
                type="button"
                aria-label={`Close ${label.toLowerCase()} choices`}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas"
                onClick={close}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            {searchable && (
              <div className="shrink-0 px-4 pt-3">
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-line px-3">
                  <Icon name="search" size={18} className="text-muted" />
                  <input
                    ref={searchRef}
                    type="search"
                    aria-label={`Search ${label.toLowerCase()}`}
                    role="combobox"
                    aria-expanded="true"
                    aria-autocomplete="list"
                    aria-controls={`${id}-listbox`}
                    aria-activedescendant={
                      filtered.length ? `${id}-option-${activeIndex}` : undefined
                    }
                    placeholder="Type to find an option…"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    className="w-full min-w-0 bg-transparent py-2 text-base outline-none"
                    autoComplete="off"
                  />
                </label>
              </div>
            )}
            <div
              id={`${id}-listbox`}
              ref={listRef}
              role="listbox"
              aria-label={label}
              aria-activedescendant={
                filtered.length ? `${id}-option-${activeIndex}` : undefined
              }
              tabIndex={0}
              className="min-h-0 overflow-y-auto overscroll-contain p-2 outline-none"
            >
              {filtered.map((option, index) => (
                <button
                  key={option.value}
                  id={`${id}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={-1}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={cn(
                    "flex min-h-12 w-full items-start gap-3 rounded-lg p-3 text-left",
                    index === activeIndex && "bg-canvas",
                    option.value === value && "bg-[#edf3ef]",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-6 font-medium wrap-anywhere">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs leading-5 wrap-anywhere text-muted">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {option.value === value && (
                    <Icon name="check" size={18} className="mt-1 shrink-0 text-success" />
                  )}
                </button>
              ))}
              {(!filtered.length || filtered.every((option) => option.action)) &&
                query && (
                  <p className="px-3 py-6 text-sm text-muted">
                    No matches. Try a different name.
                  </p>
                )}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
