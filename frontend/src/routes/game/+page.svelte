<script lang="ts">
  import { client } from "@lib/api/index";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import { tick } from 'svelte';
  import Grid from "@lib/components/custom/Grid.svelte";
  import { AppUser } from "@lib/api/appUser";
  import { toast } from "svelte-sonner";
  import {t} from "@lib/i18n/i18n";

  import { Pong } from "@lib/game/pong";
  import type { MatchSubmissionData } from "@shared/game_stats";

  let users: AppUser[] = $state([])

  const loadPageData = async () => {
    await tick();
    await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      users = data;
    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
    }
  }

  let running = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong;


  const onGameEnd = (Data: MatchSubmissionData) => {
    console.log(Data);

      //send Data to database
      
  
  };

  let testUser1 = {} as AppUser;
  let testUser2 = {} as AppUser;

  loadPageData();

  const challengeUser = async (u: AppUser) => {
    running = true;
    await tick();
    console.log(u);
    testUser1 = u;
    if (client.user)
    {
      testUser2 = new AppUser(client.user, null);
      if (canvas)
        pong = new Pong(testUser1, testUser2, canvas, onGameEnd);
    }
  }

</script>

<div class='size-full flex flex-col justify-center items-center'>
  <Card.Root class='size-full'>
    <Card.Header>
      <Card.Title>{$t('game.game')}</Card.Title>
    </Card.Header>
    <Card.Content class='size-full'>
      {#if !running}
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <GridCard title={user.name} avatarUrl={user.avatarUrl} callback={() => challengeUser(user)} buttonDesc={$t('game.challenge')} />
          {/each}
        </Grid>
      {:else}
        <div class="size-full flex flex-col">
          <canvas bind:this={canvas} class='bg-black size-full' tabindex='0'></canvas>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
