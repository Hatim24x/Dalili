import { UserProfile, UserRole } from '@/src/types';

const USER_KEY = 'qareeb_current_user';
const USERS_LIST_KEY = 'qareeb_registered_users';

export const authService = {
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getRegisteredUsers: (): UserProfile[] => {
    const stored = localStorage.getItem(USERS_LIST_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  register: async (data: { email: string; name: string; role: UserRole }): Promise<UserProfile> => {
    const users = authService.getRegisteredUsers();
    
    const newUser: UserProfile = {
      uid: Math.random().toString(36).substr(2, 9),
      email: data.email,
      displayName: data.name,
      role: data.role,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  login: async (email: string): Promise<UserProfile> => {
    const users = authService.getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }

    // Fallback for demo/testing if user not found in registered list
    const fallbackUser: UserProfile = {
      uid: 'demo-' + Math.random().toString(36).substr(2, 5),
      email: email,
      displayName: 'Guest User',
      role: email.includes('owner') ? 'owner' : 'user',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
    return fallbackUser;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  }
};
