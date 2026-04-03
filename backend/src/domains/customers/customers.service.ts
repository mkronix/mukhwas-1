import { randomBytes } from "crypto";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/hash";
import { buildPaginationMeta } from "../../utils/pagination";
import { CustomerRepository } from "./customers.repository";
import type {
  CustomerListQuery,
  UpdateCustomerInput,
  StorefrontUpdateProfileInput,
  CreateAddressInput,
  UpdateAddressInput,
  CustomerOrdersQuery,
  StatusToggleInput,
  CreatePosCustomerInput,
} from "./customers.schema";

function toPublicCustomer(row: Record<string, unknown>) {
  const {
    password_hash: _pw,
    verification_token: _vt,
    verification_token_expires_at: _vte,
    reset_token: _rt,
    reset_token_expires_at: _rte,
    ...rest
  } = row;
  return rest;
}

export class CustomerService {
  static async list(query: CustomerListQuery) {
    const { rows, total } = await CustomerRepository.findAll(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async getById(id: string) {
    const customer = await CustomerRepository.findByIdWithAddresses(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    return customer;
  }

  static async update(id: string, input: UpdateCustomerInput) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    return CustomerRepository.update(id, input);
  }

  static async toggleStatus(id: string, input: StatusToggleInput) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    return CustomerRepository.toggleActive(id, input.is_active);
  }

  static async getOrders(customerId: string, query: CustomerOrdersQuery) {
    const customer = await CustomerRepository.findById(customerId);
    if (!customer) throw ApiError.notFound("Customer not found");
    const { rows, total } = await CustomerRepository.getOrders(customerId, query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async getAddresses(customerId: string) {
    return CustomerRepository.getAddresses(customerId);
  }

  static async getProfile(customerId: string) {
    const customer = await CustomerRepository.findByIdWithAddresses(customerId);
    if (!customer) throw ApiError.notFound("Customer not found");
    return customer;
  }

  static async updateProfile(customerId: string, input: StorefrontUpdateProfileInput) {
    return CustomerRepository.update(customerId, input);
  }

  static async getMyAddresses(customerId: string) {
    return CustomerRepository.getAddresses(customerId);
  }

  static async createAddress(customerId: string, input: CreateAddressInput) {
    return CustomerRepository.createAddress(customerId, input);
  }

  static async updateAddress(addressId: string, customerId: string, input: UpdateAddressInput) {
    const addr = await CustomerRepository.findAddress(addressId);
    if (!addr || addr.customer_id !== customerId) throw ApiError.notFound("Address not found");
    return CustomerRepository.updateAddress(addressId, customerId, input);
  }

  static async deleteAddress(addressId: string, customerId: string) {
    const addr = await CustomerRepository.findAddress(addressId);
    if (!addr || addr.customer_id !== customerId) throw ApiError.notFound("Address not found");
    await CustomerRepository.deleteAddress(addressId, customerId);
  }

  static async setDefaultAddress(addressId: string, customerId: string) {
    const addr = await CustomerRepository.findAddress(addressId);
    if (!addr || addr.customer_id !== customerId) throw ApiError.notFound("Address not found");
    return CustomerRepository.setDefaultAddress(addressId, customerId);
  }

  static async createFromPos(input: CreatePosCustomerInput) {
    const existing = await CustomerRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("Email already registered", "DUPLICATE_ENTRY");

    const password_hash = await hashPassword(randomBytes(32).toString("hex"));
    const row = await CustomerRepository.insertPosCustomer({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password_hash,
    });

    return toPublicCustomer(row as Record<string, unknown>);
  }
}
