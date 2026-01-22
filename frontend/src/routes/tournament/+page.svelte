<script lang="ts">
  import { client } from "@lib/api/index.svelte";
  import * as Card from "$lib/components/ui/card";
  import Separator from "@lib/components/ui/separator/separator.svelte";
  import Grid from "@lib/components/custom/Grid.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import Button from "@lib/components/ui/button/button.svelte";
  import { AppUser } from "@lib/api/appUser";
  import Tournament from "@lib/components/custom/Tournament.svelte";
  import Alert from "@lib/components/ui/alert/alert.svelte";
  import AlertDescription from "@lib/components/ui/alert/alert-description.svelte";
  import { toast } from 'svelte-sonner';
  import {t} from "@lib/i18n/i18n";

  let availableUsers: AppUser[] = $state([]);
  let selectedUsers: AppUser[] = $state([]);

  let running = $state(false);
  let error: string | null = $state(null);

  const loadPageData = async () => {
    availableUsers = await client.getUsers();
  }

  loadPageData();

  const toggleUserSelected = (user: AppUser) => {
    if (availableUsers.some(u => u.id === user.id)) {
      availableUsers = availableUsers.filter(u => u.id !== user.id);
      selectedUsers = [...selectedUsers, user];
    } else if (selectedUsers.some(u => u.id === user.id)) {
      selectedUsers = selectedUsers.filter(u => u.id !== user.id);
      availableUsers = [...availableUsers, user];
    }
  }

  const startTournament = () => {
    if (selectedUsers.length % 2 !== 0) {
      toast.error('Invalid User count!', {
        description: "Please select an even number or Participants"
      });
    } else if (selectedUsers.length === 0) {
      toast.error(`Invalid User Count!`, {
        description: "Please Select at least 2 participants"
      });
    } else {
      running = true;
    }
  }

</script>

<Card.Root class="h-full">
  <Card.Header>
    <Card.Title>{$t('tournament.tournament')}</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col gap-4 h-full">
    {#if !running}
      <div class='flex flex-col justify-evenly overflow-y-scroll md:grid md:grid-cols-2 gap-4 h-full'>
        <Grid title={$t('tournament.available')}>
          {#each availableUsers as u}
            <GridCard title={u.name} avatarUrl={u.avatarUrl ?? undefined} callback={() => toggleUserSelected(u)}/>
          {/each}
        </Grid>
        <Grid title={$t('tournament.selected')}>
          {#each selectedUsers as u}
            <GridCard title={u.name} callback={() => toggleUserSelected(u)} buttonDesc='Remove'/>
          {/each}
        </Grid>
        {#if error}
          <div class="col-span-2 justify-center place-items-center flex">
            <Alert class="max-w-[40%]">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        {/if}
      </div>
      <Separator />
      <div class='flex w-full justify-end'>
        <Button size='lg' onclick={startTournament}>{$t('tournament.start')}</Button>
      </div>
    {:else}
      <Tournament players={selectedUsers} />
    {/if}
  </Card.Content>
</Card.Root>
