<script lang="ts">
  import { setup2FA, enable2FA } from "$lib/api/auth";
  import { t } from "@lib/i18n/i18n";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Card from "$lib/components/ui/card";

  let step: 'idle' | 'setup' | 'verify' | 'done' = $state('idle');
  let qrCodeUrl = $state('');
  let secretKey = $state('');
  let verifyCode = $state('');
  let errorMessage = $state('');
  let successMessage = $state('');

  const mapTwoFaError = (e: any): string => {
    const msg = e?.message || e?.toString?.() || '';

    if (msg === '2FA already enabled for this User') return $t('twofa.error_already_enabled', 'Two-Factor Authentication is already enabled for this account');
    if (msg === 'No Such User') return $t('twofa.error_no_user', 'No user found. Please log in again and try setting up 2FA.');
    if (msg === 'Unauthenticated') return $t('twofa.error_unauthenticated', 'You must be logged in to set up Two-Factor Authentication. Please log in and try again.');
    if (msg === 'Missing 2FA token') return $t('twofa.error_missing_token', 'Verification code is required. Please enter the 6-digit code from your authenticator app.');
    if (msg === 'Invalid 2FA token') return $t('twofa.error_invalid_token', 'Invalid verification code. Please ensure you entered the 6-digit code from your authenticator app correctly.');

    return msg || $t('twofa.invalid_code', 'Invalid code. Please try again.');
  };

  const startSetup = async () => {
    try {
      errorMessage = '';
      const result = await setup2FA();
      if (!result?.qrCodeUrl || !result?.secret)
        throw new Error($t('twofa.invalid_setup_response', 'Invalid response from server during 2FA setup. Please try again.'));

      qrCodeUrl = result.qrCodeUrl;
      secretKey = result.secret;
      step = 'setup';
    } catch (e: any) {
      errorMessage = mapTwoFaError(e) || $t('twofa.failed_setup', 'Failed to initiate Two-Factor Authentication setup. Please try again.');
    }
  };

  const verifyAndEnable = async () => {
    try {
      errorMessage = '';
      await enable2FA(verifyCode);
      successMessage = $t('twofa.enabled_success', 'Two-Factor Authentication has been enabled successfully!');
      step = 'done';
    } catch (e: any) {
      errorMessage = mapTwoFaError(e) || $t('twofa.invalid_code', 'Invalid verification code. Please try again.');
    }
  };

  const reset = () => {
    step = 'idle';
    qrCodeUrl = '';
    secretKey = '';
    verifyCode = '';
    errorMessage = '';
    successMessage = '';
  };
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{$t('twofa.title', 'Two-Factor Authentication')}</Card.Title>
    <Card.Description>
      {$t('twofa.description', 'Add an extra layer of security to your account')}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if step === 'idle'}
      <p class="text-sm text-muted-foreground mb-4">
        {$t('twofa.protect_text', 'Protect your account by requiring a verification code from your authenticator app when signing in.')}
      </p>
      <Button onclick={startSetup}>{$t('twofa.enable_button', 'Enable 2FA')}</Button>
      {#if errorMessage}
        <Alert variant="destructive" class="mt-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      {/if}

    {:else if step === 'setup'}
      <div class="space-y-4">
        <p class="text-sm">
          {$t('twofa.scan_qr')}
        </p>
        
        <div class="flex justify-center p-4 bg-white rounded-lg">
          <img src={qrCodeUrl} alt={$t('twofa.qr_alt', '2FA QR Code')} class="w-48 h-48" />
        </div>

        <details class="text-sm">
          <summary class="cursor-pointer text-muted-foreground">
            {$t('twofa.manual_code', 'Manual Code')}
          </summary>
          <code class="block mt-2 p-2 bg-muted rounded text-xs break-all">
            {secretKey}
          </code>
        </details>

        <div class="space-y-2">
          <Label for="verify-code">{$t('twofa.enter_code', 'Enter Verification Code')}</Label>
          <Input
            id="verify-code"
            type="text"
            bind:value={verifyCode}
            placeholder="000000"
            maxlength={6}
            pattern="[0-9]*"
            inputmode="numeric"
          />
        </div>

        {#if errorMessage}
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        {/if}

        <div class="flex gap-2">
          <Button variant="outline" onclick={reset}>{$t('twofa.cancel', 'Cancel')}</Button>
          <Button onclick={verifyAndEnable} disabled={verifyCode.length !== 6}>
            {$t('twofa.verify_enable', 'Verify and Enable')}
          </Button>
        </div>
      </div>

    {:else if step === 'done'}
      <Alert>
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
      <Button class="mt-4" variant="outline" onclick={reset}>{$t('twofa.done', 'Done')}</Button>
    {/if}
  </Card.Content>
</Card.Root>
