<script lang="ts">
    export let imageSrc: string;
    export let altText: string = "Brand Logo";
    //export let size: number = 48; // Default size in pixels
    export let motto: string = "";
</script>

<div class="md:col-span-2 relative aspect-[21/9] md:aspect-[3/1]
    overflow-hidden border border-white/10 group bg-black/20
    backdrop-blur-md hover:border-primary/50 transition-all
    duration-500">
  
  <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50
    to-transparent opacity-70 group-hover:via-primary transition-all duration-500"></div>

  <img 
    src={imageSrc} 
    alt={altText} 
    class="absolute inset-0 h-full w-full object-contain 
           contrast-[1.1] saturate-[1.2] brightness-[1.05]
           transition-transform duration-700 group-hover:scale-105"
  />

  <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
  
  <div class="absolute bottom-4 left-6 flex items-center gap-2">
     <div class="hidden lg:inline-block size-2 bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"></div>
     
     <span class="hidden lg:inline-block text-[10px] font-mono text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]">
        {motto}
     </span>
  </div>
</div>