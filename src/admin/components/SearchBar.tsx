import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchService,
  type SearchResult,
} from "@/admin/services/SearchService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ReactNode> = {
  product: <Package className="h-4 w-4 text-primary" />,
  order: <ShoppingCart className="h-4 w-4 text-warning" />,
  customer: <Users className="h-4 w-4 text-success" />,
  supplier: <Users className="h-4 w-4 text-info" />,
  lead: <FileText className="h-4 w-4 text-accent-foreground" />,
};

interface SearchBarProps {
  open: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    SearchService.search(query).then((r) => {
      if (!cancelled) {
        setResults(r);
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.route);
      onClose();
    },
    [navigate, onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-border bg-card overflow-hidden"
        >
          <div className="px-4 lg:px-6 py-3">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, orders, customers, suppliers, leads..."
                className="w-full pl-9 pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter" && results.length > 0)
                    handleSelect(results[0]);
                }}
              />
              {query && (
                <Button
                  variant="link"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {query.length >= 2 && (
              <div className="max-w-2xl mx-auto mt-2 max-h-[320px] overflow-y-auto">
                {searching ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : results.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {results.map((r) => (
                      <Button
                        variant="ghost"
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleSelect(r)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {iconMap[r.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-foreground truncate">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {r.subtitle}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          {r.type}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
