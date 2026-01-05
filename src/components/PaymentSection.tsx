import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Smartphone, Building2, CreditCard, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const paymentMethods = [
  {
    name: "M-Pesa",
    icon: Smartphone,
    type: "Mobile Money",
    color: "bg-red-500",
    details: {
      number: "0XXX XXX XXX",
      name: "PPSWZ",
      instructions: "Lipa Namba / Pay Number",
    },
  },
  {
    name: "Mix by Yas",
    icon: Smartphone,
    type: "Mobile Payment",
    color: "bg-purple-500",
    details: {
      number: "0XXX XXX XXX",
      name: "PPSWZ",
      instructions: "Send to registered number",
    },
  },
  {
    name: "PBZ Bank",
    icon: Building2,
    type: "Bank Transfer",
    color: "bg-blue-600",
    details: {
      accountNumber: "XXXX-XXXX-XXXX",
      accountName: "Private Practice in Social Work Zanzibar",
      branch: "Stone Town Branch",
    },
  },
  {
    name: "CRDB Bank",
    icon: CreditCard,
    type: "Bank Transfer",
    color: "bg-green-600",
    details: {
      accountNumber: "0152898853100",
      accountName: "Private Practice in Social Work Zanzibar",
      branch: "Zanzibar Branch",
    },
  },
];

const PaymentSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <section id="payment" ref={ref} className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-secondary text-primary rounded-full">
            Payment Options
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            How to Pay
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your preferred payment method for membership fees, donations,
            or service payments.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${method.color} flex items-center justify-center`}
                >
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    {method.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{method.type}</p>
                </div>
              </div>

              <div className="space-y-3">
                {"number" in method.details && (
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {method.details.instructions}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {method.details.number}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          copyToClipboard(
                            method.details.number!,
                            `${method.name} number`
                          )
                        }
                      >
                        {copiedItem === `${method.name} number` ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Name: {method.details.name}
                    </p>
                  </div>
                )}

                {"accountNumber" in method.details && (
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Account Number
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {method.details.accountNumber}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          copyToClipboard(
                            method.details.accountNumber!,
                            `${method.name} account`
                          )
                        }
                      >
                        {copiedItem === `${method.name} account` ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.details.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {method.details.branch}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-card rounded-2xl p-6 shadow-soft border border-border text-center"
        >
          <p className="text-muted-foreground">
            After making your payment, please send proof of payment to{" "}
            <span className="text-primary font-medium">ppswz@gmail.com</span>{" "}
            or via WhatsApp for confirmation.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentSection;
