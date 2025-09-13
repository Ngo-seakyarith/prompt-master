import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Target, TrendingUp, Award, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { safeParseNotes, safeFormatDate, safeGetNumber } from "@/lib/goalUtils";
import { useToast } from "@/hooks/use-toast";
import type { Goal, Course } from "@shared/schema";

const goalFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  type: z.enum(["course_completion", "module_count", "streak", "progress_percentage"]),
  targetValue: z.number()
    .min(1, "Target value must be at least 1")
    .max(1000, "Target value must be less than 1000"),
  targetDate: z.date({
    required_error: "Target date is required",
  }).refine((date) => date > new Date(), {
    message: "Target date must be in the future",
  }),
  courseId: z.string().optional(),
}).refine((data) => {
  // Course is required for course-specific goal types
  if ((data.type === "course_completion" || data.type === "progress_percentage") && !data.courseId) {
    return false;
  }
  return true;
}, {
  message: "Course selection is required for this goal type",
  path: ["courseId"],
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  initialData?: Goal;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function GoalForm({ initialData, onSubmit, onCancel, isLoading, error }: GoalFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("module_count");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch courses for course-related goals with error handling
  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, error: coursesErrorData } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    retry: 1,
    onError: (error: any) => {
      console.error('Failed to fetch courses:', error);
      toast({
        title: "Error loading courses",
        description: "Failed to load available courses. Please try again.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "module_count",
      targetValue: 1,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      courseId: undefined,
    },
  });

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData) {
      const goalMetadata = safeParseNotes(initialData.notes);
      const goalType = goalMetadata.type || "module_count";
      
      form.reset({
        title: goalMetadata.title || "",
        description: goalMetadata.description || "",
        type: goalType as any,
        targetValue: safeGetNumber(initialData.targetModulesPerWeek, 1),
        targetDate: safeFormatDate(initialData.targetDate),
        courseId: initialData.courseId || undefined,
      });
      setSelectedType(goalType);
    }
  }, [initialData, form]);

  const handleSubmit = (data: GoalFormData) => {
    try {
      // Clear any previous submit errors
      setSubmitError(null);
      
      // Validate form data
      const result = goalFormSchema.safeParse(data);
      if (!result.success) {
        const firstError = result.error.errors[0];
        setSubmitError(firstError.message);
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      const goalMetadata = {
        type: data.type,
        title: data.title,
        description: data.description,
        courseName: data.courseId ? courses.find(c => c.id === data.courseId)?.titleKey : undefined,
      };

      const submitData = {
        courseId: data.courseId || null,
        targetDate: data.targetDate.toISOString(),
        targetModulesPerWeek: data.targetValue,
        notes: JSON.stringify(goalMetadata),
      };

      onSubmit(submitData);
    } catch (error) {
      console.error('Goal form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const goalTypes = [
    {
      value: "module_count",
      label: t("goals.types.module_count"),
      description: t("goals.typeDescriptions.module_count"),
      icon: <Target className="w-5 h-5 text-purple-500" />,
      targetLabel: t("goals.targetLabels.modules"),
    },
    {
      value: "course_completion",
      label: t("goals.types.course_completion"),
      description: t("goals.typeDescriptions.course_completion"),
      icon: <Award className="w-5 h-5 text-green-500" />,
      targetLabel: t("goals.targetLabels.course"),
      requiresCourse: true,
    },
    {
      value: "progress_percentage",
      label: t("goals.types.progress_percentage"),
      description: t("goals.typeDescriptions.progress_percentage"),
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      targetLabel: t("goals.targetLabels.percentage"),
      requiresCourse: true,
    },
    {
      value: "streak",
      label: t("goals.types.streak"),
      description: t("goals.typeDescriptions.streak"),
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      targetLabel: t("goals.targetLabels.days"),
    },
  ];

  const selectedGoalType = goalTypes.find(type => type.value === selectedType);

  // Show courses loading state
  if (coursesLoading) {
    return (
      <div className="space-y-6" data-testid="goal-form-loading">
        <div className="text-center py-8">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" data-testid="goal-form">
        {/* Error Display */}
        {(error || submitError || coursesError) && (
          <Alert variant="destructive" data-testid="goal-form-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || submitError || "Failed to load form data. Please try again."}
            </AlertDescription>
          </Alert>
        )}
        {/* Goal Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("goals.goalType")}</FormLabel>
              <div className="grid grid-cols-1 gap-3">
                {goalTypes.map((type) => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      field.value === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      field.onChange(type.value);
                      setSelectedType(type.value);
                    }}
                    data-testid={`goal-type-${type.value}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {type.icon}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{type.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Goal Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("goals.goalTitle")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("goals.goalTitlePlaceholder")} 
                  {...field} 
                  data-testid="input-goal-title"
                />
              </FormControl>
              <FormDescription>
                {t("goals.goalTitleDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course Selection (for course-related goals) */}
        {selectedGoalType?.requiresCourse && (
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("goals.selectCourse")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder={t("goals.selectCoursePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {coursesError ? "Failed to load courses" : "No courses available"}
                      </div>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.titleKey}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("goals.selectCourseDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Target Value */}
        <FormField
          control={form.control}
          name="targetValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("goals.targetValue")} ({selectedGoalType?.targetLabel})
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 1) {
                      field.onChange(1);
                    } else if (value > 1000) {
                      field.onChange(1000);
                    } else {
                      field.onChange(value);
                    }
                  }}
                  data-testid="input-target-value"
                />
              </FormControl>
              <FormDescription>
                {selectedType === "progress_percentage" 
                  ? t("goals.targetValueDescriptions.percentage")
                  : selectedType === "streak"
                  ? t("goals.targetValueDescriptions.streak")
                  : selectedType === "course_completion"
                  ? t("goals.targetValueDescriptions.courseCompletion")
                  : t("goals.targetValueDescriptions.moduleCount")
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Date */}
        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("goals.targetDate")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      data-testid="input-target-date"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{t("goals.pickDate")}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t("goals.targetDateDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("goals.description")} ({t("common.optional")})</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("goals.descriptionPlaceholder")}
                  {...field}
                  data-testid="input-goal-description"
                />
              </FormControl>
              <FormDescription>
                {t("goals.descriptionDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel"
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? t("common.saving") : 
             initialData ? t("goals.updateGoal") : t("goals.createGoal")}
          </Button>
        </div>
      </form>
    </Form>
  );
}