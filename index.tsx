import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  LineChart as LineChartIcon,
  LogOut,
  ChevronDown,
  Filter,
  Download
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

/**
 * --- UTILITIES & MOCK DATA LAYER ---
 * Simulating a backend with artificial delay and optimistic updates support.
 */

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

interface KpiMetric {
  label: string;
  value: string;
  trend: number; // percentage
  trendLabel: string;
}

// Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Freeman', email: 'alice@company.com', role: 'Admin', status: 'Active', lastActive: '2 min ago' },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'Editor', status: 'Active', lastActive: '1 hr ago' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@company.com', role: 'Viewer', status: 'Inactive', lastActive: '3 days ago' },
  { id: '4', name: 'Diana Prince', email: 'diana@company.com', role: 'Admin', status: 'Active', lastActive: '5 min ago' },
  { id: '5', name: 'Evan Wright', email: 'evan@company.com', role: 'Viewer', status: 'Active', lastActive: '1 day ago' },
  { id: '6', name: 'Fiona Green', email: 'fiona@company.com', role: 'Editor', status: 'Inactive', lastActive: '2 weeks ago' },
  { id: '7', name: 'George Hall', email: 'george@company.com', role: 'Viewer', status: 'Active', lastActive: 'Just now' },
];

const MOCK_CHART_DATA = [
  { name: 'Jan', revenue: 4000, active: 2400 },
  { name: 'Feb', revenue: 3000, active: 1398 },
  { name: 'Mar', revenue: 2000, active: 9800 },
  { name: 'Apr', revenue: 2780, active: 3908 },
  { name: 'May', revenue: 1890, active: 4800 },
  { name: 'Jun', revenue: 2390, active: 3800 },
  { name: 'Jul', revenue: 3490, active: 4300 },
];

const MOCK_KPIS: KpiMetric[] = [
  { label: 'Total Revenue', value: '$45,231.89', trend: 20.1, trendLabel: 'from last month' },
  { label: 'Active Users', value: '+2350', trend: 180.1, trendLabel: 'since last hour' },
  { label: 'Sales', value: '+12,234', trend: 19, trendLabel: 'from last month' },
  { label: 'Active Sessions', value: '+573', trend: -4.5, trendLabel: 'since last hour' },
];

/**
 * --- COMPONENT SYSTEM (SHADCN-LIKE) ---
 */

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

const Button = ({ variant = "default", size = "default", className, children, ...props }: any) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ className, children }: any) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

const CardHeader = ({ className, children }: any) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
);

const CardTitle = ({ className, children }: any) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>
);

const CardContent = ({ className, children }: any) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Badge = ({ variant = "default", className, children }: any) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200", // Custom
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
};

const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg animate-fade-in">
        {children}
      </div>
    </div>
  );
};

/**
 * --- TOAST SYSTEM ---
 */
const ToastContext = createContext<any>(null);

const ToastProvider = ({ children }: any) => {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((toast: any) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn(
            "flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg text-sm animate-slide-in-right",
            toast.variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-900' : 'border-border'
          )}>
            {toast.variant === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
             toast.variant === 'destructive' ? <XCircle className="h-4 w-4 text-red-600" /> :
             <CheckCircle2 className="h-4 w-4" />}
            <div>
              <div className="font-semibold">{toast.title}</div>
              {toast.description && <div className="text-xs opacity-90">{toast.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

/**
 * --- DASHBOARD OVERVIEW PAGE ---
 */
const DashboardOverview = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOCK_KPIS.map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              {kpi.trend > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={kpi.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
                </span>{" "}
                {kpi.trendLabel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART_DATA}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CHART_DATA}>
                   <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Bar dataKey="active" fill="#18181b" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </BarChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * --- USERS PAGE (DATA GRID) ---
 */
const UsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer' });

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 800); // Artificial network delay
    return () => clearTimeout(timer);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call + Optimistic Update
    setTimeout(() => {
      const createdUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as any,
        status: 'Active',
        lastActive: 'Just now'
      };
      
      setUsers(prev => [createdUser, ...prev]);
      setIsSubmitting(false);
      setIsCreateOpen(false);
      setNewUser({ name: '', email: '', role: 'Viewer' }); // Reset form
      addToast({
        title: "User created",
        description: `${createdUser.name} has been added to the team.`,
        variant: "success"
      });
    }, 600);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter users..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Last Active</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">{user.role}</td>
                    <td className="p-4 align-middle text-muted-foreground">{user.lastActive}</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Create User</h2>
          <p className="text-sm text-muted-foreground">
            Add a new team member to your dashboard.
          </p>
        </div>
        <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input 
              id="name" 
              placeholder="John Doe" 
              value={newUser.name}
              onChange={(e: any) => setNewUser({...newUser, name: e.target.value})}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="john@example.com" 
              value={newUser.email}
              onChange={(e: any) => setNewUser({...newUser, email: e.target.value})}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <select 
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

/**
 * --- APP SHELL (LAYOUT) ---
 */
const AppShell = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        activeTab === id 
          ? "bg-secondary text-secondary-foreground" 
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-[70px]"
      )}>
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-6 w-6 rounded bg-primary" />
            {isSidebarOpen && <span>Acme Corp</span>}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} />
          <NavItem id="users" icon={Users} label={isSidebarOpen ? "Users" : ""} />
          <NavItem id="settings" icon={Settings} label={isSidebarOpen ? "Settings" : ""} />
        </div>

        <div className="border-t p-4">
           <button className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
             <LogOut className="h-4 w-4" />
             {isSidebarOpen && <span>Log out</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
           {/* Global Search */}
           <div className="relative flex-1 md:w-auto md:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="w-full md:w-[300px] pl-9 bg-muted/50" 
            />
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border-2 border-background" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-secondary border flex items-center justify-center font-medium text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8">
           <div className="mx-auto max-w-6xl">
             {activeTab === 'dashboard' && <DashboardOverview />}
             {activeTab === 'users' && <UsersPage />}
             {activeTab === 'settings' && (
               <div className="flex items-center justify-center h-[50vh] text-muted-foreground animate-fade-in">
                 Settings panel placeholder
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
};

/**
 * --- ROOT ---
 */
const App = () => {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
