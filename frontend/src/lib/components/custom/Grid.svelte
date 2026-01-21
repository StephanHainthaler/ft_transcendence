<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Card from "$lib/components/ui/card";
  const { title, children }: { title: string, children: Snippet } = $props();

</script>

<Card.Root>
  <Card.Header>
  <Card.Title>{title}</Card.Title>
  </Card.Header>
  <Card.Content class="size-full flex flex-col gap-2">
    {@render children()}
  </Card.Content>
</Card.Root>
