"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Save
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date | null;
  createdAt: Date;
  permissions: string[];
  groups: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  permissions: string[];
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'groups'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    permissions: [],
    groups: []
  });

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date('2024-01-01'),
        permissions: ['read', 'write', 'delete', 'admin'],
        groups: ['administrators']
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'analyst',
        status: 'active',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date('2024-01-05'),
        permissions: ['read', 'write'],
        groups: ['analysts']
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        role: 'viewer',
        status: 'active',
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date('2024-01-10'),
        permissions: ['read'],
        groups: ['viewers']
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        role: 'analyst',
        status: 'pending',
        lastLogin: null,
        createdAt: new Date('2024-01-15'),
        permissions: ['read', 'write'],
        groups: ['analysts']
      }
    ];

    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full system access with administrative privileges',
        permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_system'],
        userCount: 1
      },
      {
        id: '2',
        name: 'Analyst',
        description: 'Can create and manage analyses, view reports',
        permissions: ['read', 'write', 'create_analysis', 'view_reports'],
        userCount: 2
      },
      {
        id: '3',
        name: 'Viewer',
        description: 'Read-only access to public resources',
        permissions: ['read', 'view_public'],
        userCount: 1
      },
      {
        id: '4',
        name: 'Guest',
        description: 'Limited access for temporary users',
        permissions: ['read'],
        userCount: 0
      }
    ];

    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Administrators',
        description: 'System administrators with full access',
        members: ['john.doe@company.com'],
        permissions: ['read', 'write', 'delete', 'admin']
      },
      {
        id: '2',
        name: 'Analysts',
        description: 'Data analysts and architecture reviewers',
        members: ['jane.smith@company.com', 'sarah.wilson@company.com'],
        permissions: ['read', 'write', 'create_analysis']
      },
      {
        id: '3',
        name: 'Viewers',
        description: 'Read-only users for viewing reports',
        members: ['mike.johnson@company.com'],
        permissions: ['read']
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setRoles(mockRoles);
      setGroups(mockGroups);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'analyst':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...newUser }
          : user
      ));
    } else {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name!,
        email: newUser.email!,
        role: newUser.role as User['role'],
        status: newUser.status as User['status'],
        lastLogin: null,
        createdAt: new Date(),
        permissions: newUser.permissions || [],
        groups: newUser.groups || []
      };
      setUsers(prev => [user, ...prev]);
    }
    setShowUserModal(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'viewer',
      status: 'active',
      permissions: [],
      groups: []
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-foreground-muted">
            Manage users, roles, permissions, and access controls
          </p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { id: 'users', name: 'Users', icon: Users },
          { id: 'roles', name: 'Roles', icon: Shield },
          { id: 'groups', name: 'Groups', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'users' | 'roles' | 'groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
                <option value="guest">Guest</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1 capitalize">{user.status}</span>
                        </span>
                      </div>
                      <p className="text-foreground-muted text-sm mb-2">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {user.createdAt.toLocaleDateString()}
                        </div>
                        {user.lastLogin && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last login {user.lastLogin.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        user.status === 'active'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {role.userCount} users
                    </span>
                  </div>
                  <p className="text-foreground-muted text-sm mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission) => (
                      <span key={permission} className="px-2 py-1 bg-muted text-foreground-muted rounded text-xs">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {group.members.length} members
                    </span>
                  </div>
                  <p className="text-foreground-muted text-sm mb-3">{group.description}</p>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">Members</h4>
                      <div className="text-xs text-foreground-muted">
                        {group.members.length > 0 ? group.members.join(', ') : 'No members'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.permissions.map((permission) => (
                          <span key={permission} className="px-2 py-1 bg-muted text-foreground-muted rounded text-xs">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role *
                  </label>
                  <select
                    value={newUser.role || 'viewer'}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="admin">Administrator</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status *
                  </label>
                  <select
                    value={newUser.status || 'active'}
                    onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
