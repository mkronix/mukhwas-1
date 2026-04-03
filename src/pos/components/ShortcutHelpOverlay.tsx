import React from 'react';
import { X } from 'lucide-react';

interface ShortcutHelpOverlayProps {
  onClose: () => void;
}

const shortcuts = [
  {
    group: 'Navigation',
    items: [
      { key: 'Ctrl+F', label: 'Focus product search' },
      { key: '?', label: 'Toggle this help overlay' },
    ],
  },
  {
    group: 'Cart',
    items: [
      { key: '1–9', label: 'Set quantity multiplier for next product' },
      { key: '0', label: 'Clear multiplier' },
      { key: 'Del / ⌫', label: 'Remove last cart item' },
      { key: 'Esc', label: 'Close modal / clear multiplier' },
    ],
  },
  {
    group: 'Payment',
    items: [
      { key: 'F1', label: 'Toggle Cash' },
      { key: 'F2', label: 'Toggle UPI' },
      { key: 'F3', label: 'Toggle Card' },
      { key: 'Enter', label: 'Charge / Complete sale' },
    ],
  },
];

export const ShortcutHelpOverlay: React.FC<ShortcutHelpOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-card-foreground">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent transition-colors" title="Close (Esc)">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-5">
          {shortcuts.map(group => (
            <div key={group.group}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.group}</p>
              <div className="space-y-1.5">
                {group.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-card-foreground">{item.label}</span>
                    <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md bg-secondary text-secondary-foreground text-[10px] font-mono font-semibold border border-border">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">Press <kbd className="px-1 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-[9px] border border-border">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
};