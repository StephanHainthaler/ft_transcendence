<script lang="ts">
  import Grid from "../custom/Grid.svelte";
  import GridCard from "../custom/GridCard.svelte";
  import { t } from "@lib/i18n/i18n";
  import { type AppUser } from "@lib/api/appUser";
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
  <Tabs.List>
    <Tabs.Trigger value="users">Users</Tabs.Trigger>
    <Tabs.Trigger value="friends">Friends</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="users" class="size-full">
    <Grid title={$t('game.challenge')}>
      {#each users as user}
        <GridCard
          title={user.name}
          avatarUrl={user.avatarUrl}
          buttonDesc={$t('game.challenge')}
          callback={() => userSelectionCallback(user)}
        />
      {/each}
    </Grid>
  </Tabs.Content>
  <Tabs.Content value="friends" class="size-full">
    <Grid title={$t('game.challenge')}>
      {#each friends as friend}
        <GridCard
          isOnline={!!client.onlineFriends.find(f => f === friend.id)}
          title={friend.name}
          avatarUrl={friend.avatarUrl}
          buttonDesc={$t('game.challenge')}
          callback={() => userSelectionCallback(friend)}
        />
      {/each}
    </Grid>
  </Tabs.Content>
</Tabs.Root>
