import type { AppUser } from '@shared/user';
import { client } from "@lib/api/index.svelte";

let usernames = $state<Record<number, string>>({});

function usersFindUsername(userId: number): string {
if (userId === 0) {
    return 'AI Opponent';
}
return usernames[userId] ?? 'Unknown_Pilot';
}

async function loadUsers(user_names: Record<number, string> = {})
{
let users: AppUser[] = [];
users = await client.getUsers();
if (!users || !Array.isArray(users))
{
    console.error('Failed to load users or data is not an array');
    return user_names;
}
console.log("Loaded users:", users);
users.forEach(user => {
    user_names[user.id] = user.displayName || user.name || 'Unknown_Pilot';
});
}

export { loadUsers, usersFindUsername };
