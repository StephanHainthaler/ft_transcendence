<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { client } from "$lib/api/index.svelte";
  import { validateInput } from "@lib/validation/inputValidation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { goto } from "$app/navigation";
  import {t, currentLocale} from "@lib/i18n/i18n";

  let usernameBuffer = $state("");
  let userPasswordBuffer = $state("");
  let totpToken = $state("");
  let errorMessage = $state("");
  let requires2FA = $state(false);

  const handleLoginFormSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const email = validateInput(usernameBuffer, { type: 'email' }).input;
      const user_name = validateInput(usernameBuffer, { type: 'username' }).input;

      const result = await client.login({
        user_name,
        email,
        passwd: userPasswordBuffer,
        totp_token: requires2FA ? totpToken : undefined,
      });

      // Check if 2FA is required
      if (result?.requires_2fa) {
        requires2FA = true;
        errorMessage = "";
        return;
      }

      goto('/');
    } catch (e: any) {
      errorMessage = e.message || e.toString();
    }
  }
</script>

<form class="space-y-6" onsubmit={handleLoginFormSubmit}>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-center">
      {requires2FA ? $t('login.enter_2fa') : $t('login.signin')}
    </h2>

    {#if !requires2FA}
      <div class="space-y-2">
        <Label for="username">{$t('login.username')}</Label>
        <Input 
          id="username"
          type="text"
          bind:value={usernameBuffer}
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
    {:else}
      <p class="text-sm text-center text-muted-foreground">
        {$t('login.enter_2fa_code')}
      </p>
      <div class="space-y-2">
        <Label for="totp">{$t('login.auth_code')}</Label>
        <Input 
          id="totp"
          type="text"
          bind:value={totpToken}
          placeholder="000000"
          maxlength={6}
          pattern="[0-9]*"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
        />
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        class="w-full"
        onclick={() => { requires2FA = false; totpToken = ''; }}
      >
        ← {$t('login.back_to_login')}
      </Button>
    {/if}
  </div>

  {#if errorMessage}
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full">
    {requires2FA ? $t('login.verify') : $t('login.signin')}
  </Button>
</form>
