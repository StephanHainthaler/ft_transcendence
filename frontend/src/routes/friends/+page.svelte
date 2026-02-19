<script lang="ts">
  import { client } from "@lib/api/index.svelte";
  import type { Friendship } from "@shared/user";
  import Grid from "@lib/components/custom/Grid.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import Button from "@lib/components/ui/button/button.svelte";
  import { onDestroy, onMount } from "svelte";
  import * as Card from "@lib/components/ui/card";
  import {t} from "@lib/i18n/i18n";
  import type { AppUser } from "@lib/api/appUser";
  import { toast } from "svelte-sonner";
  import { isAppError } from "@lib/types/error";

  const removeFriendship = async (friendShipId: number) => {
    try {
      await client.removeFriendship(friendShipId);
    } catch (e: any) {
      toast.error($t('friends.remove_fail', 'Failed to remove friendship'));
    } finally {
      await loadPageData();
    }
  }

  const acceptFriendRequest = async (friendShipId: number) => {
    try {
      await client.acceptFriendRequest(friendShipId);
      accepted = [...accepted, pendingRec.find(p => p.id === friendShipId)!];
      pendingRec = pendingRec.filter(p => p.id !== friendShipId);
    } catch(e: any) {
      toast.error($t('friends.accept_fail', 'Failed to accept friendship'));
    }
  }

  const sendFriendRequest = async (friendId: number) => {
    try {
      const friend = users.find(f => f.id === friendId);
      if (!friend) throw Object.assign(new Error('doesnt_exist'), {isAppError: true});
      const friendship = await client.sendFriendRequest(friendId);

      friends.push(friend);
      users = users.filter(u => u.id !== friendId);
      pendingSend.push(friendship);
    } catch (e: any) {
      if (isAppError(e))
        toast.error($t('friends.send_fail', 'Failed to send friendship request'), {
          description: $t('friends.' + e.message, e.message) || ""
        });
      else
        toast.error($t('friends.send_fail', 'Failed to send friendship request'));
    }
  }

  let users: AppUser[] = $state([])
  let accepted: Friendship[] = $state([])
  let pendingSend: Friendship[] = $state([])
  let pendingRec: Friendship[] = $state([])
  let { friends, friendships }: { friends: AppUser[], friendships: Friendship[] } = $state({friends: [], friendships: []});

  const intervalHandler = setInterval(async () => {
    await loadPageData();
  }, 30 * 1000)

  const loadPageData = async () => {
    try {
      const data = await client.getFriends();
      users = (await client.getUsers()).filter(u => u.id !== client.user?.id);
      friends = data.friends.filter(f => f.id !== client.user?.id);
      friendships = data.friendships;
      accepted = friendships.filter(f => f.status === 'accepted');
      pendingSend = friendships.filter(f => f.status === 'pending' && f.user_from_id === client.user?.id);
      pendingRec = friendships.filter(f => f.status === 'pending' && f.user_to_id === client.user?.id);
    } catch {
      toast.error($t('friends.load_fail', 'Failed to load friends'));
    }
  }

  onMount(async () => {
    await client.checkOnlineStatus()
    await loadPageData();
  })

  onDestroy(() => clearInterval(intervalHandler))
</script>

<Card.Root class="flex-1 min-h-0 flex flex-col h-full">
  <Card.Header>
    <Card.Title>{$t('friends.card_title', 'Friends')}</Card.Title>
  </Card.Header>
  <Card.Content class="flex-1 min-h-0 overflow-hidden">
    <div class='h-full grid grid-cols-1 grid-rows-4 md:grid-rows-2 md:grid-cols-2 gap-2 p-2 md:p-8'>
      <Grid title={$t('friends.send', 'Send Requests')}>
        {#each users as u}
          {#if !friends.find(fr => fr.id === u.id)}
            <GridCard 
              title={u.name} 
              buttonDesc={$t('friends.add', 'Add Friend')} 
              callback={async () => await sendFriendRequest(u.id)}
            />
          {/if}
        {/each}
      </Grid>

      <Grid title={$t('friends.card_title', 'Friends List')}>
        {#each accepted as a}
          <GridCard 
            isOnline={!!client.onlineFriends.find(f => f !== client.user?.id && (a.user_to_id === f || a.user_from_id === f))}
            title={friends.find(u => u.id === a.user_to_id || u.id === a.user_from_id)?.name ?? '?'}
            buttonDesc={$t('friends.remove', 'Remove')} 
            callback={async () => await removeFriendship(a.id)}
          />
        {/each}
      </Grid>

      <Grid title={$t('friends.cancel', 'Pending Sent')}>
        {#each pendingSend as p}
          <GridCard 
            title={friends.find(u => u.id === p.user_to_id)?.name ?? '?'} 
            buttonDesc={$t('friends.cancel', 'Cancel Request')} 
            callback={async () => await removeFriendship(p.id)}
          />
        {/each}
      </Grid>

      <Grid title={$t('friends.accept', 'Pending Received')}>
        {#each pendingRec as u}
          <GridCard 
            title={friends.find(fr => fr.id === u.user_from_id)?.name ?? '?'} 
            buttonDesc={$t('friends.reject', 'Reject')} 
            callback={async () => await removeFriendship(u.id)}
          >
            {#snippet extraBtn()}
              <Button class='btn primary sm' onclick={async () => await acceptFriendRequest(u.id)}>
                {$t('friends.accept', 'Accept')}
              </Button>
            {/snippet}
          </GridCard>
        {/each}
      </Grid>
    </div>
  </Card.Content>
</Card.Root>