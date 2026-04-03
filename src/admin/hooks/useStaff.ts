import { useState, useEffect, useCallback } from 'react';
import type { Staff, Role, RolePermission, CMSSlider, CMSBanner, Coupon, CustomerReview } from '@/types';
import { StaffService, RoleService } from '@/admin/services/StaffService';
import { ContentService, CouponService, ReviewService } from '@/admin/services/ContentService';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([StaffService.getAll(), RoleService.getAll()]);
      setStaff(s); setRoles(r);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { staff, roles, loading, refresh: fetch };
}

export function useStaffDropdown() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setStaff(await StaffService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { staff, loading };
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRoles(await RoleService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { roles, loading, refresh: fetch };
}

export function useRolePermissions(roleId: string | null) {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const fetch = useCallback(async () => {
    if (!roleId) { setPermissions([]); return; }
    setLoading(true);
    try { setPermissions(await RoleService.getPermissions(roleId)); } finally { setLoading(false); }
  }, [roleId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { permissions, loading, refresh: fetch };
}

export function useContent() {
  const [sliders, setSliders] = useState<CMSSlider[]>([]);
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b, c, r] = await Promise.all([
        ContentService.getSliders(), ContentService.getBanners(),
        CouponService.getAll(), ReviewService.getAll(),
      ]);
      setSliders(s); setBanners(b); setCoupons(c); setReviews(r);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { sliders, banners, coupons, reviews, loading, refresh: fetch };
}
