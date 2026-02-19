<script lang="ts">
  import * as Dialog from "../ui/dialog";
  import { buttonVariants } from "../ui/button";
  import { t } from "@lib/i18n/i18n";
  import { Label } from "../ui/label";
  import type { AppUser } from "@shared/user";
  import { Button } from "../ui/button";
  import type { Snippet } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs";

  let {
    dialogOpen = $bindable(),
    labelRecords,
    paragraphRecords,
    tournamentParticipents,
    confirmCallBack,
  }: {
    dialogOpen: boolean,
    labelRecords: Record<string, string>,
    paragraphRecords: Record<string, string>,
    tournamentParticipents?: Snippet,
    confirmCallBack: (u?: AppUser) => void,
  } = $props();

  $effect(() => console.log(labelRecords))

</script>

<Dialog.Root open={dialogOpen} onOpenChange={() => dialogOpen = false}>
  <Tabs.Root>
    <Dialog.Content class="flex flex-col justify-between h-[60%] min-w-[90%] md:min-w-[60%] p-12">
      <Dialog.Header class="flex flex-row justify-between">
        <div>
        <Dialog.Title>{$t('game.rules')}</Dialog.Title>
        <Dialog.Description>
          {$t('game.rulesDescription')}
        </Dialog.Description>
        </div>
        {#if tournamentParticipents}
          <Tabs.List>
            <Tabs.Trigger value="rules">{$t('tournament.rules', 'Rules')}</Tabs.Trigger>
            <Tabs.Trigger value="schedule">{$t('tournament.scheduleTab', 'Schedule')}</Tabs.Trigger>
          </Tabs.List>
        {/if}
      </Dialog.Header>
      <div>
      {#if tournamentParticipents}
        <Tabs.Content value="rules">
          <div class="flex flex-col justify-between items-center">
            {#each Object.entries(paragraphRecords) as [_, v]}
              <p class="text-lg max-w-prose mb-3">{v}</p>
            {/each}
            <div class="grid grid-cols-2 text-lg w-full max-w-prose place-items-around align-center">
              {#each Object.entries(labelRecords) as [k, v], i}
                <Label class="text-lg max-w-prose" for={`name-${i}`}>{k}</Label><p id={`name-${i}`}>{v}</p>
              {/each}
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value="schedule">
          {@render tournamentParticipents?.()}
        </Tabs.Content>
      {:else}
        <div class="flex flex-col justify-between items-center">
          {#each Object.entries(paragraphRecords) as [_, v]}
            <p class="text-lg max-w-prose mb-3">{v}</p>
          {/each}
          <div class="grid grid-cols-2 text-lg w-full max-w-prose place-items-around align-center">
            {#each Object.entries(labelRecords) as [k, v], i}
              <Label class="text-lg max-w-prose" for={`name-${i}`}>{k}</Label><p id={`name-${i}`}>{v}</p>
            {/each}
          </div>
        </div>
      {/if}
      </div>
      <Dialog.Footer class="align-center">
        <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
        <Button onclick={() => confirmCallBack()}>{$t('game.startMatch')}</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Tabs.Root>
</Dialog.Root>
