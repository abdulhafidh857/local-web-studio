import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  User, 
  Calendar, 
  RefreshCw, 
  Filter,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface UserActivityPanelProps {
  activities: ActivityLog[];
  profiles: Profile[];
  loading: boolean;
  onRefresh: () => void;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  user_registered: { label: "User Registered", color: "bg-green-100 text-green-700" },
  profile_update: { label: "Profile Updated", color: "bg-blue-100 text-blue-700" },
  login: { label: "Login", color: "bg-purple-100 text-purple-700" },
  logout: { label: "Logout", color: "bg-gray-100 text-gray-700" },
  membership_applied: { label: "Membership Applied", color: "bg-yellow-100 text-yellow-700" },
  contact_submitted: { label: "Contact Submitted", color: "bg-orange-100 text-orange-700" },
};

const UserActivityPanel = ({ activities, profiles, loading, onRefresh }: UserActivityPanelProps) => {
  const [filterAction, setFilterAction] = useState<string | null>(null);

  const getUserName = (userId: string | null) => {
    if (!userId) return "System";
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || "Unknown User";
  };

  const getActionInfo = (action: string) => {
    return actionLabels[action] || { label: action.replace(/_/g, " "), color: "bg-muted text-muted-foreground" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredActivities = filterAction 
    ? activities.filter(a => a.action === filterAction)
    : activities;

  const uniqueActions = [...new Set(activities.map(a => a.action))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            User Activity Log
          </h2>
          <p className="text-sm text-muted-foreground">{activities.length} total activities</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {filterAction ? getActionInfo(filterAction).label : "All Actions"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterAction(null)}>
                All Actions
              </DropdownMenuItem>
              {uniqueActions.map((action) => (
                <DropdownMenuItem key={action} onClick={() => setFilterAction(action)}>
                  {getActionInfo(action).label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity logs found</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const actionInfo = getActionInfo(activity.action);
                return (
                  <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium">{getUserName(activity.user_id)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserActivityPanel;
