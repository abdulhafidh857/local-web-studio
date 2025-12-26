import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Profile {
  id: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
}

interface MembershipApplication {
  id: string;
  status: string | null;
  created_at: string;
}

interface AnalyticsOverviewProps {
  profiles: Profile[];
  activities: ActivityLog[];
  applications: MembershipApplication[];
  adminCount: number;
}

const AnalyticsOverview = ({ profiles, activities, applications, adminCount }: AnalyticsOverviewProps) => {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersThisWeek = profiles.filter(p => new Date(p.created_at) >= lastWeek).length;
  const newUsersThisMonth = profiles.filter(p => new Date(p.created_at) >= lastMonth).length;
  const activitiesToday = activities.filter(a => {
    const actDate = new Date(a.created_at);
    return actDate.toDateString() === today.toDateString();
  }).length;
  const pendingApplications = applications.filter(a => a.status === "pending").length;

  const stats = [
    { 
      label: "Total Members", 
      value: profiles.length, 
      change: `+${newUsersThisMonth} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      label: "New This Week", 
      value: newUsersThisWeek, 
      change: "New registrations",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      label: "Today's Activity", 
      value: activitiesToday, 
      change: "Actions logged",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      label: "Pending Apps", 
      value: pendingApplications, 
      change: "Awaiting review",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
  ];

  const activityByAction = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topActions = Object.entries(activityByAction)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity Breakdown
            </CardTitle>
            <CardDescription>Most common user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topActions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activity data yet</p>
              ) : (
                topActions.map(([action, count], index) => {
                  const percentage = (count / activities.length) * 100;
                  return (
                    <div key={action} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{action.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              User Distribution
            </CardTitle>
            <CardDescription>Breakdown by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    A
                  </div>
                  <div>
                    <p className="font-medium">Administrators</p>
                    <p className="text-sm text-muted-foreground">Full system access</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{adminCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                    U
                  </div>
                  <div>
                    <p className="font-medium">Regular Users</p>
                    <p className="text-sm text-muted-foreground">Standard member access</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{profiles.length - adminCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AnalyticsOverview;
