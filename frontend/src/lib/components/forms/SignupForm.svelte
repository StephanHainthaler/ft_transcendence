<script lang="ts">
  import { client } from "@lib/api/index.svelte";
  import { validateInputThrow } from "@lib/validation/inputValidation";
  import { goto } from "$app/navigation";
  import Label from "../ui/label/label.svelte";
  import Input from "../ui/input/input.svelte";
  import Button from "../ui/button/button.svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import {t, currentLocale} from "@lib/i18n/i18n";
    import { isAppError, type AppError } from "@lib/types/error";

  let user_nameBuffer = $state('');
  let emailBuffer = $state('');
  let userPasswordBuffer = $state('');
  let userPasswordRepeatBuffer = $state('');
  let errorMessage = $state('');
  let isLoading = $state(false);

  const handleSignupFormSubmit = async (e: Event) => {
    e.preventDefault();
    errorMessage = '';
    isLoading = true;

    try {
      const user_name = validateInputThrow(user_nameBuffer, { type: 'username' });
      const email = validateInputThrow(emailBuffer, { type: 'email' });
      validateInputThrow(userPasswordBuffer, { type: 'password' });

      if (userPasswordBuffer !== userPasswordRepeatBuffer) {
        throw new Error("pass_mismatch"), {isAppError: true} as AppError;
      }

      await client.signup({
        user_name,
        email,
        passwd: userPasswordBuffer,
      });

      await goto('/');
    } catch (e: any) {
      if (isAppError(e))
        errorMessage = $t('error.', e.message) || $t('error.general');
      else
        errorMessage = e.message || e.error || JSON.stringify(e);
    } finally {
      isLoading = false;
    }
  }
</script>

<form class="space-y-6" onsubmit={handleSignupFormSubmit}>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-center">{$t('signup.register')}</h2>

    <div class="space-y-2">
      <Label for="username-input">{$t('signup.username')}</Label>
      <Input
        id="user_name-input"
        type="text"
        bind:value={user_nameBuffer}
        placeholder={$t('signup.username_ph')}
        required
        disabled={isLoading}
      />
    </div>

    <div class="space-y-2">
      <Label for="email-input">{$t('signup.email')}</Label>
      <Input
        id="email-input"
        type="email"
        bind:value={emailBuffer}
        placeholder={$t('signup.email_ph')}
        autocomplete="off"
        required
        disabled={isLoading}
      />
    </div>

    <div class="space-y-2">
      <Label for="password-input">{$t('signup.password')}</Label>
      <Input
        id="password-input"
        type="password"
        bind:value={userPasswordBuffer}
        placeholder={$t('signup.password_ph')}
        autocomplete="new-password"
        required
        disabled={isLoading}
      />
    </div>

    <div class="space-y-2">
      <Label for="password-repeat-input">{$t('signup.pass_repeat')}</Label>
      <Input
        id="password-repeat-input"
        type="password"
        bind:value={userPasswordRepeatBuffer}
        placeholder={$t('signup.pass_confirm')}
        autocomplete="new-password"
        required
        disabled={isLoading}
      />
    </div>
  </div>

  {#if errorMessage}
    <Alert class="bg-red-400/50">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full" disabled={isLoading}>
    {isLoading ? $t('signup.loading') : $t('signup.signup')}
  </Button>
</form>
