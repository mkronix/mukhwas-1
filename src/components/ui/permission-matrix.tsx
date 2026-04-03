import React, { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export type PermissionItem = {
    key: string;
    module: string;
    subModule?: string;
    description: string;
};

type PermissionMatrixProps = {
    permissions: PermissionItem[];
    selected: string[];
    onChange: (next: string[]) => void;
    disabledKeys?: string[];
    title?: string;
    emptyMessage?: string;
    showSearch?: boolean;
};

function formatLabel(value: string): string {
    return value
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase())
        .trim();
}

export function PermissionMatrix({
    permissions,
    selected,
    onChange,
    disabledKeys = [],
    title,
    emptyMessage = "No permissions available.",
    showSearch = true,
}: PermissionMatrixProps) {
    const [query, setQuery] = useState("");

    const normalized = useMemo(() => {
        return permissions.map((p) => ({
            ...p,
            module: formatLabel(p.module),
            subModule: p.subModule ? formatLabel(p.subModule) : "General",
        }));
    }, [permissions]);

    const filtered = useMemo(() => {
        if (!query.trim()) return normalized;
        const q = query.toLowerCase();
        return normalized.filter((p) => {
            return (
                p.description.toLowerCase().includes(q) ||
                p.key.toLowerCase().includes(q) ||
                p.module.toLowerCase().includes(q) ||
                p.subModule?.toLowerCase().includes(q)
            );
        });
    }, [normalized, query]);

    const grouped = useMemo(() => {
        const map = new Map<string, Map<string, PermissionItem[]>>();
        for (const item of filtered) {
            const moduleKey = item.module || "Other";
            const subKey = item.subModule || "General";
            if (!map.has(moduleKey)) {
                map.set(moduleKey, new Map());
            }
            const subMap = map.get(moduleKey)!;
            if (!subMap.has(subKey)) {
                subMap.set(subKey, []);
            }
            subMap.get(subKey)!.push(item);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const disabledSet = useMemo(() => new Set(disabledKeys), [disabledKeys]);

    const updateSelected = (next: Set<string>) => {
        onChange(Array.from(next));
    };

    const toggleKey = (key: string) => {
        if (disabledSet.has(key)) return;
        const next = new Set(selectedSet);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        updateSelected(next);
    };

    const toggleGroup = (items: PermissionItem[], checked: boolean) => {
        const next = new Set(selectedSet);
        for (const item of items) {
            if (disabledSet.has(item.key)) continue;
            if (checked) {
                next.add(item.key);
            } else {
                next.delete(item.key);
            }
        }
        updateSelected(next);
    };

    if (permissions.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
        <div className="space-y-4">
            {title && <h4 className="text-sm font-semibold text-foreground">{title}</h4>}
            {showSearch && (
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search permissions..."
                />
            )}
            <Accordion type="multiple" className="w-full">
                {grouped.map(([moduleName, subGroups]) => {
                    const moduleItems = Array.from(subGroups.values()).flat();
                    const moduleSelected = moduleItems.filter((i) => selectedSet.has(i.key)).length;
                    const moduleTotal = moduleItems.length;
                    const moduleChecked = moduleSelected > 0 && moduleSelected === moduleTotal;

                    return (
                        <AccordionItem key={moduleName} value={moduleName}>
                            <AccordionTrigger className="no-underline">
                                <div className="flex w-full items-center justify-between pr-2">
                                    <span className="text-sm font-semibold text-foreground">{moduleName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {moduleSelected}/{moduleTotal}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    {Array.from(subGroups.entries())
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([subName, items]) => {
                                            const subSelected = items.filter((i) => selectedSet.has(i.key)).length;
                                            const subChecked = subSelected > 0 && subSelected === items.length;
                                            return (
                                                <div key={`${moduleName}-${subName}`} className="rounded-md border border-border p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            {subName}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {subSelected}/{items.length}
                                                            </span>
                                                            <Switch
                                                                checked={subChecked}
                                                                onCheckedChange={(checked) => toggleGroup(items, checked)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {items.map((perm) => (
                                                            <label
                                                                key={perm.key}
                                                                className="flex items-center justify-between gap-2 text-sm text-foreground"
                                                            >
                                                                <span className="pr-2">{perm.description}</span>
                                                                <Switch
                                                                    checked={selectedSet.has(perm.key)}
                                                                    onCheckedChange={() => toggleKey(perm.key)}
                                                                    disabled={disabledSet.has(perm.key)}
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
