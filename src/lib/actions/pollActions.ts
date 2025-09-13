"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

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

export async function votePoll(
  prevState: { message: string; poll?: unknown },
  formData: FormData
) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies });

  const pollId = formData.get("poll_id") as string;
  const pollOptionId = formData.get("poll_option_id") as string;

  if (!pollId || !pollOptionId) {
    return { message: "Invalid poll or option." };
  }

  // Detect logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userId: string | null = null;
  let voterId: string | null = null;

  if (user) {
    userId = user.id;
  } else {
    // Anonymous voter, use voter_id cookie
    const existingVoterId = cookieStore.get("voter_id")?.value;
    if (existingVoterId) {
      voterId = existingVoterId;
    } else {
      // Create new voter_id and set it
      voterId = randomUUID();
      cookieStore.set("voter_id", voterId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }
  }

  // Insert vote
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      poll_option_id: pollOptionId,
      user_id: userId,
      voter_id: voterId,
    },
  ]);

  if (error) {
    if (error.code === "23505") {
      // Already voted (DB constraint violation)
      return { message: "You have already voted in this poll." };
    }
    console.error("Supabase vote error:", error);
    return { message: "Failed to submit vote. Please try again." };
  }

  // Fetch updated poll results with aggregated votes
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select(
      `
      id,
      question,
      options:poll_options(
        id,
        text,
        votes:votes(count)
      )
    `
    )
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { message: "Vote submitted, but failed to fetch updated results." };
  }

  // Reshape the votes into a simpler count
  const pollWithCounts = {
    ...poll,
    options: poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes?.[0]?.count || 0,
    })),
  };

  // Ensure ISR/SSR pages update too
  revalidatePath(`/polls/${pollId}`);

  return { message: "Vote submitted successfully!", poll: pollWithCounts };
}
