import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import CertificateCard from "@/components/CertificateCard";
import CertificateDetail from "@/components/CertificateDetail";
import UnauthorizedState from "@/components/UnauthorizedState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Award, Search, Filter, SortAsc, Download, Eye, PrinterIcon, Shield, Star, CheckCircle } from "lucide-react";
import { COURSES } from "@/lib/constants";
import type { Certificate, UserProgress } from "@shared/schema";

interface CourseInfo {
  title: string;
  titleKey?: string;
  description?: string;
}

export default function Certificates() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterByCourse, setFilterByCourse] = useState("all");
  const [filterByStatus, setFilterByStatus] = useState("all");

  // Fetch user certificates
  const { data: certificates = [], isLoading: certificatesLoading, isError: certificatesError } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
    enabled: isAuthenticated,
    retry: false
  });

  // Fetch user progress for additional context
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    retry: false
  });

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="loading-auth">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            {t("common.loading")}
          </div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UnauthorizedState />
        </div>
      </div>
    );
  }

  // Loading state
  if (certificatesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="loading-certificates">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            {t("certificates.loadingCertificate")}
          </div>
        </div>
      </div>
    );
  }

  // Get course info helper
  const getCourseInfo = (courseId: string): CourseInfo => {
    // Map storage course IDs to display names
    const courseMapping: Record<string, CourseInfo> = {
      "prompt-engineering-mastery": {
        title: "Prompt Engineering Mastery",
        titleKey: "courses.promptEngineeringMastery.title",
        description: "Master the fundamentals of prompt engineering with hands-on practice and real-world applications."
      },
      "advanced-ai-communication": {
        title: "Advanced AI Communication", 
        titleKey: "courses.advancedAiCommunication.title",
        description: "Learn sophisticated techniques for communicating with AI systems, including multi-step reasoning and context management."
      },
      "ai-automation-workflows": {
        title: "AI Automation & Workflows",
        titleKey: "courses.aiAutomationWorkflows.title", 
        description: "Build automated workflows and systems using AI, from simple tasks to complex business processes."
      }
    };

    return courseMapping[courseId] || {
      title: courseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      titleKey: courseId,
      description: "Course description not available"
    };
  };

  // Calculate completion metrics
  const getCompletionMetrics = (courseId: string) => {
    // Map course IDs to their module counts based on actual storage data
    const courseModuleCounts: Record<string, number> = {
      "prompt-engineering-mastery": 5,
      "advanced-ai-communication": 3, 
      "ai-automation-workflows": 4
    };
    
    const totalModules = courseModuleCounts[courseId] || 5;
    
    // Calculate completed modules for this course from userProgress
    const courseProgress = userProgress.filter(p => {
      // Find modules that belong to this course (would need module-to-course mapping in real app)
      return p.isCompleted;
    });
    
    const completedModules = Math.min(courseProgress.length, totalModules);
    const finalScore = completedModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    return { completedModules, totalModules, finalScore };
  };

  // Filter and sort certificates
  const filteredCertificates = certificates.filter(certificate => {
    // Search filter
    if (searchTerm) {
      const courseInfo = getCourseInfo(certificate.courseId);
      const courseTitle = courseInfo.titleKey ? t(courseInfo.titleKey) : courseInfo.title;
      if (!courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Course filter
    if (filterByCourse !== "all" && certificate.courseId !== filterByCourse) {
      return false;
    }

    // Status filter (all certificates are completed by definition)
    if (filterByStatus !== "all" && filterByStatus !== "completed") {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        const dateA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
        const dateB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
        return dateA - dateB;
      case "courseAZ":
        const titleA = getCourseInfo(a.courseId).title;
        const titleB = getCourseInfo(b.courseId).title;
        return titleA.localeCompare(titleB);
      case "courseZA":
        const titleA2 = getCourseInfo(a.courseId).title;
        const titleB2 = getCourseInfo(b.courseId).title;
        return titleB2.localeCompare(titleA2);
      case "newest":
      default:
        const dateA3 = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
        const dateB3 = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
        return dateB3 - dateA3;
    }
  });

  // Certificate actions
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    // Open the certificate detail modal in download mode
    setSelectedCertificate(certificate);
    // Wait a bit for the modal to open, then trigger download
    setTimeout(() => {
      const downloadButton = document.querySelector('[data-testid="download-certificate"]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.click();
      }
    }, 500);
  };

  const handlePrintCertificate = async (certificate: Certificate) => {
    // Open the certificate detail modal in print mode
    setSelectedCertificate(certificate);
    // Wait a bit for the modal to open, then trigger print
    setTimeout(() => {
      const printButton = document.querySelector('[data-testid="print-certificate"]') as HTMLButtonElement;
      if (printButton) {
        printButton.click();
      }
    }, 500);
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    // Open the certificate detail modal in share mode
    setSelectedCertificate(certificate);
    // Wait a bit for the modal to open, then trigger share
    setTimeout(() => {
      const shareButton = document.querySelector('[data-testid="share-certificate"]') as HTMLButtonElement;
      if (shareButton) {
        shareButton.click();
      }
    }, 500);
  };

  // Get unique courses from certificates
  const certificateCourses = Array.from(new Set(certificates.map(cert => cert.courseId)));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12" data-testid="certificates-header">
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-amber-800 dark:text-amber-200" data-testid="page-title">
            {t("certificates.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-subtitle">
            {t("certificates.noCertificatesDesc")}
          </p>
        </div>

        {certificates.length > 0 && (
          <>
            {/* Filters and Search */}
            <Card className="mb-8" data-testid="certificates-filters">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {t("certificates.filterBy")}
                </CardTitle>
                <CardDescription>
                  {t("certificates.allCertificates")} - {filteredCertificates.length} {t("certificates.earned")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="search-certificates"
                    />
                  </div>

                  {/* Course Filter */}
                  <Select value={filterByCourse} onValueChange={setFilterByCourse}>
                    <SelectTrigger data-testid="filter-course">
                      <SelectValue placeholder={t("certificates.allCourses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("certificates.allCourses")}</SelectItem>
                      {certificateCourses.map(courseId => {
                        const courseInfo = getCourseInfo(courseId);
                        const title = courseInfo.titleKey ? t(courseInfo.titleKey) : courseInfo.title;
                        return (
                          <SelectItem key={courseId} value={courseId}>{title}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                    <SelectTrigger data-testid="filter-status">
                      <SelectValue placeholder={t("certificates.allStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("certificates.allStatus")}</SelectItem>
                      <SelectItem value="completed">{t("certificates.completed")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="sort-certificates">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder={t("certificates.sortBy")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t("certificates.newest")}</SelectItem>
                      <SelectItem value="oldest">{t("certificates.oldest")}</SelectItem>
                      <SelectItem value="courseAZ">{t("certificates.courseAZ")}</SelectItem>
                      <SelectItem value="courseZA">{t("certificates.courseZA")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="certificates-grid">
                {filteredCertificates.map((certificate) => {
                  const courseInfo = getCourseInfo(certificate.courseId);
                  const metrics = getCompletionMetrics(certificate.courseId);
                  
                  return (
                    <CertificateCard
                      key={certificate.id}
                      certificate={certificate}
                      courseInfo={courseInfo}
                      onView={() => handleViewCertificate(certificate)}
                      onDownload={() => handleDownloadCertificate(certificate)}
                      onPrint={() => handlePrintCertificate(certificate)}
                      onShare={() => handleShareCertificate(certificate)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-results">
                <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t("certificates.noCertificates")}</h3>
                <p className="text-muted-foreground mb-4">
                  No certificates match your current filters.
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setFilterByCourse("all");
                  setFilterByStatus("all");
                  setSortBy("newest");
                }} data-testid="clear-filters">
                  {t("common.clear")} Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {certificates.length === 0 && !certificatesError && (
          <div className="text-center py-16" data-testid="empty-certificates">
            <div className="max-w-md mx-auto">
              <Award className="w-24 h-24 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold mb-4">{t("certificates.noCertificates")}</h3>
              <p className="text-muted-foreground mb-8">
                {t("certificates.noCertificatesDesc")}
              </p>
              <Button asChild data-testid="browse-courses">
                <a href="/courses">
                  {t("dashboard.allCourses")}
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {certificatesError && (
          <div className="text-center py-16" data-testid="error-certificates">
            <div className="max-w-md mx-auto">
              <Award className="w-24 h-24 text-destructive mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold mb-4">{t("certificates.certificateError")}</h3>
              <p className="text-muted-foreground mb-8">
                {t("certificates.assessmentFailedDesc")}
              </p>
              <Button onClick={() => window.location.reload()} data-testid="retry-load">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {certificates.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="certificate-stats">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">{certificates.length}</div>
                <div className="text-sm text-muted-foreground">{t("certificates.earnedCertificates")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">{certificateCourses.length}</div>
                <div className="text-sm text-muted-foreground">Completed Courses</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {certificates.length > 0 ? new Date().getFullYear() - new Date(Math.min(...certificates.filter(c => c.issuedAt).map(c => new Date(c.issuedAt!).getTime()))).getFullYear() + 1 : 1}
                </div>
                <div className="text-sm text-muted-foreground">Learning Years</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Certificate Detail Modal */}
      <CertificateDetail
        certificate={selectedCertificate}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        courseInfo={selectedCertificate ? getCourseInfo(selectedCertificate.courseId) : undefined}
        {...(selectedCertificate ? getCompletionMetrics(selectedCertificate.courseId) : {})}
      />
    </div>
  );
}