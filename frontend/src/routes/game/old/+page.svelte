<script lang="ts">
  import { AppUser } from "@lib/api/appUser";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { client } from "@lib/api/index.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button from "@lib/components/ui/button/button.svelte";
  import { buttonVariants } from "@lib/components/ui/button";
  import { Label } from "$lib/components/ui/label/index.js";
  import { tick } from 'svelte';
  import { toast } from "svelte-sonner";
  import { t } from "@lib/i18n/i18n";
  import { Pong } from "@lib/game/pong";
  import type { MatchSubmissionData } from "@shared/game_stats";

  let users: AppUser[] = $state([]);
  let aiUser: AppUser = $state({} as AppUser);
  let isRunningGame = $state(false);
  let isShowingResults = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong | null = $state(null);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = $state({} as AppUser);
  let challengedUser = $state({} as AppUser);
  let pointsToWin = $state(10);
  let matchDurationInMinutes = $state(5);
  let AIdifficulty = $state(2);

  const loadPageData = async () =>
  {
    await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      users = data;

      // filter out current user
      if (client.user)
        users = users.filter((u) => u.id !== client.user!.id);

      //add new AI user
      aiUser = new AppUser({
        id: 0, //0 to indicate AI user
        name: "AI Opponent",
      }, null);
    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
    }
  }

  const challengeUser = async (selectedUser: AppUser) =>
  {
    isRunningGame = true;
    isShowingResults = false;

    await tick();
    if (client.user)
    {
      challengingUser = new AppUser(client.user, null);
      challengedUser = selectedUser;
      if (canvas)
        pong = new Pong(challengingUser, challengedUser, canvas, pointsToWin, matchDurationInMinutes, AIdifficulty, onGameEnd);
    }
  };

  const onGameEnd = (data: MatchSubmissionData)  =>
  {
    isRunningGame = false;
    isShowingResults = true;

    console.log(data);
    matchData = data;
    try
    {
      client.sendMatchResults(data);
    } 
    catch (e: any){
      console.error("GameEnd Error:", e.message);
    }
  };

  function returnToChallengePage() : void
  {
		isRunningGame = false;
    isShowingResults = false;
	};

  async function startRematch()
  {
    if (pong)
    {
      isRunningGame = true;
      isShowingResults = false;

      await tick();
      pong.resetMatch(canvas!);
    }
  };

  loadPageData();

</script>

<div class='size-full flex flex-col justify-center items-center'>
  <Card.Root class='size-full flex flex-col'>
    <Card.Header>
      <Card.Title>{$t('game.game')}</Card.Title>
    </Card.Header>
    <Card.Content class='flex-1 min-h-0 overflow-hidden'>
      {#if !isRunningGame && !isShowingResults}
        <Grid title={$t('game.settings')}>
          <div class="w-full flex justify-center">
            <table class="w-full flex flex-col text-center text-lg border-collapse mx-auto">
              <colgroup>
                <col style="width:50%;"/>
              </colgroup>
              <tbody>
                <tr>
                  <td class="text-white text-left text-l md:text-xl font-bold p-3">
                    <label>
                      {$t('game.pointsToWin')}:
                      <input type="number" bind:value={pointsToWin} min="1" max="20"/>
                      <input type="range" bind:value={pointsToWin} min="1" max="20"/>
                    </label>
                  </td>
                  <td class="text-white text-l md:text-xl font-bold p-3">
                    <div class="flex items-center gap-2 ml-auto">
                      <span class="text-whitetext-l md:text-xl font-bold p-3">{$t('game.AIdifficulty')}:</span>
                      <Button size="sm" class={AIdifficulty === 1 ? "text-white bg-green-600" : " text-black bg-green-600 hover:bg-green-300"} onclick={() => (AIdifficulty = 1)}>{$t('game.easy')}</Button>
                      <Button size="sm" class={AIdifficulty === 2 ? "text-white bg-yellow-400" : "text-black bg-yellow-400 hover:bg-yellow-300"} onclick={() => (AIdifficulty = 2)}>{$t('game.medium')}</Button>
                      <Button size="sm" class={AIdifficulty === 3 ? "text-white bg-red-600" : "text-black bg-red-600 hover:bg-red-300"} onclick={() => (AIdifficulty = 3)}>{$t('game.hard')}</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="text-white text-left text-l md:text-xl font-bold p-3">
                    <label>
                      {$t('game.matchDurationInMinutes')}:
                      <input type="number" bind:value={matchDurationInMinutes} min="1" max="10"/>
                      <input type="range" bind:value={matchDurationInMinutes} min="1" max="10"/>
                    </label>
                  </td>
                  <td class="text-white text-center text-2xl md:text-3xl font-extrabold p-3">
                   <div class="text-right">
                      <Dialog.Root>
                        <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
                          {$t('game.challengeAI')}
                        </Dialog.Trigger>
                        <Dialog.Content class="sm:max-w-[425px]">
                          <Dialog.Header>
                            <Dialog.Title>{$t('game.rules')}</Dialog.Title>
                            <Dialog.Description>
                              {$t('game.rulesDescription')}
                            </Dialog.Description>
                          </Dialog.Header>
                          <div class="grid gap-4">
                            <div class="grid gap-3">
                              <p class="mb-3">{$t('game.howToPlay')}</p>
                              <p class="mb-3">{$t('game.howToWin')}</p>
                              <Label for="name-1">{$t('game.leftPlayer')}: {client.user!.name}</Label>
                              <Label for="name-1">{$t('game.rightPlayer')}: {$t('game.aiOpponent')}</Label>
                              <Label for="name-1">{$t('game.pointsToWin')}: {pointsToWin}</Label>
                              <Label for="name-1">{$t('game.matchDuration')}: {matchDurationInMinutes} {$t('game.minutes')}</Label>
                              <Label for="name-1">{$t('game.AIdifficulty')}: {AIdifficulty === 1 ? $t('game.easy') : AIdifficulty === 2 ? $t('game.medium') : $t('game.hard')}</Label>
                            </div>
                          </div>
                          <Dialog.Footer>
                            <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
                            <Button size="sm" onclick={() => challengeUser(aiUser)}>{$t('game.startMatch')}</Button>
                          </Dialog.Footer>
                        </Dialog.Content>
                      </Dialog.Root>
                    </div> 
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Grid>
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <Dialog.Root>
              <Dialog.Trigger class="w-full">
                <GridCard title={user.name} avatarUrl={user.avatarUrl} buttonDesc={$t('game.challenge')} callback={() => (challengedUser = user)}/>
              </Dialog.Trigger>
              <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                  <Dialog.Title>{$t('game.rules')}</Dialog.Title>
                  <Dialog.Description>{$t('game.rulesDescription')}</Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4">
                  <div class="grid gap-3">
                    <p class="mb-3">{$t('game.howToPlay')}</p>
                    <p class="mb-3">{$t('game.howToWin')}</p>
                    <Label for="name-1">{$t('game.leftPlayer')}: {client.user!.name}</Label>
                    <Label for="name-1">{$t('game.rightPlayer')}: {challengedUser.name}</Label>
                    <Label for="name-1">{$t('game.pointsToWin')}: {pointsToWin}</Label>
                    <Label for="name-1">{$t('game.matchDuration')}: {matchDurationInMinutes} {$t('game.minutes')}</Label>
                  </div>
                </div>
                <Dialog.Footer>
                  <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
                  <Button size="sm" onclick={() => challengeUser(user)}>{$t('game.startMatch')}</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          {/each}
        </Grid>
      {:else if isRunningGame && !isShowingResults}
        <div class="size-full flex flex-col">
          <canvas bind:this={canvas} class='size-full bg-black' tabindex='0'></canvas>
        </div>
      {:else}
      {/if}
    </Card.Content>
  </Card.Root>
</div>
