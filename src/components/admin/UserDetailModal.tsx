import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar,
  Shield,
  Activity,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ActivityLog {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
}

interface UserDetailModalProps {
  user: Profile | null;
  userRole: string;
  activities: ActivityLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}

const UserDetailModal = ({ 
  user, 
  userRole, 
  activities, 
  open, 
  onOpenChange,
  onRoleChange 
}: UserDetailModalProps) => {
  const [changingRole, setChangingRole] = useState(false);

  if (!user) return null;

  const handleRoleChange = async (newRole: "admin" | "user") => {
    if (newRole === userRole) return;
    
    setChangingRole(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", user.id);

      if (error) throw error;
      
      onRoleChange(user.id, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setChangingRole(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <div>
              <span className="block">{user.full_name || "Unnamed User"}</span>
              <span className="text-sm font-normal text-muted-foreground">{user.email}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Member since {formatDate(user.created_at)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="role">Role & Access</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4 overflow-y-auto max-h-[400px]">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={User} label="Full Name" value={user.full_name} />
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Phone" value={user.phone} />
              <InfoItem icon={MapPin} label="Location" value={user.location} />
              <InfoItem icon={Briefcase} label="Profession" value={user.profession} />
              <InfoItem icon={Building2} label="Organization" value={user.organization} />
            </div>
            {user.bio && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="role" className="mt-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Current Role</p>
                  <p className="text-sm text-muted-foreground">
                    {userRole === "admin" ? "Administrator with full access" : "Standard member access"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={userRole === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("user")}
                  disabled={changingRole || userRole === "user"}
                >
                  {changingRole && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  User
                </Button>
                <Button
                  variant={userRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("admin")}
                  disabled={changingRole || userRole === "admin"}
                >
                  {changingRole && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Admin
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4 overflow-y-auto max-h-[400px]">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity recorded for this user</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action.replace(/_/g, " ")}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatShortDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) => (
  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "Not set"}</p>
    </div>
  </div>
);

export default UserDetailModal;
