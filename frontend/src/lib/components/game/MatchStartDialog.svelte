<script lang="ts">
  import * as Dialog from "../ui/dialog";
  import { buttonVariants } from "../ui/button";
  import { t } from "@lib/i18n/i18n";
  import { Label } from "../ui/label";
  import type { AppUser } from "@shared/user";
  import { Button } from "../ui/button";
  import type { Snippet } from "svelte";
  import NeonHeader from "../custom/NeonHeader.svelte";
  import { MoveVertical, Keyboard } from "lucide-svelte";
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

</script>

<Dialog.Root open={dialogOpen} onOpenChange={() => dialogOpen = false}>
  <Dialog.Content class="flex flex-col max-w-[95%] md:max-w-[500px] h-auto p-8 bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-2 via-chart-3 to-chart-1"></div>

    <Dialog.Header class="mb-6">
      <Dialog.Title class="-mt-2 mb-2">
        <NeonHeader
          text={$t('game.rules', 'Game Rules')}
          size="x1" 
          level="h1" 
        />
      </Dialog.Title>
      <Dialog.Description class="text-white/40 text-xs uppercase tracking-widest">
        {$t('game.rulesDescription', 'These are the rules of the game.')}
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-6">
            <div class="bg-white/5 p-4 rounded-lg border-l-2 border-chart-3">
                {#each Object.entries(paragraphRecords) as [_, v]}
                    <div class="flex items-center gap-3 mb-3 last:mb-0">
                        {#if v.includes('W/S') || v.includes('arrows')}
                            <div class="flex items-center justify-center p-2 rounded bg-chart-3/10">
                                <Keyboard class="size-4 text-chart-3" />
                            </div>
                        {/if}
                        
                        <p class="text-sm text-white/80 leading-relaxed">
                            {@html v
                                .replace('W/S', '<b class="text-white bg-white/10 px-1 rounded">W/S</b>')
                                .replace(/Up\/Down (arrows|keys)|стрілки Вгору\/Вниз|Pfeiltasten Oben\/Unten/gi, '<b class="text-white bg-white/10 px-1 rounded">↑/↓</b>')
                            }
                        </p>
                    </div>
                {/each}
        </div>

        <div class="space-y-3">
          {#each Object.entries(labelRecords) as [k, v], i}
            <div class="flex justify-between items-center border-b border-white/5 pb-2">
              <Label class="text-xs uppercase font-bold text-muted-foreground tracking-wider cursor-default" for={`name-${i}`}>
                {k}
              </Label>
              <p id={`name-${i}`} class="text-sm font-black uppercase text-white">
                  {v}
              </p>
            </div>
          {/each}
        </div>

        {@render tournamentParticipents?.()}
    </div>

    <Dialog.Footer class="mt-8 flex flex-row gap-3 sm:justify-end">
      <Dialog.Close class="flex-1 sm:flex-none uppercase !font-black text-[10px] md:text-xs !text-white/40 hover:!text-white transition-colors {buttonVariants({ variant: 'outline' })} border-white/10">
        {$t('game.cancel', 'Cancel')}
      </Dialog.Close>
      
      <Button 
        class="flex-1 sm:flex-none uppercase 
          font-black text-[10px] md:text-xs bg-chart-3 text-black px-6 transition-all"
        onclick={() => confirmCallBack()}
      >
        {$t('game.startMatch', 'Start Match')}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>