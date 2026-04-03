const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  DEVELOPER_EMAIL: import.meta.env.VITE_DEVELOPER_EMAIL ?? 'developer@mukhwas.com',
  DEVELOPER_ROLE_ID: import.meta.env.VITE_DEVELOPER_ROLE_ID ?? 'role_developer',
  IS_MOCK_MODE: (import.meta.env.VITE_MOCK_MODE ?? 'true') === 'true',
  IS_DEV_MODE: (import.meta.env.VITE_IS_DEV_MODE ?? 'false') === 'true',
} as const;

export default env;
