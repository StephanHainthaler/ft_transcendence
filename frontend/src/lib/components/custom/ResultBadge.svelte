<script lang="ts">
  let { type, label } = $props();
  
  const styles = {
    win: "bg-primary/10 text-easy border-primary/20 ",
    draw: "bg-muted text-muted-foreground border-border ",
    loss: "bg-primary/10 text-hard border-primary/20 "
  };
</script>

<span class="px-3 py-1 rounded-full text-[9px] sm:text-[12px] font-black uppercase tracking-tighter border {styles[type]}">
  {label}
</span>