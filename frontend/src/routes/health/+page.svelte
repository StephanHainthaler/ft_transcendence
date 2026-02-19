<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
    import { t } from "@lib/i18n/i18n";

  let message = '';
  let success = false;

  async function healthCheckBtnEvent() {
    try {
      const response = await fetch("/api/health", {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        message = data.message;
        success = true;
      } else {
        throw new Error(`${response.status}`)
      }
    } catch (e: any) {
      message = e.message || 'Connection failed';
      success = false;
    }
  }

</script>

<Card.Root>
  <Card.Header>
  </Card.Header>
  <Card.Content>
    <div class="flex gap-4 flex-1 items-center">
      <Button onclick={healthCheckBtnEvent}>{$t('healthcheck', 'Check Connection')}</Button>
      <div class={`p-4 ${ message.length > 0 ? success ? 'bg-green-300' : 'bg-red-300' : ''}` }>
        {message}
      </div>
    </div>
  </Card.Content>
</Card.Root>
