<script lang="ts">
  import { client } from "@lib/api";
  import { Tournament } from "@lib/tournament/tournament";
  import type { Route } from "@lib/types/route";
  import type { Game, User } from "@shared/user";
  import * as Card from "$lib/components/ui/card";
  import Separator from "@lib/components/ui/separator/separator.svelte";
  import Grid from "@lib/components/custom/Grid.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import Button from "@lib/components/ui/button/button.svelte";
  import { tick } from "svelte";
  import {t} from "@lib/i18n/i18n";


  let availableUsers: User[] = $state([]);
  let selectedUsers: User[] = $state([]);

  let tournament: Tournament = $state(new Tournament());
  let schedule: Game[] = $state([]);
  let nextSchedule: Game[] = $state([]);

  let running = $state(false);

  const loadPageData = async () => {
    availableUsers = await client.getUsers();
  }

  loadPageData();

  let gameCanvas: HTMLCanvasElement | null = $state(null);

  const toggleUserSelected = (user: User) => {
    if (availableUsers.some(u => u.id === user.id)) {
      availableUsers = availableUsers.filter(u => u.id !== user.id);
      selectedUsers = [...selectedUsers, user];
    } else if (selectedUsers.some(u => u.id === user.id)) {
      selectedUsers = selectedUsers.filter(u => u.id !== user.id);
      availableUsers = [...availableUsers, user];
    }
  }

  const startTournament = async () => {
    console.log('starting tournament with ', $state.snapshot(selectedUsers));
    await tick()
    tournament.players = selectedUsers;
    schedule = tournament.getSchedule();
    tournament.start();
    running = true;
    tournament = tournament;
  }

</script>

<Card.Root class="h-full">
  <Card.Header>
    <Card.Title>{$t('tournament.tournament')}</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col gap-4 h-full">
    {#if !running}
      <div class='flex flex-col overflow-y-scroll md:grid md:grid-cols-2 gap-4 h-full'>
        <Grid title={$t('tournament.available')}>
          {#each availableUsers as u}
            <GridCard title={u.name} callback={() => toggleUserSelected(u)}/>
          {/each}
        </Grid>
        <Grid title={$t('tournament.selected')}>
          {#each selectedUsers as u}
            <GridCard title={u.name} callback={() => toggleUserSelected(u)}/>
          {/each}
        </Grid>
      </div>
      <Separator />
      <div class='flex w-full justify-end'>
        <Button size='lg' onclick={startTournament}>{$t('tournament.start')}</Button>
      </div>
    {:else}
      <div class="size-full bg-black">
        <canvas bind:this={gameCanvas}></canvas>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
