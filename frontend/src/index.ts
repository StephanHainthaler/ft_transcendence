import { router } from "./routes/router";

try {
  console.log(import.meta.env.VITE_API_URL);
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="/"]');

    if (link) {
      e.preventDefault();
      const ref = link.getAttribute('href');
      if (ref) {
        await router.goto(ref);
      }
    }
  });

  (async () => {
    if (router.location !== window.location.pathname) {
      await router.goto('/');
    } else {
      await router.refresh();
    }

    window.addEventListener('popstate', async () => {
      await router.goto(window.location.pathname, true);
    })
  })();
} catch (e: any) {

}
