<script lang="ts">
  import Grid from "../custom/Grid.svelte";
  import GridCard from "../custom/GridCard.svelte";
  import { t } from "@lib/i18n/i18n";
  import { type AppUser } from "@shared/user";
  import * as Tabs from "$lib/components/ui/tabs";
  import { client } from "@lib/api/index.svelte";
  import NeonHeader from "../custom/NeonHeader.svelte";
  import { Users, UserRoundX } from "lucide-svelte";

  let { users, friends, userSelectionCallback }: 
    { users: AppUser[];
      friends: AppUser[];
      userSelectionCallback: (u: AppUser) => void;
    } = $props();

  let activeTab = $state<"users" | "friends">("users");

  const tabs = [
    { value: "users", label: $t('game.users', 'Users') },
    { value: "friends", label: $t('game.friends', 'Friends') },
  ] as const;

  function selectTab(value: "users" | "friends") {
    activeTab = value;
  }
</script>

<Tabs.Root bind:value={activeTab} class="size-full">
  <Grid title="">
    {#snippet head()}
      <div class="flex flex-wrap items-start justify-between gap-4 w-full -mt-2 mb-2">
        <div class="flex-shrink-0 overflow-visible">
          <NeonHeader
            text={$t('game.to_challenge', 'Challenge')}
            size="x1"
            level="h1"
          />
        </div>

        <!-- Desktop tabs -->
        <Tabs.List class="hidden sm:flex space-x-0 mb-2">
          {#each tabs as tab}
            <Tabs.Trigger
              value={tab.value}
              class="px-4 py-2 rounded-md font-semibold cursor-pointer
                data-[state=active]:bg-cyan-400 data-[state=active]:text-black
                text-gray-400"
            >
              {tab.label}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>

        <!-- Mobile dots -->
        <div class="flex sm:hidden justify-center space-x-2 mb-2 border border-gray-600 rounded-full px-3 py-1">
          {#each tabs as tab}
            <button
              aria-label={String(tab.label)}
              class="w-3 h-3 rounded-full
                {activeTab === tab.value ? 'bg-cyan-400' : 'bg-gray-600'}"
              onclick={() => selectTab(tab.value)}
            ></button>
          {/each}
        </div>
      </div>
    {/snippet}

    <Tabs.Content value="users" class="size-full flex flex-col gap-2">
      {#each users as user (user.id)}
        <GridCard
          title={user.name}
          avatarUrl={user.avatarUrl}
          buttonDesc={String($t('game.to_challenge', 'Challenge'))}
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
      {#each friends as friend (friend.id)}
        <GridCard
          isOnline={!!client.onlineFriends.find((f) => f === friend.id)}
          title={friend.name}
          avatarUrl={friend.avatarUrl}
          buttonDesc={String($t('game.to_challenge', 'Challenge'))}
          callback={() => userSelectionCallback(friend)}
        />
      {:else}
        <div class="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed rounded-lg gap-2">
          <UserRoundX size={24} strokeWidth={1.5} />
          <p class="text-sm justify-center overflow-hidden">{$t('game.no_friends', 'Your friends list is empty')}</p>
        </div>
      {/each}
    </Tabs.Content>
  </Grid>
</Tabs.Root>