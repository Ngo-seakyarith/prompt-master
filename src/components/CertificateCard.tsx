"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Award, Calendar, Download, Eye, MoreVertical, Printer, Share2, Shield } from "lucide-react";

interface Certificate {
  id: string;
  courseId: string;
  serial: string;
  issuedAt: Date | null;
}

interface CourseInfo {
  title: string;
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
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown Date";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const courseTitle = courseInfo.title;
  
  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 ${
        compact ? 'h-auto' : 'h-full flex flex-col'
      }`}
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
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 mb-2">
                Certificate of Completion
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 transition-opacity duration-200"
                style={{ opacity: isHovered ? 1 : 0 }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View Certificate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
          {courseTitle}
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Issued to <span className="font-medium">You</span>
        </CardDescription>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : "flex-1"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Issued: {formatDate(certificate.issuedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-mono text-xs">{certificate.serial.slice(-8)}</span>
            </div>
          </div>

          {!compact && (
            <div className="p-4 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                This certifies that <span className="font-medium">You</span> have successfully completed <span className="font-medium">{courseTitle}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <span>Serial: {certificate.serial}</span>
            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
              Verified
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
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button 
              onClick={onDownload}
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
