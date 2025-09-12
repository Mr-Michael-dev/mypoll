"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { editPoll, createPoll } from "@/lib/actions/pollActions";
import { X } from "lucide-react"; // Import the delete icon

const initialState = {
  message: "",
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending || disabled}
      className="w-full sm:w-auto"
      size="lg"
      disabled={disabled}
    >
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

interface EditPollFormProps {
  initialQuestion?: string;
  initialOptions?: string[];
  pollId?: string;
}

export function EditPollForm({
  initialQuestion = "",
  initialOptions = ["", ""],
  pollId,
}: EditPollFormProps) {
  const [options, setOptions] = useState(initialOptions);
  const action = pollId ? editPoll : createPoll;
  const [state, formAction] = useActionState(action, initialState);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    // Ensure at least two options remain
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const formDisabled = initialQuestion.trim() === "" || options.some(opt => opt.trim() === "");

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{pollId ? "Edit Poll" : "Create a New Poll"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your question and at least two options
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {pollId && <input type="hidden" name="id" value={pollId} />}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-base">
              Poll Question
            </Label>
            <Input
              id="question"
              name="question"
              placeholder="What's your favorite color?"
              className="h-12 text-base"
              required
              defaultValue={initialQuestion}
            />
          </div>
          <div className="space-y-4">
            <Label className="text-base">Options</Label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    name="options"
                    placeholder={`Option ${index + 1}`}
                    defaultValue={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="h-11 flex-1"
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOption(index)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Add Option
            </Button>
            <div className="order-1 sm:order-2 sm:ml-auto">
              <SubmitButton disabled={formDisabled} />
            </div>
          </div>
          {state?.message && (
            <p
              aria-live="polite"
              className={`mt-4 p-4 text-sm rounded-lg ${
                state.message.includes("success")
                  ? "text-green-500 bg-green-50"
                  : "text-red-500 bg-red-50"
              }`}
              role="status"
            >
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
