<script lang="ts">
  import { GameClient } from "@lib/api/gameClient";
  import { client } from "@lib/api/index";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import type { User } from "@shared/user";
  import * as Card from "$lib/components/ui/card";
  import { tick } from 'svelte';
  import Grid from "@lib/components/custom/Grid.svelte";
  import {t} from "@lib/i18n/i18n";

  let users: User[] = $state([])
  let gameClient: GameClient = $state(new GameClient());

  const loadPageData = async () => {
    await tick();
    await tick();
    const data = await client.getFriends();
    console.log(data);
    users = data.friends;
  }

  loadPageData();

  let running = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);

  const challengeUser = async (u: User) => {
    running = true;
    await tick();
    console.log(canvas)
    const challengeUserId = u.id;
    gameClient.canvasElement = canvas as HTMLCanvasElement;
    gameClient.init();
    gameClient.startGame(client.user?.id!, challengeUserId);
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
            <GridCard title={user.name} desc={user.username} callback={() => challengeUser(user)} buttonDesc={'Challenge'} />
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
