import CustomDialog from "@/components/CustomDialog";
import CustomSelect from "@/components/CustomSelect";
import InputComponent from "@/components/form/InputComponent";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { ProjectType } from "@/types";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";


const taskStatus = [
  {label: "Full Day", key: "full_day"},
  {label: "Half Day", key: "half_day"},
  {label: "On Leave", key: "on_leave"},
  {label: "Holiday", key: "holiday"},
  {label: "Weekend", key: "weekend"},
]

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormType = {
  project: string;
  task_type: string;
  description: string;
  start_time: Date | null;
  end_time: Date | null;
  status: string,
};

function AddLogDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { taskTypes } = useGlobal();
  const [projects, setProjects] = useState<ProjectType | []>([]);
  const [formData, setFormData] = useState<FormType>({
    project: "",
    task_type: "",
    description: "",
    start_time: new Date(),
    end_time: null,
    status: 'full_day'
  });

  const reset = () => {
    setFormData({
      project: "",
      task_type: "",
      description: "",
      start_time: new Date(),
      end_time: null,
      status: 'full_day'
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
        toast.success('End Time Cannot Be A Future Time')
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
      onCancel={reset}
      title="Add Log"
    >
      <div className="w-full h-full p-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomSelect
          required
          options={projects}
          label="Select Project"
          value={formData.project}
          onValueChange={(value) => handleSelectChange(value, "project")}
          placeholder="Click to Select Project"
          className="w-full col-span-2"
        />
        <CustomSelect
          required
          options={taskTypes}
          value={formData.task_type}
          onValueChange={(value) => handleSelectChange(value, "task_type")}
          label="Select Task Type"
          placeholder="Click to Select Type"
          className="w-full"
        />
        <CustomSelect
          required
          options={taskStatus}
          labelKey="label"
          valueKey="key"
          value={formData.status}
          onValueChange={(value) => handleSelectChange(value, "status")}
          label="Select Task Status"
          placeholder="Click to Select Status"
          className="w-full"
        />
        <InputComponent
          required
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          name="description"
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
      </div>
    </CustomDialog>
  );
}

export default AddLogDialog;
