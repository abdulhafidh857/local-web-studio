import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const stats = [
    { label: "Total Members", value: "248", change: "+12%", icon: Users },
    { label: "Pending Applications", value: "15", change: "+3", icon: FileText },
    { label: "Contact Messages", value: "8", change: "New", icon: MessageSquare },
    { label: "Monthly Visits", value: "1,240", change: "+28%", icon: BarChart3 },
  ];

  const recentUsers = [
    { id: 1, name: "Fatma Ali Hassan", email: "fatma@email.com", role: "Member", status: "Active", joined: "2024-01-15" },
    { id: 2, name: "Ahmed Mohammed", email: "ahmed@email.com", role: "Member", status: "Pending", joined: "2024-01-14" },
    { id: 3, name: "Mwanaisha Juma", email: "mwanaisha@email.com", role: "Admin", status: "Active", joined: "2024-01-10" },
    { id: 4, name: "Omar Salim", email: "omar@email.com", role: "Member", status: "Active", joined: "2024-01-08" },
  ];

  const recentMessages = [
    { id: 1, name: "John Doe", subject: "Membership Inquiry", date: "2024-01-15", read: false },
    { id: 2, name: "Sarah Smith", subject: "Workshop Question", date: "2024-01-14", read: true },
    { id: 3, name: "Michael Brown", subject: "Partnership Proposal", date: "2024-01-13", read: false },
  ];

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "content", label: "Content", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PPSWZ</title>
        <meta name="description" content="PPSWZ Admin Dashboard - Manage users, content, and organization settings" />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-primary text-primary-foreground
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-primary-foreground/20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold">PPSWZ</span>
              <span className="text-xs bg-primary-foreground/20 px-2 py-1 rounded">Admin</span>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === item.id 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/20 space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                Back to Website
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Header */}
          <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-heading font-semibold capitalize">{activeTab}</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-secondary">{stat.change}</p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <stat.icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Members</CardTitle>
                      <CardDescription>Latest member registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentUsers.slice(0, 4).map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === 'Active' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Messages</CardTitle>
                      <CardDescription>Contact form submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentMessages.map((msg) => (
                          <div key={msg.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            msg.read ? 'bg-muted/50' : 'bg-accent/10 border border-accent/20'
                          }`}>
                            <div>
                              <p className="font-medium">{msg.name}</p>
                              <p className="text-sm text-muted-foreground">{msg.subject}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{msg.date}</p>
                              {!msg.read && <span className="text-xs text-accent">Unread</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">Name</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Joined</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentUsers.map((user) => (
                            <tr key={user.id} className="border-t">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                                    {user.name.charAt(0)}
                                  </div>
                                  {user.name}
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{user.email}</td>
                              <td className="p-4">{user.role}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  user.status === 'Active' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground">{user.joined}</td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <button className="p-2 hover:bg-muted rounded-lg"><Eye className="w-4 h-4" /></button>
                                  <button className="p-2 hover:bg-muted rounded-lg"><Edit className="w-4 h-4" /></button>
                                  <button className="p-2 hover:bg-muted rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Content Management</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Content
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Home Page", "About Us", "Services", "Goals", "Contact"].map((page) => (
                    <Card key={page} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <FileText className="w-8 h-8 text-primary" />
                          <button className="p-2 hover:bg-muted rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-semibold">{page}</h3>
                        <p className="text-sm text-muted-foreground">Last edited: Jan 15, 2024</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold">Contact Submissions</h2>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {recentMessages.map((msg) => (
                        <div key={msg.id} className={`p-4 hover:bg-muted/30 cursor-pointer ${!msg.read ? 'bg-accent/5' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                {msg.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{msg.name}</p>
                                <p className="text-sm text-muted-foreground">{msg.subject}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{msg.date}</p>
                              {!msg.read && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">New</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold">Settings</h2>
                
                <div className="grid gap-6 max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                      <CardDescription>Manage your organization details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Organization Name</label>
                        <Input defaultValue="Private Practice in Social Work Zanzibar" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Email</label>
                        <Input defaultValue="info@ppswz.org" />
                      </div>
                      <Button>Save Changes</Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
