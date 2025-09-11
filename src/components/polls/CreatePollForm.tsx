"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPoll } from "@/lib/actions/pollActions";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      className="w-full sm:w-auto"
      size="lg"
    >
      {pending ? "Creating..." : "Create Poll"}
    </Button>
  );
}

export function CreatePollForm() {
  const [state, formAction] = useActionState(createPoll, initialState);
  const [options, setOptions] = useState(["", ""]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create a New Poll</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your question and at least two options
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
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
            />
          </div>
          <div className="space-y-4">
            <Label className="text-base">Options</Label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <Input
                  key={index}
                  name="options"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="h-11"
                  required
                />
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
              <SubmitButton />
            </div>
          </div>
          {state?.message && (
            <p
              aria-live="polite"
              className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg"
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