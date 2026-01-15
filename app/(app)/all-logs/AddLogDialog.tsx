import CustomDialog from "@/components/CustomDialog";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import InputComponent from "@/components/form/InputComponent";
import SelectComponent from "@/components/form/SelectComponent";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { ProjectType } from "@/types";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComplete?: () => void;
};

type FormType = {
  project: string;
  task_type: string;
  title: string;
  start_time: Date | null;
  end_time: Date | null;
  is_overtime: boolean;
};

function AddLogDialog({ open, onOpenChange, onAddComplete }: Props) {
  const { user } = useAuth();
  const { taskTypes, globalLoading, setGlobalLoading } = useGlobal();
  const [projects, setProjects] = useState<ProjectType | []>([]);
  const [formData, setFormData] = useState<FormType>({
    project: "",
    task_type: "",
    title: "",
    start_time: new Date(),
    end_time: null,
    is_overtime: false,
  });

  console.log('formData', formData)

  const handleAddLog = async () => {
    // basic validation
    if (
      !formData.project ||
      !formData.task_type ||
      !formData.title ||
      !formData.start_time 
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setGlobalLoading(true);

    try {
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: formData.project,
          task_type: formData.task_type,
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_overtime: formData.is_overtime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add task");
      }

      toast.success("Log added successfully");
      reset();
      onAddComplete?.(); 
    } catch (error) {
      console.error("Internal Server Error", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add task"
      );
    } finally {
      setGlobalLoading(false);
    }
  };


  const reset = () => {
    setFormData({
      project: "",
      task_type: "",
      title: "",
      start_time: new Date(),
      end_time: null,
      is_overtime: false,
    });
    onOpenChange(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // For end_time, prevent setting a time greater than current time
    if (name === "end_time" && type === "time" && value) {
      const selectedTime = new Date(`1970-01-01T${value}:00`);
      const currentTime = new Date();
      const currentTimeString = currentTime.toTimeString().slice(0, 5);

      if (value > currentTimeString) {
        toast.success("End Time Cannot Be A Future Time");
        // Don't update if the selected time is in the future
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "time" && value ? new Date(`1970-01-01T${value}:00`) : value,
    }));
  };

  const handleSelectChange = (value: string, key: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        `/api/projects?company_id=${user?.current_company}`
      );

      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error Fetching Posts", error);
      toast.error(`Something Went Wrong: ${error.error || error}`);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleAddLog}
      isPending={globalLoading}
      onCancel={reset}
      title="Add Log"
    >
      <div className="w-full h-full p-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DropdownComponent
          required
          options={projects}
          label="Select Project"
          labelKey={"name"}
          valueKey={"id"}
          value={formData.project}
          onValueChange={(value) => handleSelectChange(value, "project")}
          placeholder="Click to Select Project"
          className="w-full"
        />
        <DropdownComponent
          required
          options={taskTypes}
          labelKey={"name"}
          valueKey={"id"}
          value={formData.task_type}
          onValueChange={(value) => handleSelectChange(value, "task_type")}
          label="Select Task Type"
          placeholder="Click to Select Type"
          className="w-full"
        />

        <InputComponent
          required
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          name="title"
          className="col-span-2"
        />
        <InputComponent
          required
          type="time"
          label="Start Time"
          value={
            formData.start_time
              ? formData.start_time.toTimeString().slice(0, 5)
              : ""
          }
          onChange={handleInputChange}
          name="start_time"
        />
        <InputComponent
          required
          type="time"
          label="End Time"
          value={
            formData.end_time
              ? formData.end_time.toTimeString().slice(0, 5)
              : ""
          }
          onChange={handleInputChange}
          name="end_time"
        />
        <SelectComponent
        id="is_overtime"
          label="Is Overtime?"
          className="col-span-2"
          checked={formData.is_overtime}
          onCheckedChange={(value) =>
            setFormData((prev) => ({ ...prev, is_overtime: value }))
          }
        />
      </div>
    </CustomDialog>
  );
}

export default AddLogDialog;
