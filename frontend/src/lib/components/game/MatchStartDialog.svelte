<script lang="ts">
  import * as Dialog from "../ui/dialog";
  import { buttonVariants } from "../ui/button";
  import { t } from "@lib/i18n/i18n";
  import { Label } from "../ui/label";
  import type { AppUser } from "@lib/api/appUser";
  import { Button } from "../ui/button";
    import type { Snippet } from "svelte";

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
  <Dialog.Content class="flex flex-col justify-between h-[60%] min-w-[90%] md:min-w-[60%] p-12">
    <Dialog.Header>
      <Dialog.Title>{$t('game.rules')}</Dialog.Title>
      <Dialog.Description>
        {$t('game.rulesDescription')}
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col justify-between items-center">
        {#each Object.entries(paragraphRecords) as [_, v]}
          <p class="text-lg max-w-prose mb-3">{v}</p>
        {/each}
        <div class="grid grid-cols-2 text-lg w-full max-w-prose place-items-around align-center">
          {#each Object.entries(labelRecords) as [k, v], i}
            <Label class="text-lg max-w-prose" for={`name-${i}`}>{k}</Label><p id={`name-${i}`}>{v}</p>
          {/each}
        </div>
        {@render tournamentParticipents?.()}
    </div>
    <Dialog.Footer class="align-center">
      <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
      <Button onclick={() => confirmCallBack()}>{$t('game.startMatch')}</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
