<script lang="ts">
  import { t } from '$lib/i18n/i18n';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from "../ui/dialog";

  let { winner, onReturn } = $props<{
    winner: { name: string },
    onReturn: () => void
  }>();

  function handleOpenChange(open: boolean) {
    if (!open) {
      onReturn();
    }
  }

  function preventClose(e: Event) {
    e.preventDefault();
  }
</script>

<Dialog.Root open={true} onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl" /> 
    
    <Dialog.Content 
      onInteractOutside={preventClose}
      onEscapeKeydown={preventClose}
      class="fixed left-[50%] top-[50%] z-50 flex w-[95%] max-w-[600px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center p-8 bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden"
    >
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-2 via-chart-3 to-chart-1"></div>

      <Dialog.Header class="mb-6 flex flex-col items-center text-center">
        <Dialog.Title class="-mt-2 mb-2 uppercase text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {$t('tournament.finished', "Tournament Finished")}
        </Dialog.Title>
        <Dialog.Description class="text-white/60 text-1xl uppercase tracking-[0.3em]">
          {$t('tournament.winnerAnnounce', "And the winner is...")}
        </Dialog.Description>
      </Dialog.Header>

      <div class="relative py-8 px-12 text-center my-4">
        <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-chart-3 animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-chart-3 animate-pulse"></div>
        
        <span class="text-2xl md:text-4xl font-black text-chart-3 drop-shadow-[0_0_20px_rgba(var(--chart-3),0.5)] tracking-tighter uppercase">
          {winner.name}
        </span>
      </div>

      <Dialog.Footer class="mt-8 w-full flex flex-row gap-3 sm:justify-center">
        <Button 
          class="w-full sm:w-auto uppercase font-black text-xs bg-chart-3 text-black px-12 py-6 transition-all hover:opacity-90 hover:scale-105"
          onclick={onReturn}
        >
          {$t('game.return', 'Return')}
        </Button>
      </Dialog.Footer>

    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>