<script lang="ts">
  import { GameClient } from "@lib/api/gameClient";
  import { client } from "@lib/api/index";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import type { User } from "@shared/user";
  import * as Card from "$lib/components/ui/card";
  import { ItemGroup } from "@lib/components/ui/item";
  import { tick } from 'svelte';

  let users: User[] = $state([])
  let gameClient: GameClient = $state(new GameClient());

  const loadPageData = async () => {
    const data = await client.getFriends();
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
  <Card.Root class='size-full max-w-3xl'>
    <Card.Header>
      <Card.Title>Game</Card.Title>
    </Card.Header>
    <Card.Content class='size-full'>
      {#if !running}
        <ItemGroup class='max-h-full w-full p-2 flex flex-col gap-1 opacity-60 rounded-md border-teal border-1 h-full overflow-y-scroll'>
          {#each users as user}
            <GridCard title={user.name} desc={user.username} callback={() => challengeUser(user)} buttonDesc={'Challenge'} />
          {/each}
        </ItemGroup>
      {:else}
        <div class="size-full flex flex-col">
          <canvas bind:this={canvas} class='bg-black size-full' tabindex='0'></canvas>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
