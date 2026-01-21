<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { client } from "$lib/api/index.svelte";
  import { validateInput } from "@lib/validation/inputValidation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { goto } from "$app/navigation";

  const handleLoginFormSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const email = validateInput(user_nameBuffer, { type: 'email' }).input;
      const user_name = validateInput(user_nameBuffer, { type: 'username' }).input;

      await client.login({
        user_name,
        email,
        passwd: userPasswordBuffer,
      });

      goto('/');
    } catch (e: any) {
      errorMessage = e.message || e.toString();
    }
  }

  let user_nameBuffer = $state("");
  let userPasswordBuffer = $state("");
  let errorMessage = $state("");

</script>

<form class="space-y-6" onsubmit={handleLoginFormSubmit}>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-center">Sign in</h2>

    <div class="space-y-2">
      <Label for="user_name">Email or Username</Label>
      <Input 
        id="user_name"
        type="text"
        bind:value={user_nameBuffer}
        placeholder="Enter your email or user_name"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="password">Password</Label>
      <Input 
        id="password"
        type="password"
        bind:value={userPasswordBuffer}
        placeholder="Enter your password"
        required
      />
    </div>
  </div>

  {#if errorMessage}
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full">
    Sign In
  </Button>
</form>
