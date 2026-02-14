"use client";
import { Clock, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InputComponent from "../form/InputComponent";
import { DropdownComponent } from "../form/DropdownComponent";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

function QuickAddCard() {
  const [formData, setFormData] = useState({
    projectName: "",
    taskType: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimer = () => {
    if (isTracking) return;

    const now = new Date().toISOString();
    setFormData((prevData) => ({
      ...prevData,
      startTime: now,
    }));
    setIsTracking(true);
    setElapsedTime(0);
  };

  const handleStopTimer = () => {
    if (!isTracking) return;

    setIsTracking(false);
    const now = new Date().toISOString();
    setFormData((prevData) => ({
      ...prevData,
      endTime: now,
    }));

    toast.info("Task recorded! You worked for " + formatTime(elapsedTime));

    setElapsedTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  return (
    <div className="w-full h-full flex flex-col items-start gap-2">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        Quick Add Task
      </h2>
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 w-full">
          <DropdownComponent label="Project Name" options={frameworks} />
          <InputComponent
            className="w-full"
            inputClassName="bg-background"
            name="taskType"
            label="Type"
            onChange={handleInputChange}
            value={formData.taskType}
          />
        </div>
        <InputComponent
          name="description"
          type="textarea"
          className="w-full"
          inputClassName="bg-background"
          label="Description"
          onChange={handleInputChange}
          value={formData.description}
        />
        <div className="w-full flex items-center gap-2 py-4">
          <Button
            onClick={isTracking ? handleStopTimer : handleStartTimer}
            variant={isTracking ? "destructive" : "default"}
            className="w-1/2"
          >
            {isTracking ? (
              <Square className="fill-current" />
            ) : (
              <Play className="fill-current" />
            )}
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
          <div className="w-1/2 flex items-center justify-center">
            <p className="text-3xl">{formatTime(elapsedTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickAddCard;
