"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createPoll(prevState: { message: string }, formData: FormData) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to create a poll." };
  }

  const question = formData.get("question" as string);
  const options = formData.getAll("options");

  if (!question || options.length < 2) {
    return { message: "Please provide a question and at least two options." };
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert([{ question, created_by: user.id }])
    .select()
    .single();

  if (pollError) {
    return { message: "Failed to create poll." };
  }

  const optionData = options.map((optionText) => ({
    text: optionText as string,
    poll_id: poll.id,
  }));

  const { error: optionsError } = await supabase.from("poll_options").insert(optionData);

  if (optionsError) {
    await supabase.from("polls").delete().eq("id", poll.id);
    return { message: "Failed to create options." };
  }

  revalidatePath("/");
  redirect(`/polls`);
}

export async function editPoll(prevState: { message: string }, formData: FormData) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to edit a poll." };
  }

  const pollId = formData.get("id") as string;
  const question = formData.get("question") as string;
  const options = formData.getAll("options");

  if (!pollId || !question || options.length < 2) {
    return { message: "Invalid form data for poll update." };
  }

  // Update the poll question
  const { error: pollError } = await supabase
    .from("polls")
    .update({ question })
    .eq("id", pollId)
    .eq("created_by", user.id);

  if (pollError) {
    return { message: "Failed to update poll." };
  }

  // Delete existing options for the poll
  const { error: deleteError } = await supabase
    .from("poll_options")
    .delete()
    .eq("poll_id", pollId);

  if (deleteError) {
    return { message: "Failed to update poll options." };
  }

  // Insert the new options
  const optionData = options.map((optionText) => ({
    text: optionText as string,
    poll_id: pollId,
  }));

  const { error: optionsError } = await supabase.from("poll_options").insert(optionData);

  if (optionsError) {
    return { message: "Failed to update poll options." };
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/");
  return { message: "Poll updated successfully!" };
}

export async function votePoll(prevState: { message: string }, formData: FormData) {
  // Get the cookies instance for this request
  const cookiesStore = await cookies();
  const supabase = createServerComponentClient({ cookies });

  const pollId = formData.get("poll_id") as string;
  const pollOptionId = formData.get("poll_option_id") as string;

  if (!pollId || !pollOptionId) {
    return { message: "Invalid poll or option." };
  }

  // Check if a vote cookie already exists for this poll
  const hasVotedCookie = cookiesStore.get(`voted-poll-${pollId}`);
  if (hasVotedCookie) {
    return { message: "You have already voted in this poll." };
  }

  // Insert the vote into the database
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      poll_option_id: pollOptionId,
    },
  ]);

  if (error) {
    console.error("Supabase vote error:", error);
    return { message: "Failed to submit vote. Please try again." };
  }

  // Set a cookie to prevent future votes from this browser
  cookiesStore.set(`voted-poll-${pollId}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/", // Available on all pages
  });

  revalidatePath(`/polls/${pollId}`); // Revalidate to show updated results
  return { message: "Vote submitted successfully!" };
}