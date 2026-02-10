<script lang="ts">
  import { client } from "$lib/api";
  import { setup2FA, enable2FA } from "$lib/api/auth";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Card from "$lib/components/ui/card";

  // Get the token store from client (we need to access it for API calls)
  // @ts-ignore - accessing private for now
  const token = client['accessToken'];

  let step: 'idle' | 'setup' | 'verify' | 'done' = $state('idle');
  let qrCodeUrl = $state('');
  let secretKey = $state('');
  let verifyCode = $state('');
  let errorMessage = $state('');
  let successMessage = $state('');

  const startSetup = async () => {
    console.log('startSetup clicked!');
    try {
      errorMessage = '';
      console.log('Calling setup2FA...');
      const result = await setup2FA(token);
      console.log('2FA setup result:', result);
      qrCodeUrl = result.qrCodeUrl;
      secretKey = result.secret;
      step = 'setup';
    } catch (e: any) {
      console.error('2FA setup error:', e);
      errorMessage = e.message || 'Failed to setup 2FA';
    }
  };

  const verifyAndEnable = async () => {
    try {
      errorMessage = '';
      await enable2FA(token, verifyCode);
      successMessage = '2FA has been enabled successfully!';
      step = 'done';
    } catch (e: any) {
      errorMessage = e.message || 'Invalid code. Please try again.';
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
    <Card.Title>Two-Factor Authentication</Card.Title>
    <Card.Description>
      Add an extra layer of security to your account
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if step === 'idle'}
      <p class="text-sm text-muted-foreground mb-4">
        Protect your account by requiring a verification code from your authenticator app when signing in.
      </p>
      <Button onclick={startSetup}>Enable 2FA</Button>

    {:else if step === 'setup'}
      <div class="space-y-4">
        <p class="text-sm">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
        
        <div class="flex justify-center p-4 bg-white rounded-lg">
          <img src={qrCodeUrl} alt="2FA QR Code" class="w-48 h-48" />
        </div>

        <details class="text-sm">
          <summary class="cursor-pointer text-muted-foreground">
            Can't scan? Enter code manually
          </summary>
          <code class="block mt-2 p-2 bg-muted rounded text-xs break-all">
            {secretKey}
          </code>
        </details>

        <div class="space-y-2">
          <Label for="verify-code">Enter the 6-digit code from your app</Label>
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
          <Button variant="outline" onclick={reset}>Cancel</Button>
          <Button onclick={verifyAndEnable} disabled={verifyCode.length !== 6}>
            Verify & Enable
          </Button>
        </div>
      </div>

    {:else if step === 'done'}
      <Alert>
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
      <Button class="mt-4" variant="outline" onclick={reset}>Done</Button>
    {/if}
  </Card.Content>
</Card.Root>
