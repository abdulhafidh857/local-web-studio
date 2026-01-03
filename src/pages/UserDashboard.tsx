import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  User, 
  CreditCard, 
  History, 
  FolderOpen, 
  Settings,
  Bell,
  LogOut,
  Menu,
  Edit,
  Download,
  Calendar,
  FileText,
  Award,
  CheckCircle,
  Save,
  Loader2,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  proof_description: string | null;
  status: string;
  created_at: string;
}

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "",
    reference_number: "",
    proof_description: ""
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    profession: "",
    organization: "",
    bio: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    monthlyNewsletter: true,
    smsNotifications: false
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPayments();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setEditForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          location: data.location || "",
          profession: data.profession || "",
          organization: data.organization || "",
          bio: data.bio || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!user) return;
    if (!paymentForm.amount || !paymentForm.payment_method) {
      toast.error("Please fill in amount and payment method");
      return;
    }
    
    setSubmittingPayment(true);
    try {
      const { error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          reference_number: paymentForm.reference_number || null,
          proof_description: paymentForm.proof_description || null
        });

      if (error) throw error;
      
      toast.success("Payment submitted successfully! Awaiting admin verification.");
      setPaymentDialogOpen(false);
      setPaymentForm({ amount: "", payment_method: "", reference_number: "", proof_description: "" });
      fetchPayments();
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error("No email associated with this account");
      return;
    }
    
    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending reset password email:", error);
      toast.error("Failed to send reset password email");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // In a real app, you would save these to the database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          location: editForm.location,
          profession: editForm.profession,
          organization: editForm.organization,
          bio: editForm.bio
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const membershipInfo = {
    type: "Member",
    status: "Active",
    since: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A",
    id: user?.id ? `PPSWZ-${user.id.slice(0, 8).toUpperCase()}` : "N/A"
  };

  const resources = [
    { id: 1, name: "Social Work Code of Ethics", type: "PDF", size: "2.4 MB", category: "Guidelines" },
    { id: 2, name: "Membership Benefits Guide", type: "PDF", size: "1.8 MB", category: "Information" },
    { id: 3, name: "Annual Report 2023", type: "PDF", size: "5.2 MB", category: "Reports" },
    { id: 4, name: "Training Resources Pack", type: "ZIP", size: "15.6 MB", category: "Training" },
  ];

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "membership", label: "Membership", icon: CreditCard },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <Helmet>
        <title>Member Dashboard - PPSWZ</title>
        <meta name="description" content="PPSWZ Member Dashboard - Manage your profile, membership, and access resources" />
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
          w-64 bg-secondary text-secondary-foreground
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-secondary-foreground/20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold">PPSWZ</span>
              <span className="text-xs bg-secondary-foreground/20 px-2 py-1 rounded">Member</span>
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
                    ? 'bg-secondary-foreground/20 text-secondary-foreground' 
                    : 'text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-foreground/20 space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10">
                Back to Website
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
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
              <h1 className="text-xl font-heading font-semibold capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{profile?.full_name || "Member"}</p>
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
                {activeTab === "profile" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Manage your personal details</CardDescription>
                          </div>
                          {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-4xl font-bold mb-4">
                              {profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || user?.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                          </div>
                          
                          {isEditing ? (
                            <div className="flex-1 grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
                                <Input 
                                  value={editForm.full_name} 
                                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                  placeholder="Enter your full name"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Email</label>
                                <Input value={user?.email || ""} disabled className="bg-muted" />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                                <Input 
                                  value={editForm.phone} 
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  placeholder="+255 XXX XXX XXX"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Location</label>
                                <Input 
                                  value={editForm.location} 
                                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                  placeholder="City, Country"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Profession</label>
                                <Input 
                                  value={editForm.profession} 
                                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                                  placeholder="Your profession"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-1">Organization</label>
                                <Input 
                                  value={editForm.organization} 
                                  onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                  placeholder="Your organization"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-sm text-muted-foreground block mb-1">Bio</label>
                                <Textarea 
                                  value={editForm.bio} 
                                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                  placeholder="Tell us about yourself..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 grid sm:grid-cols-2 gap-6">
                              <div>
                                <label className="text-sm text-muted-foreground">Full Name</label>
                                <p className="font-medium">{profile?.full_name || "Not set"}</p>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">Email</label>
                                <p className="font-medium">{user?.email}</p>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">Phone</label>
                                <p className="font-medium">{profile?.phone || "Not set"}</p>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">Location</label>
                                <p className="font-medium">{profile?.location || "Not set"}</p>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">Profession</label>
                                <p className="font-medium">{profile?.profession || "Not set"}</p>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">Organization</label>
                                <p className="font-medium">{profile?.organization || "Not set"}</p>
                              </div>
                              {profile?.bio && (
                                <div className="sm:col-span-2">
                                  <label className="text-sm text-muted-foreground">Bio</label>
                                  <p className="font-medium">{profile.bio}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "payments" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold">My Payments</h2>
                        <p className="text-sm text-muted-foreground">Submit and track your payment confirmations</p>
                      </div>
                      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Submit Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Payment Confirmation</DialogTitle>
                            <DialogDescription>
                              Enter your payment details for admin verification
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Amount (TZS) *</label>
                              <Input 
                                type="number"
                                placeholder="Enter amount"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Payment Method *</label>
                              <Select 
                                value={paymentForm.payment_method}
                                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                                  <SelectItem value="Mix by Yas">Mix by Yas</SelectItem>
                                  <SelectItem value="PBZ Bank">PBZ Bank</SelectItem>
                                  <SelectItem value="NMB Bank">NMB Bank</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Reference/Transaction Number</label>
                              <Input 
                                placeholder="Enter reference number"
                                value={paymentForm.reference_number}
                                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                              <Textarea 
                                placeholder="Add any additional details about your payment..."
                                value={paymentForm.proof_description}
                                onChange={(e) => setPaymentForm({ ...paymentForm, proof_description: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleSubmitPayment}
                              disabled={submittingPayment}
                            >
                              {submittingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Payment"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {payments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No payments submitted yet</p>
                              <p className="text-sm mt-2">Click "Submit Payment" to add your first payment</p>
                            </div>
                          ) : (
                            payments.map((payment) => (
                              <div key={payment.id} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Wallet className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold">TZS {payment.amount.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getPaymentStatusColor(payment.status)}`}>
                                          {getPaymentStatusIcon(payment.status)}
                                          {payment.status}
                                        </span>
                                      </div>
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
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "membership" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card className="border-secondary">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <CreditCard className="w-8 h-8 text-secondary" />
                              <div>
                                <h3 className="text-2xl font-heading font-bold">{membershipInfo.type}</h3>
                                <span className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                                  {membershipInfo.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground">Member ID: {membershipInfo.id}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="font-semibold">{membershipInfo.since}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Membership Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {[
                            "Access to exclusive member resources and training materials",
                            "Priority registration for workshops and events",
                            "Networking opportunities with fellow social workers",
                            "Professional development and mentorship programs",
                            "Discounts on certification courses and examinations"
                          ].map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "resources" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Member Resources</CardTitle>
                        <CardDescription>Download exclusive member materials</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {resources.map((resource) => (
                            <div key={resource.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-lg">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{resource.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {resource.type} • {resource.size} • {resource.category}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email Address</label>
                          <Input value={user?.email || ""} disabled className="bg-muted" />
                          <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Password & Security</CardTitle>
                        <CardDescription>Manage your password and security settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Reset Password</p>
                            <p className="text-sm text-muted-foreground">Send a password reset link to your email</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={handleResetPassword}
                            disabled={resettingPassword}
                          >
                            {resettingPassword ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <KeyRound className="w-4 h-4 mr-2" />
                            )}
                            Reset Password
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4" 
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                emailNotifications: e.target.checked
                              }))}
                            />
                            <span>Email notifications for new events</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4" 
                              checked={notificationSettings.monthlyNewsletter}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                monthlyNewsletter: e.target.checked
                              }))}
                            />
                            <span>Monthly newsletter</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4" 
                              checked={notificationSettings.smsNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                smsNotifications: e.target.checked
                              }))}
                            />
                            <span>SMS notifications</span>
                          </label>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                          <Button onClick={handleSaveSettings} disabled={savingSettings}>
                            {savingSettings ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive">Delete Account</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboard;
