import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Export test results in various formats
export async function POST(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;
    const { format = "json" } = await request.json();

    const test = await prisma.playgroundTest.findUnique({
      where: {
        id: testId,
        userId: session.user.id,
      },
      include: {
        prompt: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "json":
        exportData = JSON.stringify(test, null, 2);
        contentType = "application/json";
        filename = `test-${testId}.json`;
        break;

      case "csv": {
        // Convert results to CSV
        type TestResult = {
          model: string;
          response?: string;
          duration?: number;
          tokens?: number;
          cost?: string;
          rating?: number;
        };
        const results = test.results as TestResult[];
        const csvHeader = "Model,Response,Duration,Tokens,Cost,Rating\n";
        const csvRows = results
          .map((r) => 
            `"${r.model}","${r.response?.replace(/"/g, '""')}",${r.duration},${r.tokens},${r.cost},"${r.rating || 'N/A'}"`
          )
          .join("\n");
        exportData = csvHeader + csvRows;
        contentType = "text/csv";
        filename = `test-${testId}.csv`;
        break;
      }

      case "txt": {
        // Convert to readable text
        type TestResult = {
          model: string;
          response?: string;
          duration?: number;
          tokens?: number;
          cost?: string;
          rating?: number;
        };
        const results2 = test.results as TestResult[];
        exportData = `Playground Test Results\n`;
        exportData += `Test ID: ${test.id}\n`;
        exportData += `Prompt: ${test.prompt?.title || "Untitled"}\n`;
        exportData += `Date: ${test.createdAt}\n`;
        exportData += `\n${"=".repeat(80)}\n\n`;
        
        results2.forEach((r, i: number) => {
          exportData += `Model ${i + 1}: ${r.model}\n`;
          exportData += `Response: ${r.response}\n`;
          exportData += `Duration: ${r.duration}ms\n`;
          exportData += `Tokens: ${r.tokens}\n`;
          exportData += `Cost: $${r.cost}\n`;
          if (r.rating) exportData += `Rating: ${r.rating}/5\n`;
          exportData += `\n${"-".repeat(80)}\n\n`;
        });
        contentType = "text/plain";
        filename = `test-${testId}.txt`;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting test:", error);
    return NextResponse.json(
      { error: "Failed to export test" },
      { status: 500 }
    );
  }
}
