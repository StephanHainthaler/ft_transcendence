import { AppUser } from "@shared/user";
import { uniqueNamesGenerator, adjectives, colors, starWars } from "unique-names-generator";

export const aiUser = () => {
  return new AppUser({
    id: 0,
    name: uniqueNamesGenerator({ dictionaries: [adjectives, colors, starWars], style: 'capital', separator: ' ' }),
  }, null);
}
