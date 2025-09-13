import { useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import CertificateTemplate from "./CertificateTemplate";
import { Download, PrinterIcon, Share2, X, ExternalLink, Copy, Shield, Star, Award } from "lucide-react";
import type { Certificate } from "@shared/schema";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface CourseInfo {
  title: string;
  titleKey?: string;
  description?: string;
}

interface CertificateDetailProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  userInfo?: UserInfo;
  courseInfo?: CourseInfo;
  finalScore?: number;
  completedModules?: number;
  totalModules?: number;
}

export default function CertificateDetail({
  certificate,
  isOpen,
  onClose,
  userInfo,
  courseInfo,
  finalScore,
  completedModules,
  totalModules
}: CertificateDetailProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch user info if not provided
  const { data: fetchedUser } = useQuery<UserInfo>({
    queryKey: ["/api/me"],
    enabled: !userInfo && !!certificate,
    retry: false
  });

  // Fetch course info if not provided
  const { data: fetchedCourse } = useQuery<CourseInfo>({
    queryKey: ["/api/courses", certificate?.courseId],
    enabled: !courseInfo && !!certificate,
    retry: false
  });

  if (!certificate) return null;

  const user = userInfo || fetchedUser;
  const course = courseInfo || fetchedCourse;

  if (!user || !course) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]" data-testid="certificate-detail-loading">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">{t("certificates.loadingCertificate")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const certificateElement = certificateRef.current;
      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      // Dynamically import the libraries
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: certificateElement.scrollWidth,
        height: certificateElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Create PDF with standard letter size (8.5" x 11")
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: 'letter'
      });

      // Calculate dimensions to fit the certificate nicely
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scaling to fit within PDF dimensions with margins
      const margin = 0.5; // 0.5 inch margins
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const scaleX = availableWidth / (canvasWidth / 96); // Convert pixels to inches (96 DPI)
      const scaleY = availableHeight / (canvasHeight / 96);
      const scale = Math.min(scaleX, scaleY);
      
      const finalWidth = (canvasWidth / 96) * scale;
      const finalHeight = (canvasHeight / 96) * scale;
      
      // Center the certificate on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      // Add the certificate image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

      // Generate filename
      const courseTitle = course.titleKey ? t(course.titleKey) : course.title;
      const fileName = `Certificate-${courseTitle.replace(/[^a-z0-9]/gi, '-')}-${certificate.serial}.pdf`;

      // Download the PDF
      pdf.save(fileName);

      toast({
        title: t("certificates.downloadCertificate"),
        description: "Certificate PDF downloaded successfully"
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: t("certificates.certificateError"),
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Certificate - ${course.title}</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  @page { size: letter; margin: 0.5in; }
                }
              </style>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleShare = () => {
    // Use the public certificate endpoint for sharing
    const shareUrl = `${window.location.origin}/api/public/certificates/${certificate.id}`;
    const courseTitle = course.titleKey ? t(course.titleKey) : course.title;
    const shareText = `I just completed ${courseTitle} and earned my certificate!`;
    
    if (navigator.share) {
      navigator.share({
        title: t("certificates.certificateOfCompletion"),
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: t("certificates.shareCertificate"),
          description: "Certificate URL copied to clipboard"
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: t("certificates.shareCertificate"),
        description: "Certificate URL copied to clipboard"
      });
    }
  };

  const handleCopyUrl = () => {
    // Use the verification endpoint for certificate verification
    const verificationUrl = `${window.location.origin}/api/verify/certificate/${certificate.serial}`;
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: t("common.copy"),
      description: "Verification URL copied to clipboard"
    });
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/verify/certificate/${certificate.serial}`);
      const data = await response.json();
      
      if (data.valid) {
        toast({
          title: "Certificate Verified",
          description: `This certificate is valid and was issued on ${new Date(data.certificate.issuedAt).toLocaleDateString()}`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Certificate could not be verified",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: "Unable to verify certificate. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0" data-testid={`certificate-detail-${certificate.id}`}>
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl text-amber-800 dark:text-amber-200">
                {t("certificates.certificateDetails")}
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  {t("certificates.certificateOfCompletion")}
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                  {t("certificates.validCertificate")}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-certificate-detail">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="download-certificate"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? t("common.loading") : t("certificates.downloadCertificate")}
              </Button>
              <Button 
                onClick={handlePrint}
                variant="outline"
                data-testid="print-certificate"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                {t("certificates.printCertificate")}
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline"
                data-testid="share-certificate"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t("certificates.shareCertificate")}
              </Button>
              <Button 
                onClick={handleVerify}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                data-testid="verify-certificate"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("certificates.verificationId")}: {certificate.serial.slice(-8)}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyUrl}
                data-testid="copy-verification"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Certificate Display */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <CertificateTemplate
              ref={certificateRef}
              certificate={certificate}
              userInfo={user}
              courseInfo={course}
              finalScore={finalScore}
              completedModules={completedModules}
              totalModules={totalModules}
            />
          </div>
        </div>

        {/* Certificate Info */}
        <div className="px-6 py-4 bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">{t("certificates.courseTitle")}:</span>
              <p className="text-foreground">{course.title}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("certificates.completedOn")}:</span>
              <p className="text-foreground">{certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : "Unknown Date"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("certificates.serialNumber")}:</span>
              <p className="text-foreground font-mono">{certificate.serial}</p>
            </div>
          </div>
          
          {(finalScore || (completedModules && totalModules)) && (
            <div className="flex items-center gap-6 pt-2 border-t border-border">
              {finalScore && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">{t("certificates.finalScore")}:</span>
                  <span className="ml-2 text-foreground font-semibold">{finalScore}%</span>
                </div>
              )}
              {completedModules && totalModules && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">{t("certificates.modulesCompleted")}:</span>
                  <span className="ml-2 text-foreground font-semibold">{completedModules}/{totalModules}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}