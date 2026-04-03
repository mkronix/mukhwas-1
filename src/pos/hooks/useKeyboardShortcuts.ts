import { useEffect } from 'react';

interface KeyboardShortcutCallbacks {
  onCharge: () => void;
  onTogglePayment: (mode: 'cash' | 'upi' | 'card') => void;
  onSetMultiplier: (n: number) => void;
  onClearMultiplier: () => void;
  onRemoveLastItem: () => void;
  onShowHelp: () => void;
  onCloseModal: () => void;
  onFocusSearch: () => void;
  isPaymentValid: boolean;
  hasOpenModal: boolean;
  hasMultiplier: boolean;
}

export const useKeyboardShortcuts = ({
  onCharge,
  onTogglePayment,
  onSetMultiplier,
  onClearMultiplier,
  onRemoveLastItem,
  onShowHelp,
  onCloseModal,
  onFocusSearch,
  isPaymentValid,
  hasOpenModal,
  hasMultiplier,
}: KeyboardShortcutCallbacks) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === 'F1') {
        e.preventDefault();
        onTogglePayment('cash');
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        onTogglePayment('upi');
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        onTogglePayment('card');
        return;
      }
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault();
        if (isPaymentValid) onCharge();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onFocusSearch();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (hasOpenModal) {
          onCloseModal();
        } else if (hasMultiplier) {
          onClearMultiplier();
        }
        return;
      }

      if (isInput) return;

      if (e.key === '?') {
        e.preventDefault();
        onShowHelp();
        return;
      }

      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        onSetMultiplier(parseInt(e.key, 10));
        return;
      }

      if (e.shiftKey && e.code && /^Digit[1-9]$/.test(e.code)) {
        e.preventDefault();
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        onClearMultiplier();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onRemoveLastItem();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    onCharge, onTogglePayment, onSetMultiplier, onClearMultiplier,
    onRemoveLastItem, onShowHelp, onCloseModal, onFocusSearch,
    isPaymentValid, hasOpenModal, hasMultiplier,
  ]);
};