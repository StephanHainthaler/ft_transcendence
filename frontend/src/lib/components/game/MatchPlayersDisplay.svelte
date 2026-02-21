<script lang="ts">
  import * as Item from "$lib/components/ui/item";
  import type { Game } from "@shared/user";

  const { game }: { game: Game } = $props();

</script>

<Item.Root class="border-1 border-grey flex items-center">
  <Item.Content class="grid grid-cols-[1fr_auto_1fr] text-xl font-bold place-items-center text-nowrap">
    <span class="size-full text-center">
      {game.player1.name}
    </span>
    <span class="size-full text-center">
      vs.
    </span>
    <span class="size-full text-center">
      {game.player2.name}
    </span>
  </Item.Content>
</Item.Root>
