import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CreditCard, Download, ExternalLink } from "lucide-react";

interface BillingHistoryProps {
  className?: string;
}

// Mock billing data for placeholder display
const mockInvoices = [
  {
    id: "inv_001",
    date: "2024-12-15",
    amount: "$15.00",
    status: "paid",
    plan: "Gold Plan",
    period: "Dec 2024"
  },
  {
    id: "inv_002", 
    date: "2024-11-15",
    amount: "$15.00",
    status: "paid",
    plan: "Gold Plan",
    period: "Nov 2024"
  },
  {
    id: "inv_003",
    date: "2024-10-15", 
    amount: "$10.00",
    status: "paid",
    plan: "Pro Plan",
    period: "Oct 2024"
  },
];

const statusColors = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
};

export default function BillingHistory({ className = "" }: BillingHistoryProps) {
  return (
    <div className={className} data-testid="billing-history">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="billing-header-title">
            <FileText className="w-5 h-5 text-primary" />
            Billing History
          </CardTitle>
          <CardDescription data-testid="billing-header-description">
            View and download your invoices and payment history
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Coming Soon Notice */}
          <div className="bg-muted/30 rounded-lg p-6 mb-6 text-center" data-testid="billing-coming-soon">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Full Billing Management Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete billing history, invoice downloads, and payment management features will be available in an upcoming release.
            </p>
            <Button variant="outline" size="sm" disabled data-testid="notify-me-button">
              <ExternalLink className="w-4 h-4 mr-2" />
              Notify Me When Available
            </Button>
          </div>

          {/* Mock Invoice List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-4">Recent Activity (Preview)</h4>
            
            {mockInvoices.map((invoice, index) => (
              <div 
                key={invoice.id}
                className={`p-4 border rounded-lg transition-colors ${
                  index === 0 ? "bg-muted/20" : "opacity-60"
                }`}
                data-testid={`mock-invoice-${invoice.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm" data-testid="invoice-plan">
                        {invoice.plan}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {invoice.period} • {invoice.date}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold" data-testid="invoice-amount">
                        {invoice.amount}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={statusColors[invoice.status as keyof typeof statusColors]}
                        data-testid="invoice-status"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={index !== 0}
                      data-testid={`download-invoice-${invoice.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {index !== 0 && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Historical data preview - Full history coming soon
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Placeholder Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-muted/10 border-dashed" data-testid="feature-invoices">
              <CardContent className="p-0 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Invoice Downloads</h4>
                <p className="text-xs text-muted-foreground">PDF receipts for expenses</p>
              </CardContent>
            </Card>
            
            <Card className="p-4 bg-muted/10 border-dashed" data-testid="feature-methods">
              <CardContent className="p-0 text-center">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Payment Methods</h4>
                <p className="text-xs text-muted-foreground">Manage cards & billing</p>
              </CardContent>
            </Card>
            
            <Card className="p-4 bg-muted/10 border-dashed" data-testid="feature-history">
              <CardContent className="p-0 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Full History</h4>
                <p className="text-xs text-muted-foreground">Complete billing records</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800" data-testid="billing-support">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Need billing assistance?</h4>
                <p className="text-xs text-muted-foreground">
                  Contact our support team for any billing questions or issues.
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="contact-support">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}