<script lang="ts">
  import Grid from "../custom/Grid.svelte";
  import GridCard from "../custom/GridCard.svelte";
  import { t } from "@lib/i18n/i18n";
  import { type AppUser } from "@shared/user";
  import * as Tabs from "$lib/components/ui/tabs";
  import { client } from "@lib/api/index.svelte";
  import NeonHeader from "../custom/NeonHeader.svelte";
  import { Users, UserRoundX } from "lucide-svelte";

  const {
    users,
    friends,
    userSelectionCallback,
  }: {
    users: AppUser[],
    friends: AppUser[],
    userSelectionCallback: (u: AppUser) => void,
  } = $props();
</script>

<Tabs.Root value="users" class="size-full overflow-y-auto">
  <Grid 
    class="overflow-y-auto"
    title="">
    {#snippet head()}
      <div class="flex items-start justify-between w-full -mt-2 mb-2 overflow-y-auto">
        <div class="flex-shrink-0">
          <NeonHeader
            text={$t('game.challenge', 'Challenge')}
            size="x1"
            level="h1"
          />
        </div>
        <Tabs.List>
          <Tabs.Trigger value="users">{$t('game.users', 'Users')}</Tabs.Trigger>
          <Tabs.Trigger value="friends">{$t('game.friends', 'Friends')}</Tabs.Trigger>
        </Tabs.List>
      </div>
    {/snippet}

    <Tabs.Content value="users" class="size-full flex flex-col gap-2">
      {#each users as user}
        <GridCard
          title={user.name}
          avatarUrl={user.avatarUrl}
          buttonDesc={$t('game.challenge', 'Challenge')}
          callback={() => userSelectionCallback(user)}
        />
      {:else}
        <div class="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed rounded-lg gap-2">
          <Users size={24} strokeWidth={1.5} />
          <p class="text-sm">{$t('game.no_users', 'No users available')}</p>
        </div>
      {/each}
    </Tabs.Content>

    <Tabs.Content value="friends" class="size-full flex flex-col gap-2">
      {#each friends as friend}
        <GridCard
          isOnline={!!client.onlineFriends.find((f) => f === friend.id)}
          title={friend.name}
          avatarUrl={friend.avatarUrl}
          buttonDesc={$t('game.to_challenge', 'Challenge')}
          callback={() => userSelectionCallback(friend)}
        />
      {:else}
        <div class="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed rounded-lg gap-2">
          <UserRoundX size={24} strokeWidth={1.5} />
          <p class="text-sm">{$t('game.no_friends', 'Your friends list is empty')}</p>
        </div>
      {/each}
    </Tabs.Content>
  </Grid>
</Tabs.Root>