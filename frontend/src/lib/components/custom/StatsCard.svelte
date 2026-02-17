<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  let { label, value } = $props();
</script>

<Card.Root class="relative overflow-hidden border-border bg-card/30 backdrop-blur-md group hover:border-primary/50 transition-all duration-500 justify-between">
  <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
  
  <Card.Header class="p-4 pb-0"> 
    <Card.Title class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
      {label}
    </Card.Title>
  </Card.Header>
  <Card.Content class="p-4 pt-2">
    <span class="text-2xl sm:text-3xl font-black font-mono text-white tracking-tighter">
      {value ?? 0}
    </span>
  </Card.Content>
</Card.Root>