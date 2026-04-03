import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface Employee {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: string;
  is_active: boolean;
}

export class EmployeeService {
  static async getEmployees(): Promise<Employee[]> {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get<Employee[]>('/pos/employees');
    return res.data;
  }

  static async getEmployee(id: string): Promise<Employee | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get<Employee>(`/pos/employees/${id}`);
    return res.data;
  }

  static async createEmployee(data: Record<string, unknown>): Promise<Employee | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post<Employee>('/pos/employees', data);
    return res.data;
  }

  static async updateEmployee(id: string, data: Record<string, unknown>): Promise<Employee | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.put<Employee>(`/pos/employees/${id}`, data);
    return res.data;
  }
}
