import { forwardRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { Award, Badge, Check, Shield, Star } from "lucide-react";
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

interface CertificateTemplateProps {
  certificate: Certificate;
  userInfo: UserInfo;
  courseInfo: CourseInfo;
  finalScore?: number;
  completedModules?: number;
  totalModules?: number;
  className?: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, userInfo, courseInfo, finalScore, completedModules, totalModules, className = "" }, ref) => {
    const { t } = useTranslation();

    const formatDate = (date: Date | null) => {
      if (!date) return "Unknown Date";
      return format(new Date(date), "MMMM dd, yyyy");
    };

    const courseTitle = courseInfo.titleKey ? t(courseInfo.titleKey) : courseInfo.title;
    const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || userInfo.email;

    return (
      <div 
        ref={ref}
        className={`bg-white text-black p-12 max-w-4xl mx-auto relative overflow-hidden print:shadow-none print:max-w-none ${className}`}
        style={{ 
          minHeight: '11in',
          width: '8.5in',
          fontFamily: "'Times New Roman', serif"
        }}
        data-testid={`certificate-template-${certificate.id}`}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-amber-500">
          <div className="absolute inset-2 border-2 border-amber-400">
            <div className="absolute inset-2 border border-amber-300"></div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-4 border-amber-500 transform rotate-45 opacity-30"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-4 border-amber-500 transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-amber-500 transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-4 border-amber-500 transform rotate-45 opacity-30"></div>

        <div className="relative z-10 text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <Award className="w-20 h-20 text-amber-600" />
            </div>
            <h1 className="text-5xl font-bold text-amber-800 tracking-wide" data-testid="certificate-title">
              {t("certificates.certificateOfCompletion")}
            </h1>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-700" data-testid="institution-name">
              {t("certificates.promptMasterAcademy")}
            </h2>
            <p className="text-lg text-gray-600 italic">
              {t("certificates.officialCertificate")}
            </p>
          </div>

          {/* Certification Statement */}
          <div className="space-y-6 py-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              {t("certificates.certifies")}
            </p>
            
            <div className="py-4">
              <h3 className="text-4xl font-bold text-amber-800 mb-2" data-testid="recipient-name">
                {fullName}
              </h3>
              <div className="w-96 h-0.5 bg-gray-400 mx-auto mt-4"></div>
            </div>

            <p className="text-xl text-gray-700 leading-relaxed">
              {t("certificates.hasSuccessfully")}
            </p>

            <div className="py-4">
              <h4 className="text-3xl font-bold text-gray-800 mb-4" data-testid="course-name">
                {courseTitle}
              </h4>
              {courseInfo.description && (
                <p className="text-lg text-gray-600 italic max-w-2xl mx-auto">
                  {courseInfo.description}
                </p>
              )}
            </div>

            {/* Achievement Details */}
            <div className="flex justify-center space-x-8 py-4">
              {finalScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-700" data-testid="final-score">
                    {finalScore}%
                  </div>
                  <div className="text-sm text-gray-600">{t("certificates.finalScore")}</div>
                </div>
              )}
              {completedModules && totalModules && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-700" data-testid="modules-completed">
                    {completedModules}/{totalModules}
                  </div>
                  <div className="text-sm text-gray-600">{t("certificates.modules")}</div>
                </div>
              )}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm text-gray-600">{t("certificates.completed")}</div>
              </div>
            </div>

            <p className="text-lg text-gray-700">
              {t("certificates.onDate", { date: formatDate(certificate.issuedAt) })}
            </p>
          </div>

          {/* Signatures and Seal */}
          <div className="flex justify-between items-end pt-12">
            <div className="text-center">
              <div className="w-48 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600" data-testid="signature-line">
                {t("certificates.signature")}
              </p>
              <p className="text-xs text-gray-500 mt-1">PromptMaster Academy</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 border-4 border-amber-600 rounded-full flex items-center justify-center bg-amber-50">
                  <Badge className="w-12 h-12 text-amber-700" />
                </div>
              </div>
              <p className="text-sm text-gray-600">{t("certificates.seal")}</p>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="pt-8 border-t border-gray-200 text-xs text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span data-testid="certificate-id">
                {t("certificates.certificateId")}: {certificate.id}
              </span>
              <span data-testid="serial-number">
                {t("certificates.serialNumber")}: {certificate.serial}
              </span>
            </div>
            <div className="text-center">
              <span data-testid="verification-text">
                {t("certificates.verify")}: promptmaster.academy/verify/{certificate.serial}
              </span>
            </div>
            <div className="text-center">
              <span data-testid="issue-date">
                {t("certificates.issuedOn")} {formatDate(certificate.issuedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-amber-600 transform rotate-12" />
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:max-w-none {
              max-width: none !important;
            }
            @page {
              size: letter;
              margin: 0.5in;
            }
          }
        `}</style>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;