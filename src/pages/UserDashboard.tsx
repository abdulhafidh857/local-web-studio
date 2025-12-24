import { useState } from "react";
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
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const membershipInfo = {
    type: "Professional Member",
    status: "Active",
    since: "January 2023",
    renewal: "January 2025",
    id: "PPSWZ-2023-0156"
  };

  const activityHistory = [
    { id: 1, event: "Annual General Meeting", date: "2024-01-20", type: "Meeting", status: "Upcoming" },
    { id: 2, event: "Social Work Ethics Workshop", date: "2024-01-10", type: "Workshop", status: "Completed" },
    { id: 3, event: "Community Outreach Program", date: "2023-12-15", type: "Outreach", status: "Completed" },
    { id: 4, event: "Professional Development Seminar", date: "2023-11-28", type: "Seminar", status: "Completed" },
  ];

  const resources = [
    { id: 1, name: "Social Work Code of Ethics", type: "PDF", size: "2.4 MB", category: "Guidelines" },
    { id: 2, name: "Membership Benefits Guide", type: "PDF", size: "1.8 MB", category: "Information" },
    { id: 3, name: "Annual Report 2023", type: "PDF", size: "5.2 MB", category: "Reports" },
    { id: 4, name: "Training Resources Pack", type: "ZIP", size: "15.6 MB", category: "Training" },
  ];

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "membership", label: "Membership", icon: CreditCard },
    { id: "activity", label: "Activity History", icon: History },
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
              <h1 className="text-xl font-heading font-semibold capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Member"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
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
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-4xl font-bold mb-4">
                          FA
                        </div>
                        <Button variant="outline" size="sm">Change Photo</Button>
                      </div>
                      
                      <div className="flex-1 grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-muted-foreground">Full Name</label>
                          <p className="font-medium">Fatma Ali Hassan</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Email</label>
                          <p className="font-medium">fatma.hassan@email.com</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Phone</label>
                          <p className="font-medium">+255 777 123 456</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Location</label>
                          <p className="font-medium">Stone Town, Zanzibar</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Profession</label>
                          <p className="font-medium">Licensed Social Worker</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Organization</label>
                          <p className="font-medium">Zanzibar Social Services</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Professional Credentials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                        <Award className="w-4 h-4 text-secondary" />
                        <span className="text-sm">BSW Certified</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Licensed Practitioner</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                        <Award className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Child Welfare Specialist</span>
                      </div>
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
                        <p className="text-sm text-muted-foreground mt-2">Renewal Date</p>
                        <p className="font-semibold">{membershipInfo.renewal}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-semibold">12</p>
                      <p className="text-sm text-muted-foreground">Events Attended</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="font-semibold">3</p>
                      <p className="text-sm text-muted-foreground">Certifications</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="font-semibold">24</p>
                      <p className="text-sm text-muted-foreground">CPD Hours</p>
                    </CardContent>
                  </Card>
                </div>

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

            {activeTab === "activity" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>Your past and upcoming events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityHistory.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              activity.status === 'Upcoming' ? 'bg-accent/20' : 'bg-secondary/20'
                            }`}>
                              <Calendar className={`w-5 h-5 ${
                                activity.status === 'Upcoming' ? 'text-accent' : 'text-secondary'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{activity.event}</p>
                              <p className="text-sm text-muted-foreground">{activity.type} • {activity.date}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            activity.status === 'Upcoming' 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-secondary/20 text-secondary'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      ))}
                    </div>
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
                className="space-y-6 max-w-2xl"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      <Input defaultValue="fatma.hassan@email.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number</label>
                      <Input defaultValue="+255 777 123 456" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["Email notifications for events", "SMS reminders", "Newsletter subscription"].map((pref, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{pref}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">Change Password</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboard;
