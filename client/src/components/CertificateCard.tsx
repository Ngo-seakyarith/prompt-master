import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Award, Calendar, Download, Eye, MoreVertical, PrinterIcon, Share2, Shield, Star, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import type { Certificate } from "@shared/schema";

interface CourseInfo {
  title: string;
  titleKey?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  courseInfo: CourseInfo;
  onView?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  compact?: boolean;
}

export default function CertificateCard({ 
  certificate, 
  courseInfo, 
  onView, 
  onDownload, 
  onPrint, 
  onShare,
  compact = false 
}: CertificateCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown Date";
    return format(new Date(date), "MMM dd, yyyy");
  };

  const courseTitle = courseInfo.titleKey ? t(courseInfo.titleKey) : courseInfo.title;
  
  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 ${
        compact ? 'h-auto' : 'h-full flex flex-col'
      }`}
      data-testid={`certificate-card-${certificate.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <Badge 
                className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 mb-2" 
                data-testid={`badge-certificate-${certificate.id}`}
              >
                {t("certificates.certificateOfCompletion")}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ opacity: isHovered ? 1 : 0 }}
                data-testid={`menu-certificate-${certificate.id}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView} data-testid={`action-view-${certificate.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                {t("certificates.viewCertificate")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload} data-testid={`action-download-${certificate.id}`}>
                <Download className="w-4 h-4 mr-2" />
                {t("certificates.downloadCertificate")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPrint} data-testid={`action-print-${certificate.id}`}>
                <PrinterIcon className="w-4 h-4 mr-2" />
                {t("certificates.printCertificate")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare} data-testid={`action-share-${certificate.id}`}>
                <Share2 className="w-4 h-4 mr-2" />
                {t("certificates.shareCertificate")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="text-xl text-amber-800 dark:text-amber-200" data-testid={`title-${certificate.id}`}>
          {courseTitle}
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300" data-testid={`description-${certificate.id}`}>
          {t("certificates.issuedTo")} <span className="font-medium">You</span>
        </CardDescription>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : "flex-1"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2" data-testid={`issued-date-${certificate.id}`}>
              <Calendar className="w-4 h-4" />
              <span>{t("certificates.issuedOn")}: {formatDate(certificate.issuedAt)}</span>
            </div>
            <div className="flex items-center gap-2" data-testid={`verification-${certificate.id}`}>
              <Shield className="w-4 h-4" />
              <span className="font-mono text-xs">{certificate.serial.slice(-8)}</span>
            </div>
          </div>

          {!compact && (
            <div className="p-4 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                {t("certificates.certifies")} <span className="font-medium">You</span> {t("certificates.hasSuccessfully")} <span className="font-medium">{courseTitle}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <span>{t("certificates.serialNumber")}: {certificate.serial}</span>
            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
              {t("certificates.validCertificate")}
            </Badge>
          </div>
        </div>
      </CardContent>

      {!compact && (
        <div className="p-6 pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={onView}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              data-testid={`button-view-${certificate.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("common.view")}
            </Button>
            <Button 
              onClick={onDownload}
              variant="outline" 
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
              data-testid={`button-download-${certificate.id}`}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onPrint}
              variant="outline" 
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
              data-testid={`button-print-${certificate.id}`}
            >
              <PrinterIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Certificate aesthetic decoration */}
      <div className="absolute top-4 right-4 opacity-20">
        <div className="w-8 h-8 border-2 border-amber-400 rounded-full flex items-center justify-center">
          <Award className="w-4 h-4 text-amber-600" />
        </div>
      </div>
    </Card>
  );
}