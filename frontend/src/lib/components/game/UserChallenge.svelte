<script lang="ts">
  import Grid from "../custom/Grid.svelte";
  import GridCard from "../custom/GridCard.svelte";
  import { t } from "@lib/i18n/i18n";
  import { type AppUser } from "@shared/user";
  import * as Tabs from "$lib/components/ui/tabs";
  import { client } from "@lib/api/index.svelte";

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

<Tabs.Root value='users' class="size-full">
  <Grid title={$t('game.challenge')}>
    {#snippet head()}
      <Tabs.List>
        <Tabs.Trigger value="users">Users</Tabs.Trigger>
        <Tabs.Trigger value="friends">Friends</Tabs.Trigger>
      </Tabs.List>
    {/snippet}
    <Tabs.Content value="users" class="size-full flex flex-col gap-2">
        {#each users as user}
          <GridCard
            title={user.name}
            avatarUrl={user.avatarUrl}
            buttonDesc={$t('game.challenge')}
            callback={() => userSelectionCallback(user)}
          />
        {/each}
    </Tabs.Content>
    <Tabs.Content value="friends" class="size-full flex flex-col gap-2">
        {#each friends as friend}
          <GridCard
            isOnline={!!client.onlineFriends.find(f => f === friend.id)}
            title={friend.name}
            avatarUrl={friend.avatarUrl}
            buttonDesc={$t('game.challenge')}
            callback={() => userSelectionCallback(friend)}
          />
        {/each}
    </Tabs.Content>
  </Grid>
</Tabs.Root>
