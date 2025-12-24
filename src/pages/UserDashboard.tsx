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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    profession: "",
    organization: "",
    bio: ""
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
    { id: "membership", label: "Membership", icon: CreditCard },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
                        <CardTitle>Notification Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span>Email notifications for new events</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span>Monthly newsletter</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4" />
                            <span>SMS notifications</span>
                          </label>
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
