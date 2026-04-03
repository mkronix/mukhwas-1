import React, { useState } from "react";
import { useStorefrontAuth } from "@/storefront/auth/useStorefrontAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AccountProfilePage: React.FC = () => {
  const { customer } = useStorefrontAuth();
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-6">
        Profile Settings
      </h1>
      <form onSubmit={handleSave} className="max-w-lg flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Full Name
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Email
          </Label>
          <Input type="email" value={customer?.email || ""} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Phone
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default AccountProfilePage;
