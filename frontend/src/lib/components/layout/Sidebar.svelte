<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { client } from "@lib/api";
  import {t, currentLocale} from "@lib/i18n/i18n";

  let isLoggedIn = $state(client?.isLoggedIn || false);

  const handleLogout = () => {
    client.logout();
  };

  client?.onChange(() => {
  isLoggedIn = client.isLoggedIn;

  const changeLang = async (lang: string) => {
    await t.changeLanguage(lang);
    currentLocale.set(lang);
  };
});

 </script>

<Sidebar.Root>
  <Sidebar.Header>
    <h1 class="text-2xl font-bold">
      <a href="/">{$t('main_name')}</a>
    </h1>
  </Sidebar.Header>

  <Sidebar.Content>
      {#if isLoggedIn}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{$t('sidebar.routes')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                <a class="px-4 w-full" href="/profile">{$t('sidebar.profile')}</a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                <a class="px-4 w-full" href="/game">{$t('sidebar.game')}</a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            
            <Sidebar.MenuItem> <Sidebar.MenuButton>
              <a class="px-4 w-full" href="/tournament">{$t('sidebar.tournament')}</a>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                <a class="px-4 w-full" href="/friends">{$t('sidebar.friends')}</a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

            <Sidebar.MenuItem> <Sidebar.MenuButton>
                <a class="px-4 w-full" href="/stats">{$t('sidebar.statistics')}</a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
      <Sidebar.Separator />
      {/if}

      <Sidebar.Group>
        <Sidebar.GroupLabel>{$t('sidebar.account')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#if isLoggedIn}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton onclick={handleLogout}>
                  <span class="px-4 w-full">{$t('sidebar.logout')}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {:else}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  <a class="px-4 w-full" href="/auth">{$t('sidebar.login')}</a>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/if}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
      <Sidebar.Separator />

      <Sidebar.Group>
        <Sidebar.GroupLabel>{$t('sidebar.language')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <div class="flex gap-4 px-4 py-2 justify-around">
              <button onclick={() => t.changeLanguage('en')} class="flex flex-col items-center hover:opacity-80 transition-opacity">
                <span class="text-xl">🇺🇸</span>
                <span class="text-[10px] font-bold text-slate-500">EN</span>
              </button>

              <button onclick={() => t.changeLanguage('ukr')} class="flex flex-col items-center hover:opacity-80 transition-opacity">
                <span class="text-xl">🇺🇦</span>
                <span class="text-[10px] font-bold text-slate-500">UA</span>
              </button>

              <button onclick={() => t.changeLanguage('de')} class="flex flex-col items-center hover:opacity-80 transition-opacity">
                <span class="text-xl">🇩🇪</span>
                <span class="text-[10px] font-bold text-slate-500">DE</span>
              </button>
            </div>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>

  </Sidebar.Content>
</Sidebar.Root>
