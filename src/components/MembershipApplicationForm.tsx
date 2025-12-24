import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const membershipSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20).optional().or(z.literal("")),
  profession: z.string().trim().min(2, "Please enter your profession").max(100),
  organization: z.string().trim().max(200).optional().or(z.literal("")),
  experience_years: z.number().min(0).max(50).optional(),
  motivation: z.string().trim().min(20, "Please tell us more about your motivation (at least 20 characters)").max(1000),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

interface MembershipApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipType: string;
}

const MembershipApplicationForm = ({
  open,
  onOpenChange,
  membershipType,
}: MembershipApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      profession: "",
      organization: "",
      experience_years: undefined,
      motivation: "",
    },
  });

  const onSubmit = async (data: MembershipFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("membership_applications").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        profession: data.profession,
        organization: data.organization || null,
        experience_years: data.experience_years || null,
        motivation: data.motivation,
        user_id: user?.id || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We will review your application and get back to you soon.",
      });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            Apply for {membershipType}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to apply for membership. We'll review your
            application and contact you within 5-7 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="Enter your full name"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+255 XXX XXX XXX"
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profession *</Label>
            <Input
              id="profession"
              placeholder="e.g., Social Worker, Counselor"
              {...register("profession")}
              className={errors.profession ? "border-destructive" : ""}
            />
            {errors.profession && (
              <p className="text-sm text-destructive">{errors.profession.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization/Institution</Label>
            <Input
              id="organization"
              placeholder="Where do you currently work?"
              {...register("organization")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Select
              onValueChange={(value) =>
                setValue("experience_years", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select years of experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Less than 1 year</SelectItem>
                <SelectItem value="1">1-2 years</SelectItem>
                <SelectItem value="3">3-5 years</SelectItem>
                <SelectItem value="6">6-10 years</SelectItem>
                <SelectItem value="11">More than 10 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to join PPSWZ? *</Label>
            <Textarea
              id="motivation"
              placeholder="Tell us about your motivation for joining and how you hope to contribute..."
              rows={4}
              {...register("motivation")}
              className={errors.motivation ? "border-destructive" : ""}
            />
            {errors.motivation && (
              <p className="text-sm text-destructive">{errors.motivation.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipApplicationForm;
