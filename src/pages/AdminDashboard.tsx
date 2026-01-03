import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Bell,
  LogOut,
  Menu,
  Edit,
  Trash2,
  Eye,
  Search,
  Check,
  Loader2,
  ClipboardList,
  X,
  Activity,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserActivityPanel from "@/components/admin/UserActivityPanel";
import UserDetailModal from "@/components/admin/UserDetailModal";
import AnalyticsOverview from "@/components/admin/AnalyticsOverview";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  profession: string | null;
  organization: string | null;
  bio: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface MembershipApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  profession: string | null;
  organization: string | null;
  experience_years: number | null;
  motivation: string | null;
  status: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  proof_description: string | null;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, messagesRes, applicationsRes, activitiesRes, paymentsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("membership_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("payments").select("*").order("created_at", { ascending: false })
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (rolesRes.data) setUserRoles(rolesRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (applicationsRes.data) setApplications(applicationsRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data as ActivityLog[]);
      if (paymentsRes.data) setPayments(paymentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          status,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      
      setPayments(payments.map(p => 
        p.id === id ? { ...p, status, verified_by: user?.id || null, verified_at: new Date().toISOString() } : p
      ));
      toast.success(`Payment ${status}`);
    } catch (error) {
      toast.error("Failed to update payment");
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("membership_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error("Failed to update application");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, is_read: true } : msg
      ));
      toast.success("Message marked as read");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setMessages(messages.filter(msg => msg.id !== id));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || "user";
  };

  const handleViewUser = (profile: Profile) => {
    setSelectedUser(profile);
    setUserModalOpen(true);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUserRoles(userRoles.map(r => 
      r.user_id === userId ? { ...r, role: newRole } : r
    ));
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    
    try {
      // Delete from profiles (will cascade to related data)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      // Delete user role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      setProfiles(profiles.filter(p => p.id !== userId));
      setUserRoles(userRoles.filter(r => r.user_id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const getUserActivities = (userId: string) => {
    return activities.filter(a => a.user_id === userId);
  };

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || "Unknown User";
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = userRoles.filter(r => r.role === "admin").length;
  const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "users", label: "User Management", icon: Users },
    { id: "activity", label: "Activity Log", icon: Activity },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PPSWZ</title>
        <meta name="description" content="PPSWZ Admin Dashboard - Manage users, content, and organization settings" />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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

        <main className="flex-1 min-w-0">
          <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-heading font-semibold capitalize">{activeTab.replace(/-/g, " ")}</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5" />
                {messages.filter(m => !m.is_read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                )}
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

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <AnalyticsOverview
                    profiles={profiles}
                    activities={activities}
                    applications={applications}
                    adminCount={adminCount}
                  />
                )}

                {activeTab === "payments" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-primary" />
                          Payment Tracking
                        </h2>
                        <p className="text-sm text-muted-foreground">{payments.length} total payments • {pendingPaymentsCount} pending</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{payments.filter(p => p.status === "pending").length}</p>
                              <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{payments.filter(p => p.status === "verified").length}</p>
                              <p className="text-sm text-muted-foreground">Verified</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{payments.filter(p => p.status === "rejected").length}</p>
                              <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {payments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No payments submitted yet</p>
                            </div>
                          ) : (
                            payments.map((payment) => (
                              <div key={payment.id} className={`p-4 ${payment.status === "pending" ? 'bg-accent/5' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                      {getUserName(payment.user_id).charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">{getUserName(payment.user_id)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getPaymentStatusColor(payment.status)}`}>
                                          {getPaymentStatusIcon(payment.status)}
                                          {payment.status}
                                        </span>
                                      </div>
                                      <p className="text-lg font-semibold text-primary">TZS {payment.amount.toLocaleString()}</p>
                                      <p className="text-sm text-muted-foreground">{payment.payment_method}</p>
                                      {payment.reference_number && (
                                        <p className="text-sm text-muted-foreground">Ref: {payment.reference_number}</p>
                                      )}
                                      {payment.proof_description && (
                                        <p className="text-sm text-muted-foreground mt-1">{payment.proof_description}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-2">{formatDate(payment.created_at)}</p>
                                    </div>
                                  </div>
                                  {payment.status === "pending" && (
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                                        onClick={() => updatePaymentStatus(payment.id, "verified")}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-destructive hover:text-destructive hover:bg-red-50" 
                                        onClick={() => updatePaymentStatus(payment.id, "rejected")}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <UserActivityPanel
                    activities={activities}
                    profiles={profiles}
                    loading={loading}
                    onRefresh={fetchData}
                  />
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
                        <Input 
                          placeholder="Search users..." 
                          className="pl-10" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground self-center">
                          {filteredProfiles.length} users
                        </span>
                      </div>
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
                                <th className="text-left p-4 font-medium">Joined</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProfiles.map((profile) => (
                                <tr key={profile.id} className="border-t hover:bg-muted/30">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                                        {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
                                      </div>
                                      {profile.full_name || "No name"}
                                    </div>
                                  </td>
                                  <td className="p-4 text-muted-foreground">{profile.email}</td>
                                  <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      getUserRole(profile.id) === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                                    }`}>
                                      {getUserRole(profile.id)}
                                    </span>
                                  </td>
                                  <td className="p-4 text-muted-foreground">{formatDate(profile.created_at)}</td>
                                  <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        className="p-2 hover:bg-muted rounded-lg"
                                        onClick={() => handleViewUser(profile)}
                                        title="View Details"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button 
                                        className="p-2 hover:bg-muted rounded-lg"
                                        onClick={() => handleViewUser(profile)}
                                        title="Edit User"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button 
                                        className="p-2 hover:bg-muted rounded-lg text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete ${profile.full_name || profile.email}?`)) {
                                            deleteUser(profile.id);
                                          }
                                        }}
                                        title="Delete User"
                                        disabled={profile.id === user?.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredProfiles.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No users found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "messages" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Contact Submissions ({messages.length})</h2>
                      <p className="text-sm text-muted-foreground">{messages.filter(m => !m.is_read).length} unread</p>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {messages.map((msg) => (
                            <div key={msg.id} className={`p-4 ${!msg.is_read ? 'bg-accent/5' : ''}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                    {msg.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{msg.name}</p>
                                      {!msg.is_read && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">New</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{msg.email} {msg.phone && `• ${msg.phone}`}</p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{formatDate(msg.created_at)}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {!msg.is_read && (
                                    <Button variant="outline" size="sm" onClick={() => markMessageAsRead(msg.id)}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMessage(msg.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {messages.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No contact submissions yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "applications" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Membership Applications ({applications.length})</h2>
                      <p className="text-sm text-muted-foreground">{applications.filter(a => a.status === "pending").length} pending</p>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {applications.map((app) => (
                            <div key={app.id} className={`p-4 ${app.status === "pending" ? 'bg-accent/5' : ''}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                    {app.full_name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{app.full_name}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        app.status === "pending" ? 'bg-yellow-100 text-yellow-700' :
                                        app.status === "approved" ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {app.status}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{app.email} {app.phone && `• ${app.phone}`}</p>
                                    <p className="text-sm"><span className="font-medium">Profession:</span> {app.profession || "N/A"}</p>
                                    {app.organization && <p className="text-sm"><span className="font-medium">Organization:</span> {app.organization}</p>}
                                    {app.experience_years !== null && <p className="text-sm"><span className="font-medium">Experience:</span> {app.experience_years} years</p>}
                                    {app.motivation && <p className="text-sm mt-2 text-muted-foreground">{app.motivation}</p>}
                                    <p className="text-xs text-muted-foreground mt-2">{formatDate(app.created_at)}</p>
                                  </div>
                                </div>
                                {app.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="text-green-600" onClick={() => updateApplicationStatus(app.id, "approved")}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateApplicationStatus(app.id, "rejected")}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {applications.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No membership applications yet</p>
                          )}
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
                            <Input defaultValue="Private Practice Social Workers Zanzibar" />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Contact Email</label>
                            <Input defaultValue="info@ppswz.or.tz" />
                          </div>
                          <Button>Save Changes</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <UserDetailModal
        user={selectedUser}
        userRole={selectedUser ? getUserRole(selectedUser.id) : "user"}
        activities={selectedUser ? getUserActivities(selectedUser.id) : []}
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        onRoleChange={handleRoleChange}
      />
    </>
  );
};

export default AdminDashboard;
