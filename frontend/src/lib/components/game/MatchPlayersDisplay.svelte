<script lang="ts">
  import * as Item from "$lib/components/ui/item";
  import type { Game } from "@shared/user";
  import { SquareCode } from "lucide-svelte";

  const { game }: { game: Game } = $props();

</script>

<Item.Root class="border-1 border-grey-300 flex items-center">
  <Item.Content class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] text-base sm:text-xl
      font-bold place-items-center w-full">
    <span class="w-full text-center border border-gray-300
        sm:rounded-l p-2 break-words truncate max-w-full">
      {game.player1.name}
    </span>
    <span class="w-full text-center p-2">
      <SquareCode class="inline-block size-5 sm:size-6 text-chart-3 drop-shadow-[0_0_10px_var(--my-primary)]" />
    </span>
    <span class=" w-full text-center border border-gray-300 sm:rounded-r
        p-2 break-words truncate max-w-full">
      {game.player2.name}
    </span>
  </Item.Content>
</Item.Root>
