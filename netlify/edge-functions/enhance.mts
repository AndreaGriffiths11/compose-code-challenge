import { HTMLRewriter } from 'https://ghuc.cc/worker-tools/html-rewriter/index.ts';
import { Config, Context } from '@netlify/edge-functions';
import data from '../data.json' with { type: 'json' };

export default async (_request: Request, context: Context) => {
  const resp = await context.next();

  const repoURL = data.default.repoURL;
  if (!repoURL) {
    console.log('No repoURL found. Run `ntl build` first to enable this feature locally.');
    return resp;
  }

  const rewriter = new HTMLRewriter()
    .on('*[data-nf-enhance="repo-link"]', new RepoLinkHandler(repoURL))
    .on('*[data-nf-enhance="repo-link-index.html"]', new RepoLinkIndexHandler(repoURL));

  return rewriter.transform(resp);
};

class RepoLinkHandler {
  private repoURL: string;

  constructor(repoURL: string) {
    this.repoURL = repoURL;
  }

  element(element: Element) {
    element.prepend(`<a href="${this.repoURL}" target="_blank">`, { html: true });
    element.append(`</a>`, { html: true });
    element.removeAndKeepContent();
  }
}

class RepoLinkIndexHandler {
  private repoURL: string;

  constructor(repoURL: string) {
    this.repoURL = repoURL;
  }

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
