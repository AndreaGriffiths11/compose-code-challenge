import { HTMLRewriter } from 'https://ghuc.cc/worker-tools/html-rewriter/index.ts';
import { Config, Context } from '@netlify/edge-functions';
import data from '../data.json' with { type: 'json' };

export default async (_request: Request, context: Context) => {
  const resp = await context.next();

  // For convenience, the build stashed the repo URL in the site metadata for us
  // to use
  const repoURL = data.default.repoURL;
  if (!repoURL) {
    // No repoURL will have been stashed unless we ran `ntl build` locally,
    // or the site was deployed to Netlify
    console.log('No repoURL found. Run `ntl build` first to enable this feature locally.');
    return resp;
  }

  const rewriter = new HTMLRewriter()
    .on('*[data-nf-enhance="repo-link"]', new RepoLinkHandler(repoURL))
    .on('*[data-nf-enhance="repo-link-index.html"]', new RepoLinkIndexHandler(repoURL));

  return rewriter.transform(resp);
};

class RepoLinkHandler {
  constructor(private repoURL: string) {}

  element(element: Element) {
    element.prepend(`<a href="${this.repoURL}" target="_blank">`, { html: true });
    element.append(`</a>`, { html: true });
    element.removeAndKeepContent();
  }
}

class RepoLinkIndexHandler {
  constructor(private repoURL: string) {}

  element(element: Element) {
    element.prepend(`<a href="${this.repoURL}/blob/main/www/index.html" target="_blank">`, { html: true });
    element.append(`</a>`, { html: true });
    element.removeAndKeepContent();
  }
}

export const config: Config = {
  path: '/',
  onError: 'bypass',
};
