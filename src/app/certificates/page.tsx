"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import CertificateCard from "@/components/CertificateCard";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Award, Download } from "lucide-react";

export default function CertificatesPage() {
  const router = useRouter();

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["/api/certificates"],
    queryFn: async () => {
      const res = await fetch("/api/certificates");
      if (!res.ok) throw new Error("Failed to fetch certificates");
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const getCourseInfo = (courseId: string) => {
    const course = courses.find((c: any) => c.id === courseId);
    return {
      title: course?.titleKey || "Course",
    };
  };

  const handleView = (certificateId: string) => {
    router.push(`/certificates/${certificateId}`);
  };

  const handleDownload = (certificate: any) => {
    // Generate PDF download
    console.log("Downloading certificate", certificate.id);
  };

  const handlePrint = (certificate: any) => {
    window.print();
  };

  const handleShare = (certificate: any) => {
    if (navigator.share) {
      navigator.share({
        title: "My Certificate",
        text: `I earned a certificate for completing ${getCourseInfo(certificate.courseId).title}!`,
        url: window.location.origin + `/certificates/${certificate.id}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Award className="w-10 h-10" />
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-2">
            View and download your course completion certificates
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No certificates yet</CardTitle>
                <CardDescription className="mb-6">
                  Complete courses to earn certificates
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate: any) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                courseInfo={getCourseInfo(certificate.courseId)}
                onView={() => handleView(certificate.id)}
                onDownload={() => handleDownload(certificate)}
                onPrint={() => handlePrint(certificate)}
                onShare={() => handleShare(certificate)}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        {certificates.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Download className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Download Your Certificates</h3>
                  <p className="text-sm text-muted-foreground">
                    You can download your certificates as PDF files or share them on social media. 
                    Each certificate includes a unique verification code that can be used to verify its authenticity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
