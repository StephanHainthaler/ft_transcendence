<script lang="ts">
  import type { Snippet } from "svelte";

  const { title, children }: { title: string, children: Snippet } = $props();

</script>

<div class='size-full flex flex-col gap-2 card p-2 bg-cream'>
  <div class='w-full card p-2 bg-teal'>
    <h1 class='text-lg text-cream font-bold'>{title}</h1>
  </div>
  <div class='size-full flex flex-col gap-2 card p-2 bg-sage'>
    {@render children()}
  </div>
</div>
