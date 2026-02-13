<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { client } from "$lib/api/index.svelte";
  import { validateInput } from "@lib/validation/inputValidation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { goto } from "$app/navigation";
  import { t } from "@lib/i18n/i18n";

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
    <h2 class="text-2xl font-bold text-center">{$t('login.signin')}</h2>

    <div class="space-y-2">
      <Label for="username">{$t('login.username')}</Label>
      <Input 
        id="user_name"
        type="text"
        bind:value={user_nameBuffer}
        placeholder={$t('login.username_ph')}
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="password">{$t('login.password')}</Label>
      <Input 
        id="password"
        type="password"
        bind:value={userPasswordBuffer}
        placeholder={$t('login.password_ph')}
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
    {$t('login.signin')}
  </Button>
</form>
