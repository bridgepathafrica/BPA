import { useState, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateJob, CreateJobBodyType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import { Link } from "wouter";
import { getApiErrorMessage } from "@/lib/api-error";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

const INDUSTRIES = [
  "Technology",
  "Banking & Finance",
  "FinTech",
  "Healthcare",
  "Engineering",
  "Telecommunications",
  "E-Commerce",
  "Manufacturing",
  "Advertising",
  "NGO / Development",
  "Education",
  "Consulting",
  "Energy & Utilities",
  "Real Estate",
  "Media & Entertainment",
  "Other",
];

const LOCATIONS = [
  "Remote",
  "Ghana",
  "Nigeria",
  "South Africa",
  "Egypt",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Senegal",
  "Rwanda",
  "Morocco",
  "Multiple",
];

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "EGP", label: "EGP — Egyptian Pound" },
];

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description is required"),
  requirements: z.string().min(10, "Requirements are required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["full_time", "part_time", "contract", "internship", "remote"] as const),
  industry: z.string().min(1, "Industry is required"),
  currency: z.string().default("USD"),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PostJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const createJobMutation = useCreateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema as never),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "Remote",
      type: "full_time",
      industry: "",
      currency: "USD",
      salaryMin: undefined,
      salaryMax: undefined,
    }
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = (data: JobFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      location: data.location,
      country: data.location === "Remote" ? "Remote" : data.location,
      type: data.type as CreateJobBodyType,
      currency: data.currency,
      industry: data.industry,
      skills,
      isActive: true,
      ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
      ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
    };

    createJobMutation.mutate(
      { data: payload },
      {
        onSuccess: (job: any) => {
          toast({
            title: "Job Posted Successfully",
            description: "Your job listing is now live and visible to candidates.",
          });
          setLocation(`/jobs/${job.id}`);
        },
        onError: (err: unknown) => {
          toast({
            variant: "destructive",
            title: "Failed to post job",
            description: getApiErrorMessage(err as Error, "There was an error creating the job listing."),
          });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/employer"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: INK }}>Post a New Job</h1>
          <p className="text-muted-foreground mt-1">Fill out the details to reach the best African talent.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Basic Info ── */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Compensation ── */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="salaryMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (annual)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 50000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="salaryMax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary (annual)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 80000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <p className="text-xs text-muted-foreground">Leave blank to show "Competitive Salary". Transparent salary attracts more applicants.</p>
            </CardContent>
          </Card>

          {/* ── Role Details ── */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[160px] resize-y"
                      placeholder="Describe the role, responsibilities, team, and impact..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="requirements" render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements <span style={{ color: TERRACOTTA }}>*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] resize-y"
                      placeholder="List qualifications, years of experience, certifications..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1.5">One requirement per line works best.</p>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Skills ── */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter or comma"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={addSkill} disabled={!skillInput.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border"
                      style={{ backgroundColor: TERRACOTTA + "10", color: TERRACOTTA, borderColor: TERRACOTTA + "30" }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:opacity-70 transition-opacity leading-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No skills added yet. Add skills like "React", "Python", "Project Management".</p>
              )}
            </CardContent>
          </Card>

          {/* ── Footer actions ── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/employer">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
              className="px-8"
              style={{ backgroundColor: TERRACOTTA }}
            >
              {createJobMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
              ) : "Post Job →"}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
