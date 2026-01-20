<script lang="ts">
  import { client } from "@lib/api";
  import type { Friendship, User } from "@shared/user";
  import Grid from "@lib/components/custom/Grid.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import Button from "@lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";
  import * as Card from "@lib/components/ui/card";
  import {t} from "@lib/i18n/i18n";

  let requestMade = false;
  let sending = false;
  let success = false;

  let errorMessage = '';

  const removeFriendship = async (friendShipId: number) => {
    sending = true;
    requestMade = true;
    try {
      await client.removeFriendship(friendShipId);
      success = true;
    } catch (e: any) {
      errorMessage = e.message || String(e);
      success = false;
    } finally {
      await loadPageData();
      requestMade = false;
      sending = false;
    }
  }

  const acceptFriendRequest = async (friendShipId: number) => {
    sending = true;
    requestMade = true;
    try {
      await client.acceptFriendRequest(friendShipId);
      accepted = [...accepted, pendingRec.find(p => p.id === friendShipId)!];
      pendingRec = pendingRec.filter(p => p.id !== friendShipId);
      success = true;
    } catch(e: any) {
      errorMessage = e.message || String(e);
      sending = false;
      success = false;
    } finally {
      requestMade = false;
      sending = false;
    }
  }

  const sendFriendRequest = async (friendId: number) => {
    requestMade = true;
    sending = true;
    try {
      console.log('looking for id', friendId);
      const friend = users.find(f => f.id === friendId);
      if (!friend) throw new Error('Person doenst exist');
      const friendship = await client.sendFriendRequest(friendId);

      friends.push(friend);
      users = users.filter(u => u.id !== friendId);
      pendingSend.push(friendship);
      success = true;
    } catch (e: any) {
      errorMessage = e.message || String(e);
      sending = false;
      success = false;
    } finally {
      logState();
      requestMade = false;
      sending = false;
    }
  }

  let users: User[] = $state([])
  let accepted: Friendship[] = $state([])
  let pendingSend: Friendship[] = $state([])
  let pendingRec: Friendship[] = $state([])
  let { friends, friendships }: { friends: User[], friendships: Friendship[]} = $state({friends: [], friendships: []});

  const logState = () => {
    console.log('userid: ', client.user);
    console.log('users: ', users);
    console.log('friends', friends);
    console.log('friendships', friendships);
    console.log('accepted: ', accepted, '\npendingSend: ', pendingSend, '\npendingRec: ', pendingRec);
  }

  const loadPageData = async () => {
    const data = await client.getFriends();
    users = (await client.getUsers()).filter(u => u.id !== client.user?.id);
    friends = data.friends.filter(f => f.id !== client.user?.id);
    friendships = data.friendships;
    accepted = friendships.filter(f => f.status === 'accepted');
    pendingSend = friendships.filter(f => f.status === 'pending' && f.user_from_id === client.user?.id);
    pendingRec = friendships.filter(f => f.status === 'pending' && f.user_to_id === client.user?.id);
    logState();
  }

  onMount(async () => {
    await loadPageData();
  })
</script>

<div class='size-full page-container'>
  <Card.Root>
    <Card.Header>
      <Card.Title>{$t('friends.card_title')}</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class='size-full card flex flex-col md:grid md:grid-cols-2 justify-evenly bg-tan gap-2 p-2 md:p-8 overflow-y-scroll'>
        <Grid title={$t('friends.send')}>
          {#each users as u}
            {#if !friends.find(fr => fr.id === u.id)}
              <GridCard title={u.name} buttonDesc={$t('friends.add')} callback={async () => await sendFriendRequest(u.id)}/>
            {/if}
          {/each}
        </Grid>

        <Grid title={$t('friends.card_title')}>
          {#each accepted as a}
            <GridCard title={friends.find(u => u.id === a.user_to_id || u.id === a.user_from_id)!.name} buttonDesc={$t('friends.remove')} callback={async () => await removeFriendship(a.id)}/>
          {/each}
        </Grid>

        <Grid title={$t('friends.cancel')}>
          {#each pendingSend as p}
            <GridCard title={friends.find(u => u.id === p.user_to_id)!.name} buttonDesc={'Cancel'} callback={async () => await removeFriendship(p.id)}/>
          {/each}
        </Grid>

        <Grid title={$t('friends.accept')}>
          {#each pendingRec as u}
            <GridCard title={friends.find(fr => fr.id === u.user_from_id)!?.name} buttonDesc={$t('friends.reject')} callback={async () => await removeFriendship(u.id)}>
              {#snippet extraBtn()}
                <Button class='btn primary sm' onclick={async () => await acceptFriendRequest(u.id)}>{$t('friends.accept')}</Button>
              {/snippet}
            </GridCard>
          {/each}
        </Grid>
      </div>
    </Card.Content>
  </Card.Root>
</div>

