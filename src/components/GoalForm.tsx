"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Target, TrendingUp, Award, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  targetDate: z.date().refine((date) => date > new Date(), {
    message: "Target date must be in the future",
  }),
  courseId: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  initialData?: GoalFormData;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function GoalForm({ initialData, onSubmit, onCancel, isLoading, error }: GoalFormProps) {
  const [selectedType, setSelectedType] = useState<string>("module_count");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "module_count" as const,
      targetValue: 1,
      targetDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      courseId: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "module_count",
        targetValue: initialData.targetValue || 1,
        targetDate: initialData.targetDate ? new Date(initialData.targetDate) : new Date(),
        courseId: initialData.courseId || undefined,
      });
      setSelectedType(initialData.type || "module_count");
    }
  }, [initialData, form]);

  const handleSubmit = (data: GoalFormData) => {
    try {
      setSubmitError(null);
      
      const goalMetadata = {
        type: data.type,
        title: data.title,
        description: data.description,
      };

      const submitData = {
        courseId: data.courseId || null,
        targetDate: data.targetDate.toISOString(),
        targetModulesPerWeek: data.targetValue,
        notes: JSON.stringify(goalMetadata),
      };

      onSubmit(submitData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
    }
  };

  const goalTypes = [
    {
      value: "module_count",
      label: "Complete Modules",
      description: "Set a goal for number of modules to complete",
      icon: <Target className="w-5 h-5 text-purple-500" />,
      targetLabel: "modules",
    },
    {
      value: "course_completion",
      label: "Complete Course",
      description: "Set a goal to complete a specific course",
      icon: <Award className="w-5 h-5 text-green-500" />,
      targetLabel: "course",
      requiresCourse: true,
    },
    {
      value: "progress_percentage",
      label: "Progress Percentage",
      description: "Reach a certain percentage of course completion",
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      targetLabel: "percentage",
      requiresCourse: true,
    },
    {
      value: "streak",
      label: "Learning Streak",
      description: "Maintain a learning streak for consecutive days",
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      targetLabel: "days",
    },
  ];

  const selectedGoalType = goalTypes.find(type => type.value === selectedType);

  if (coursesLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        {/* Goal Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Type</FormLabel>
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
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Complete 5 modules this month" {...field} />
              </FormControl>
              <FormDescription>A clear and motivating title for your goal</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course Selection */}
        {selectedGoalType?.requiresCourse && (
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Course</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course: { id: string; titleKey: string }) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.titleKey}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Target Value ({selectedGoalType?.targetLabel})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
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
              <FormLabel>Target Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about your goal..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
