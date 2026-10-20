export const ROLES = {
  WORKER: 'worker',
  MANAGER: 'manager',
  OWNER: 'owner',
  ADMIN: 'admin',
};

export const ALL_ROLES = Object.values(ROLES);

const ACTIONS = ['create', 'read', 'update', 'delete'];
const ALL_ACTIONS = ACTIONS;

export const RESOURCES = [
  'farm',
  'field',
  'livestock',
  'inventory',
  'worker',
  'finance',
  'task',
  'diary',
  'activityLog',
];

const full = () => [...ALL_ACTIONS];
const readOnly = () => ['read'];

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.fromEntries(RESOURCES.map((r) => [r, full()])),
  [ROLES.OWNER]: Object.fromEntries(RESOURCES.map((r) => [r, full()])),
  [ROLES.MANAGER]: {
    farm: ['create', 'read', 'update'],
    field: full(),
    livestock: full(),
    inventory: full(),
    worker: ['create', 'read', 'update'],
    finance: ['create', 'read'],
    task: full(),
    diary: full(),
    activityLog: readOnly(),
  },
  [ROLES.WORKER]: {
    farm: ['read'],
    field: ['read'],
    livestock: ['read', 'update'],
    inventory: ['read', 'update'],
    worker: ['read'],
    finance: ['read'],
    task: ['create', 'read', 'update'],
    diary: ['create', 'read'],
    activityLog: readOnly(),
  },
};

export const isAdmin = (user) => user?.role === ROLES.ADMIN;

export const can = (user, resource, action) => {
  const role = user?.role;
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role]?.[resource];
  if (!allowed) return false;
  return allowed.includes(action);
};
