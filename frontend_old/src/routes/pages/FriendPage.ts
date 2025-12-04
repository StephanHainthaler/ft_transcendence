import { client } from "@lib/index";
import { Alert } from "@lib/components/ui/Alert";
import { UserCard } from "@lib/components/ui/UserCard";
import type { Route } from "@lib/types/route";
import { button, div, h1, updateId, type Child } from "@lib/vdom";
import type { Friendship, User } from "@shared/user";
import { Layout } from "@lib/components/layout";

let requestMade = false;
let sending = false;
let success = false;

let errorMessage = '';

const RequestBlock = (title: string, ...children: Child[]) => {
  return (
    div({ class: 'size-full flex flex-col gap-2 card p-2 bg-cream' },
      div({ class: 'w-full card p-2 bg-teal' },
        h1({ class: 'text-lg text-cream font-bold' }, title),
      ),
      div({ class: 'size-full flex flex-col gap-2 card p-2 bg-sage'},
        ...children.filter(c => c !== undefined)
      )
    )
  )
}

const PageContent = () => {
  return (
    div({ id: 'dyn-friend-page-content', class: 'size-full card flex flex-col md:grid md:grid-cols-2 justify-evenly bg-tan gap-2 p-2 md:p-8 overflow-y-scroll' },
      RequestBlock('Send',
        ...users.map(u => {
          return !!!friends.find(fr => fr.id === u.id)
            ? UserCard(u, 'Add', async (u) => await sendFriendRequest(u.id))
            : undefined
        })
      ),
      RequestBlock('Friends',
        ...accepted.map(a => UserCard(friends.find(u => u.id === a.user_to_id || u.id === a.user_from_id)!, 'Remove', async () => { await removeFriendship(a.id!) })),
      ),
      RequestBlock('Pending',
        ...pendingSend.map(a => UserCard(friends.find(u => u.id === a.user_to_id)!, 'Cancel', async () => { await removeFriendship(a.id!) })),
      ),
      RequestBlock('Received',
        ...pendingRec.map(a =>
          UserCard(
            friends.find(u => u.id === a.user_from_id)!,
            'Reject',
            async () => { await removeFriendship(a.id!) },
            button({ class: 'btn primary sm', onclick: async () => await acceptFriendRequest(a.id) }, 'Accept'),
          )
        ),
      ),
      Alert({
        title: 'Processing request',
        show: requestMade,
      },
        (sending === false && success === false
            ? div({ }, errorMessage)
            : sending === false && success === true
            ? div({ }, 'Success')
            : undefined
        ),
      )
    )
  )
}

const removeFriendship = async (friendShipId: number) => {
  sending = true;
  requestMade = true;
  updateId(PageContent());
  try {
    await client.removeFriendship(friendShipId);
    success = true;
  } catch (e: any) {
    errorMessage = e.message || String(e);
    success = false;
  } finally {
    setTimeout(async () => {
      await loadPageData();
      requestMade = false;
      sending = false;
      updateId(PageContent());
    }, 1000);
  }
}

const acceptFriendRequest = async (friendShipId: number) => {
  sending = true;
  requestMade = true;
  updateId(PageContent());
  try {
    await client.acceptFriendRequest(friendShipId);
    accepted = [...accepted, pendingRec.find(p => p.id === friendShipId)!];
    pendingRec = pendingRec.filter(p => p.id !== friendShipId);
    success = true;
    updateId(PageContent());
  } catch(e: any) {
    errorMessage = e.message || String(e);
    sending = false;
    success = false;
    updateId(PageContent())
  } finally {
    setTimeout(() => {
      requestMade = false;
      sending = false;
      updateId(PageContent());
    }, 1000);
  }
}

const sendFriendRequest = async (friendId: number) => {
  requestMade = true;
  sending = true;
  updateId(PageContent());
  try {
    console.log('looking for id', friendId);
    const friend = users.find(f => f.id === friendId);
    if (!friend) throw new Error('Person doenst exist');
    const friendship = await client.sendFriendRequest(friendId);

    friends.push(friend);
    users = users.filter(u => u.id !== friendId);
    pendingSend.push(friendship);
    success = true;
    updateId(PageContent());
  } catch (e: any) {
    errorMessage = e.message || String(e);
    sending = false;
    success = false;
    updateId(PageContent());
  } finally {
    logState();
    setTimeout(async () => {
      requestMade = false;
      sending = false;
      updateId(PageContent());
    }, 1000);
  }
}

export const Page: Route = () => {
  console.log('running friend page');
  users = []
  accepted = []
  pendingSend = []
  pendingRec = []
  loadPageData();
  return Layout(
    div({ id: '', class: 'size-full page-container' },
      PageContent()
    )
  )
}

let users: User[] = []
let accepted: Friendship[] = []
let pendingSend: Friendship[] = []
let pendingRec: Friendship[] = []
let { friends, friendships }: { friends: User[], friendships: Friendship[]} = {friends: [], friendships: []};

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
  updateId(PageContent());
}

await loadPageData();
