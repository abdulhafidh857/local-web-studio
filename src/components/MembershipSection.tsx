import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const membershipTypes = [
  {
    type: "Full Member",
    price: "50,000",
    registration: "20,000",
    description: "For registered and licensed Social Workers practicing privately in Zanzibar.",
    requirements: [
      "Diploma or Degree in Social Work",
      "Professional registration (if applicable)",
      "Active private practice",
    ],
    featured: true,
  },
  {
    type: "Associate Member",
    price: "40,000",
    registration: "15,000",
    description: "For professionals working in related fields (psychology, counselling, community development).",
    requirements: [
      "Relevant qualification",
      "Interest in private social work practice",
    ],
    featured: false,
  },
  {
    type: "Student Member",
    price: "10,000",
    registration: "5,000",
    description: "For students studying Social Work or related programs.",
    requirements: [
      "Currently enrolled in Social Work program",
      "Valid student ID",
    ],
    featured: false,
  },
  {
    type: "Institutional Member",
    price: "150,000",
    registration: "50,000",
    description: "Organizations offering social services, NGOs, or private institutions.",
    requirements: [
      "Registered organization",
      "Active in social service delivery",
    ],
    featured: false,
  },
];

const benefits = [
  "Professional networking & collaboration",
  "CPD trainings, workshops, and seminars",
  "Access to tools, templates & resources",
  "Recognition as a certified private practitioner",
  "Inclusion in the PPSWZ Directory",
  "Mentorship & supervision opportunities",
  "Discounts on events, courses & materials",
  "Eligibility for leadership roles and committees",
];

const MembershipSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="membership" ref={ref} className="section-padding bg-secondary">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Membership
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Join Our Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Become part of a strong network committed to ethics, professionalism,
            and innovation in private social work practice in Zanzibar.
          </p>
        </motion.div>

        {/* Membership Types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {membershipTypes.map((membership, index) => (
            <motion.div
              key={membership.type}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 shadow-soft border transition-all duration-300 hover:shadow-card ${
                membership.featured
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {membership.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </div>
              )}
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                {membership.type}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                  {membership.price}
                </span>
                <span className="text-sm text-muted-foreground"> TZS/year</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {membership.description}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Registration: {membership.registration} TZS
              </p>
              <ul className="space-y-2 mb-6">
                {membership.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={membership.featured ? "default" : "outline"}
                className="w-full"
                size="sm"
              >
                Apply Now
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card rounded-2xl p-8 shadow-card border border-border"
        >
          <h3 className="text-2xl font-heading font-bold text-foreground text-center mb-8">
            Membership Benefits
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MembershipSection;
