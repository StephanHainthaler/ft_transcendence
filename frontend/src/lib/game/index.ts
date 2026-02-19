import { AppUser } from "@lib/api/appUser";

export const aiUser = new AppUser({
  id: 0, //0 to indicate AI user
  name: "AI Opponent",
}, null);
