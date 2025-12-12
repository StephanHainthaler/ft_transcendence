<script lang="ts">
  import { GameClient } from "@lib/api/gameClient";
  import { client } from "@lib/api/index";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import { tick } from 'svelte';
  import Grid from "@lib/components/custom/Grid.svelte";
  import type { AppUser } from "@lib/api/appUser";

  let users: AppUser[] = $state([])
  let gameClient: GameClient = $state(new GameClient());

  const loadPageData = async () => {
    await tick();
    await tick();
    const data = await client.getUsers();
    console.log(data);
    users = data;
  }

  loadPageData();

  let running = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);

  const challengeUser = async (u: AppUser) => {
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
      <Card.Title>Game</Card.Title>
    </Card.Header>
    <Card.Content class='size-full'>
      {#if !running}
        <Grid title={'Challenge'}>
          {#each users as user}
            <GridCard title={user.name} avatarUrl={user.avatarUrl} desc={user.displayName} callback={() => challengeUser(user)} buttonDesc={'Challenge'} />
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
