"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createPoll(prevState: { message: string }, formData: FormData) {

  const supabase = createServerComponentClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "You must be logged in to create a poll.",
    };
  }

  const question = formData.get("question" as string);
  const options = formData.getAll("options");

  if (!question || options.length < 2) {
    return {
      message: "Please provide a question and at least two options.",
    };
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert([{ question, created_by: user.id }])
    .select()
    .single();

  if (pollError) {
    return {
      message: "Failed to create poll.",
    };
  }

  const optionData = options.map((optionText) => ({
    text: optionText as string,
    poll_id: poll.id,
  }));

  const { error: optionsError } = await supabase.from("poll_options").insert(optionData);

  if (optionsError) {
    return {
      message: "Failed to create options.",
    };
  }

  revalidatePath("/");
  redirect(`/polls/${poll.id}`);
}
