import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSAuth } from "@/pos/auth/usePOSAuth";
import { posRoles } from "@/pos/mock";
import type { Staff } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Delete, Check } from "lucide-react";
import { usePOSAuthUI } from "../context/POSAuthUIContext";

export const POSLoginPage: React.FC = () => {
  const { login, getStaffList, getLockoutState } = usePOSAuth();
  const { setShowBack, setOnBack } = usePOSAuthUI();
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState("");
  const staffList = getStaffList();

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown("");
      return;
    }
    const tick = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setError("");
        setCountdown("");
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdown(
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    if (selectedStaff) {
      const lockout = getLockoutState(selectedStaff.id);
      if (lockout) {
        setLockedUntil(lockout.lockedUntil);
        setAttempts(lockout.attempts);
      }
    }
  }, [selectedStaff, getLockoutState]);

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (lockedUntil) return;
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    },
    [pin, lockedUntil],
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  const submitPin = async (pinValue: string) => {
    if (!selectedStaff) return;
    setLoading(true);
    const result = await login(selectedStaff.id, pinValue);
    setLoading(false);
    if (result.success) {
      navigate("/pos/terminal");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin("");
      setError(result.error || "Invalid PIN");
      if (result.attempts !== undefined) setAttempts(result.attempts);
      if (result.maxAttempts !== undefined) setMaxAttempts(result.maxAttempts);
      if (result.lockedUntil !== undefined) setLockedUntil(result.lockedUntil);
    }
  };

  useEffect(() => {
    if (!selectedStaff) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handlePinDigit(e.key);
      else if (e.key === "Backspace") handleBackspace();
      else if (e.key === "Escape") {
        setSelectedStaff(null);
        setPin("");
        setError("");
        setAttempts(0);
        setLockedUntil(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedStaff, handlePinDigit, handleBackspace]);

  useEffect(() => {
    if (selectedStaff) {
      setShowBack(true);
      setOnBack(() => () => {
        setSelectedStaff(null);
        setPin("");
        setError("");
        setAttempts(0);
        setLockedUntil(null);
      });
    } else {
      setShowBack(false);
      setOnBack(undefined);
    }

    return () => {
      setShowBack(false);
      setOnBack(undefined);
    };
  }, [selectedStaff, setShowBack, setOnBack]);
  if (!selectedStaff) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center text-sm text-muted-foreground mb-6">
          Select your profile to begin
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {staffList.map((staff) => {
            const role = posRoles.find((r) => r.id === staff.role_id);
            const initials = staff.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            return (
              <button
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all min-h-[120px] justify-center group"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {initials}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-card-foreground">
                    {staff.name}
                  </p>
                  {role && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                      {role.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const initials = selectedStaff.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const role = posRoles.find((r) => r.id === selectedStaff.role_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* <button
        onClick={() => {
          setSelectedStaff(null);
          setPin("");
          setError("");
          setAttempts(0);
          setLockedUntil(null);
        }}
        className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button> */}

      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <p className="text-lg font-semibold text-foreground">
          {selectedStaff.name}
        </p>
        {role && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {role.name}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-destructive font-medium">
              Account locked
            </p>
            <p className="text-2xl font-mono font-bold text-foreground">
              {countdown}
            </p>
            <p className="text-xs text-muted-foreground">
              Try again after the timer expires
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full max-w-xs"
          >
            <p className="text-sm text-muted-foreground">Enter your PIN</p>
            <motion.div
              animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-3 mb-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full transition-all duration-150 ${i < pin.length ? "bg-primary scale-110" : "bg-border"}`}
                />
              ))}
            </motion.div>

            {error && !isLocked && (
              <p className="text-xs text-destructive text-center">
                {error}
                {attempts > 0 && (
                  <span className="block mt-0.5 text-muted-foreground">
                    {attempts} of {maxAttempts} attempts used
                  </span>
                )}
              </p>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 w-full mt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handlePinDigit(d)}
                  disabled={loading || pin.length >= 4}
                  className="h-14 rounded-xl bg-secondary text-foreground text-xl font-semibold hover:bg-accent active:scale-95 transition-all disabled:opacity-40"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-xl bg-secondary text-foreground hover:bg-accent active:scale-95 transition-all flex items-center justify-center disabled:opacity-40"
              >
                <Delete className="h-5 w-5" />
              </button>
              <button
                onClick={() => handlePinDigit("0")}
                disabled={loading || pin.length >= 4}
                className="h-14 rounded-xl bg-secondary text-foreground text-xl font-semibold hover:bg-accent active:scale-95 transition-all disabled:opacity-40"
              >
                0
              </button>
              <button
                onClick={() => pin.length === 4 && submitPin(pin)}
                disabled={loading || pin.length < 4}
                className="h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
