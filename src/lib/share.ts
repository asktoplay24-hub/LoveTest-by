export async function shareOrCopy(opts: { title: string; text: string; url: string }): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share) {
      await navigator.share(opts);
      return 'shared';
    }
    await navigator.clipboard.writeText(`${opts.text} ${opts.url}`.trim());
    return 'copied';
  } catch {
    return 'failed';
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
