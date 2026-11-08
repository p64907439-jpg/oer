import { redirect } from "next/navigation";

/**
 * No index page — classrooms are reached from the home page's
 * "My classrooms" section or the inbox. Keep the route alive so
 * /classrooms/[id] never falls through the auth proxy oddly.
 */
export default function ClassroomsIndex() {
  redirect("/");
}
